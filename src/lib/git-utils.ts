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

    // Build authenticated remote URL
    remoteUrlWithAuth = repoUrl.replace(
      "https://",
      `https://${username}:${token}@`,
    );

    // Clone repo into ./repo folder
    git = simpleGit();

    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.clone(remoteUrlWithAuth, "repo");
    }

    git = simpleGit("repo");

    // Set Git config (required by GitHub)
    await git.addConfig("user.name", username);
    await git.addConfig("user.email", `${username}@users.noreply.github.com`);

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

    for (const file of files) {
      const filePath = path.join(baseDir, file.name);
      await fs.writeFile(filePath, file.content);
      await git.add(filePath);
    }

    await git.commit(commitMessage);

    const currentBranch = (await git.branch()).current;

    // Push using remote URL with auth explicitly
    await git.push(remoteUrlWithAuth, currentBranch);

    return true;
  } catch (error) {
    console.error("❌ Git commit/push failed:", error);
    return false;
  }
}
