import React, { useState } from "react";
import { initGit } from "@/lib/git-utils"; // adjust if not using alias

const GitTestPage: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("https://github.com/shadowfaxop/crazy-project-tempoai.git");
  const [username, setUsername] = useState("shadowfaxop");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const testInitGit = async () => {
    console.log("🧪 Triggering API");
  
    setStatus("⏳ Calling backend API...");
  
    try {
      const res = await fetch("http://localhost:4000/api/init-git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, username, token }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        setStatus("✅ Git initialized successfully!");
      } else {
        setStatus(`❌ Git init failed: ${data.error}`);
      }
    } catch (err: any) {
      setStatus(`❌ Network/API error: ${err.message}`);
    }
  };

  const createBranch = async () => {
    const res = await fetch("http://localhost:4000/api/create-branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchName: "test-branch" }),
    });
  
    const data = await res.json();
    if (data.success) {
      setStatus("🌿 Branch created successfully!");
    } else {
      setStatus("❌ Branch creation failed: " + data.error);
    }
  };

  const pushFile = async () => {
    const res = await fetch("http://localhost:4000/api/commit-and-push", {
      method: "POST",
    });
  
    const data = await res.json();
    if (data.success) {
      setStatus("📤 Commit and push successful!");
    } else {
      setStatus("❌ Push failed: " + data.error);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2>🧪 Git Init Test Page</h2>

      <div style={{ marginTop: "1rem" }}>
        <label>GitHub Repository URL:</label>
        <input
          style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>GitHub Username:</label>
        <input
          style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>GitHub Token:</label>
        <input
          type="password"
          style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>

      <button
        style={{
          marginTop: "1.5rem",
          padding: "10px 20px",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={testInitGit}
      >
        🚀 Test Git Init
      </button>

      <button onClick={createBranch} style={{ marginTop: "1rem" }}>
  🌿 Create Test Branch
</button>
<button
  onClick={pushFile}
  style={{
    marginTop: "1rem",
    padding: "10px 20px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  📤 Commit + Push Test File
</button>

      {status && (
        <p style={{ marginTop: "1rem", fontWeight: "bold", color: status.startsWith("✅") ? "green" : "red" }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default GitTestPage;
