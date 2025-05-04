import simpleGit, { SimpleGit } from "simple-git";

// Initialize git client
let git: SimpleGit | null = null;

export async function initGit(
  repoUrl: string,
  username: string,
  token: string,
): Promise<boolean> {
  try {
    // Configure git with credentials
    const authRepoUrl = repoUrl.replace(
      "https://",
      `https://${username}:${token}@`,
    );

    // Initialize git
    git = simpleGit();

    // Check if git is already initialized
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      // Clone the repository
      await git.clone(authRepoUrl, "repo");
      git = simpleGit("repo");
    }

    // Configure git user
    await git.addConfig("user.name", username);
    await git.addConfig("user.email", `${username}@github.com`);

    return true;
  } catch (error) {
    console.error("Error initializing git:", error);
    return false;
  }
}

export async function createBranch(branchName: string): Promise<boolean> {
  if (!git) return false;

  try {
    // Fetch latest changes
    await git.fetch();

    // Check if branch exists
    const branches = await git.branch();

    if (branches.all.includes(branchName)) {
      // Checkout existing branch
      await git.checkout(branchName);
    } else {
      // Create and checkout new branch
      await git.checkoutLocalBranch(branchName);
    }

    return true;
  } catch (error) {
    console.error("Error creating branch:", error);
    return false;
  }
}

export async function commitAndPushFiles(
  files: { name: string; content: string }[],
  commitMessage: string,
  directory: string = "",
): Promise<boolean> {
  if (!git) return false;

  try {
    // Create directory if it doesn't exist
    const fs = await import("fs/promises");
    const path = await import("path");

    const baseDir = path.join("repo", directory);

    try {
      await fs.mkdir(baseDir, { recursive: true });
    } catch (err) {
      console.log("Directory already exists or could not be created");
    }

    // Write files
    for (const file of files) {
      const filePath = path.join(baseDir, file.name);
      await fs.writeFile(filePath, file.content);
      await git.add(filePath);
    }

    // Commit changes
    await git.commit(commitMessage);

    // Push changes
    await git.push(
      "origin",
      git.branch().then((b) => b.current),
    );

    return true;
  } catch (error) {
    console.error("Error committing and pushing files:", error);
    return false;
  }
}
