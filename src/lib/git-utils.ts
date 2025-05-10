import simpleGit, { SimpleGit } from "simple-git";
import fs from "fs/promises";
import path from "path";

// Global Git client
let git: SimpleGit | null = null;
let remoteUrlWithAuth = ""; // Used during push

export async function initGit(
  repoUrl: string,
  username: string,
  token: string,
): Promise<boolean> {
  try {
    // Ensure .git suffix
    if (!repoUrl.endsWith(".git")) {
      repoUrl += ".git";
    }

    // Encode token for special characters
    const encodedToken = encodeURIComponent(token);
    remoteUrlWithAuth = repoUrl.replace(
      "https://",
      `https://${username}:${encodedToken}@`,
    );

    console.log("🔧 [initGit] Starting Git init with repo:", repoUrl);
    console.log("🔐 [initGit] Using authenticated remote:", remoteUrlWithAuth);

    // Init Git with timeout
    git = simpleGit({ timeout: 30000 });

    try {
      await fs.access("repo");
      git = simpleGit("repo", { timeout: 30000 });
      const isRepo = await git.checkIsRepo();

      if (!isRepo) {
        console.warn("⚠️ Not a Git repo. Re-cloning...");
        await fs.rm("repo", { recursive: true, force: true });
        git = simpleGit({ timeout: 30000 });
        await git.clone(remoteUrlWithAuth, "repo");
        git = simpleGit("repo", { timeout: 30000 });
      } else {
        await git.remote(["set-url", "origin", remoteUrlWithAuth]);
        await git.fetch();
        console.log("📦 Fetched remote repo updates.");
      }
    } catch (fsErr) {
      console.log("📂 Directory missing. Cloning...");
      await git.clone(remoteUrlWithAuth, "repo");
      git = simpleGit("repo", { timeout: 30000 });
    }

    // Git config
    await git.addConfig("user.name", username);
    await git.addConfig("user.email", `${username}@users.noreply.github.com`);

    // Simple connectivity test
    await git.fetch(["--depth=1"]);

    console.log("✅ Git repo initialized successfully.");
    return true;
  } catch (error: any) {
    console.error("❌ Git init failed");
    console.error("🧾 Error:", error.message);
    console.error("📚 Stack:", error.stack);
    return false;
  }
}

export async function createBranch(branchName: string): Promise<boolean> {
  if (!git) return false;

  try {
    await git.fetch();
    const branches = await git.branch();

    if (branches.all.includes(branchName)) {
      await git.checkout(branchName);
    } else {
      await git.checkoutLocalBranch(branchName);
    }

    return true;
  } catch (error) {
    console.error("❌ Git branch error:", error);
    return false;
  }
}

export async function commitAndPushFiles(
  files: { name: string; content: string }[],
  commitMessage: string,
  directory = "",
): Promise<boolean> {
  if (!git) return false;

  try {
    const baseDir = path.join("repo", directory);
    await fs.mkdir(baseDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(baseDir, file.name);
      await fs.writeFile(filePath, file.content);
      // Use relative path from inside repo for cross-platform safety
      const relativeFilePath = path.relative("repo", filePath).replace(/\\/g, "/");
      await git.add(relativeFilePath);
    }

    const status = await git.status();
    if (status.files.length === 0) {
      console.log("ℹ️ No changes to commit.");
      return true;
    }

    await git.commit(commitMessage);
    const currentBranch = (await git.branch()).current;
    await git.push(remoteUrlWithAuth, currentBranch, ["--force"]);

    console.log(`✅ Pushed to ${currentBranch}`);
    return true;
  } catch (error) {
    console.error("❌ Git commit/push failed:", error);
    return false;
  }
}
