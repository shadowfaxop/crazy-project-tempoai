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
    // Make sure URL ends with .git
    if (!repoUrl.endsWith(".git")) {
      repoUrl += ".git";
    }

    // Build authenticated remote URL with proper token format
    // Ensure special characters in username and token are properly encoded
    const encodedToken = encodeURIComponent(token);
    remoteUrlWithAuth = repoUrl.replace(
      "https://",
      `https://${username}:${encodedToken}@`,
    );

    // Initialize git client with increased timeout
    git = simpleGit({ timeout: 30000 });

    // Check if repo directory exists and is a git repo
    try {
      await fs.access("repo");
      git = simpleGit("repo", { timeout: 30000 });
      const isRepo = await git.checkIsRepo();

      if (!isRepo) {
        // Remove directory if it exists but is not a git repo
        await fs.rm("repo", { recursive: true, force: true });
        git = simpleGit({ timeout: 30000 });
        console.log("Cloning repository...");
        await git.clone(remoteUrlWithAuth, "repo");
        git = simpleGit("repo", { timeout: 30000 });
      } else {
        // If it's a repo, update remote URL with auth
        await git.remote(["set-url", "origin", remoteUrlWithAuth]);
        console.log("Fetching from remote...");
        await git.fetch();
      }
    } catch (err) {
      // Directory doesn't exist, clone fresh
      console.log("Cloning fresh repository...");
      await git.clone(remoteUrlWithAuth, "repo");
      git = simpleGit("repo", { timeout: 30000 });
    }

    // Set Git config (required by GitHub)
    await git.addConfig("user.name", username);
    await git.addConfig("user.email", `${username}@users.noreply.github.com`);

    // Test connection with a simple git operation
    await git.fetch(["--depth=1"]);

    console.log("✅ Git repository initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Git init failed:", error);
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

    // Add all files to git
    for (const file of files) {
      const filePath = path.join(baseDir, file.name);
      await fs.writeFile(filePath, file.content);
      await git.add(filePath);
    }

    // Check if there are changes to commit
    const status = await git.status();
    if (status.files.length === 0) {
      console.log("No changes to commit");
      return true; // No changes is not an error
    }

    await git.commit(commitMessage);

    const currentBranch = (await git.branch()).current;

    // Push using remote URL with auth explicitly
    await git.push(remoteUrlWithAuth, currentBranch, ["--force"]);
    console.log(`✅ Successfully pushed to ${currentBranch}`);

    return true;
  } catch (error) {
    console.error("❌ Git commit/push failed:", error);
    return false;
  }
}
