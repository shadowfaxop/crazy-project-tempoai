import express from "express";
import cors from "cors";
import {
  initGit,
  createBranch,
  commitAndPushFiles,
} from "./src/lib/git-utils";

const app = express();
app.use(cors());
app.use(express.json());

// Store state (in-memory, better to persist in DB or file in production)
let lastGitAuth = {
  repoUrl: "",
  username: "",
  token: "",
};

app.post("/api/init-git", async (req, res) => {
  const { repoUrl, username, token } = req.body;

  try {
    console.log("📥 init-git called:", repoUrl, username);
    const success = await initGit(repoUrl, username, token);

    if (success) {
      lastGitAuth = { repoUrl, username, token }; // store for later
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: "Git init failed" });
    }
  } catch (err: any) {
    console.error("💥 Git init error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/push-terraform", async (req, res) => {
  const { region, files } = req.body;

  if (!region || !files || !Array.isArray(files)) {
    return res.status(400).json({ success: false, error: "Invalid payload" });
  }

  try {
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const branchName = `terraform_modules_${today}`;
    const folder = `terraform/modules/${region}/${today}`;

    // Ensure git is ready
    console.log("📦 Re-initializing Git for push...");
    const reinit = await initGit(
      lastGitAuth.repoUrl,
      lastGitAuth.username,
      lastGitAuth.token
    );

    if (!reinit) {
      return res
        .status(500)
        .json({ success: false, error: "Git re-init failed" });
    }

    const branchOK = await createBranch(branchName);
    if (!branchOK) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to create or checkout branch" });
    }

    const pushed = await commitAndPushFiles(
      files,
      `Add Terraform modules for ${region} - ${today}`,
      folder
    );

    if (pushed) {
      res.json({ success: true, branch: branchName });
    } else {
      res.status(500).json({ success: false, error: "Git push failed" });
    }
  } catch (err: any) {
    console.error("❌ Push Terraform failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening at http://localhost:${PORT}`);
});
