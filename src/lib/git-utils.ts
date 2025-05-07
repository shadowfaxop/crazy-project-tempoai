import simpleGit, { SimpleGit } from "simple-git";
import fs from "fs/promises";
import path from "path";

// Global Git client
let git: SimpleGit | null = null;
let remoteUrlWithAuth = ""; // Used during push

/**
 * Initializes Git repository using authenticated HTTPS URL.
 */
export async function initGit(
  repoUrl: string,
  username: string,
  token: string
): Promise<boolean> {
  try {
    if (!repoUrl.endsWith(".git")) {
      repoUrl += ".git";
    }

    const encodedToken = encodeURIComponent(token);
    remoteUrlWithAuth = repoUrl.replace(
      "https://",
      `https://${username}:${encodedToken}@`
    );

    const repoPath = path.resolve("repo");
    git = simpleGit({ timeout: 30000 });

    try {
      await fs.access(repoPath);
      git = simpleGit(repoPath, { timeout: 30000 });

      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        console.warn("⚠️ Not a valid git repo, recloning...");
        await fs.rm(repoPath, { recursive: true, force: true });
        git = simpleGit({ timeout: 30000 });
        await git.clone(remoteUrlWithAuth, "repo");
        git = simpleGit(repoPath, { timeout: 30000 });
      } else {
        console.log("📁 Existing repo found. Updating origin...");
        await git.remote(["set-url", "origin", remoteUrlWithAuth]);
        await git.fetch();
      }
    } catch {
      console.log("📦 Cloning fresh repository...");
      await git.clone(remoteUrlWithAuth, "repo");
      git = simpleGit(repoPath, { timeout: 30000 });
    }

    await git.addConfig("user.name", username);
    await git.addConfig("user.email", `${username}@users.noreply.github.com`);

    await git.fetch(["--depth=1"]);
    console.log("✅ Git repository initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Git init failed:", error);
    return false;
  }
}

/**
 * Creates or checks out a Git branch safely.
 */
export async function createBranch(branchName: string): Promise<boolean> {
  if (!git) {
    console.error("❌ Git client not initialized");
    return false;
  }

  try {
    await git.fetch();
    const branches = await git.branch(["-a"]);

    if (branches.all.includes(branchName) || branches.all.includes(`remotes/origin/${branchName}`)) {
      console.log("📌 Branch exists. Checking out...");
      await git.checkout(branchName);
    } else {
      console.log("🌿 Creating new branch:", branchName);
      await git.checkoutLocalBranch(branchName);
    }

    return true;
  } catch (error: any) {
    console.error("❌ Git branch error:", error.message);
    return false;
  }
}

/**
 * Commits and pushes files to the current branch.
 */
export async function commitAndPushFiles(
  files: { name: string; content: string }[],
  commitMessage: string,
  directory = ""
): Promise<boolean> {
  if (!git) {
    console.error("❌ Git client not initialized");
    return false;
  }

  try {
    const baseDir = path.join("repo", directory);
    await fs.mkdir(baseDir, { recursive: true });

    const relativePaths: string[] = [];

    for (const file of files) {
      const fullPath = path.join(baseDir, file.name);
      const relativePath = path.join(directory, file.name).replace(/\\/g, "/");
      await fs.writeFile(fullPath, file.content);
      relativePaths.push(relativePath);
    }

    await git.add(relativePaths);

    const status = await git.status();
    if (status.files.length === 0) {
      console.log("ℹ️ No changes to commit.");
      return true;
    }

    await git.commit(commitMessage);
    const currentBranch = (await git.branch()).current;

    await git.push(remoteUrlWithAuth, currentBranch, ["--force"]);
    console.log(`✅ Successfully pushed to ${currentBranch}`);

    return true;
  } catch (error) {
    console.error("❌ Git commit/push failed:", error);
    return false;
  }
}
