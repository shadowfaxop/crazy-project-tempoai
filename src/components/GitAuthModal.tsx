import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GitAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const GitAuthModal: React.FC<GitAuthModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/shadowfaxop/crazy-project-tempoai.git"
  );
  const [username, setUsername] = useState("shadowfaxop");
  const [token, setToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!repoUrl || !username || !token) {
      setError("Please fill in all fields");
      return;
    }

    setIsConnecting(true);
    setStatus("🔄 Connecting...");
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/api/init-git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, username, token }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Connected!");
        onSuccess();
        onOpenChange(false);
      } else {
        setStatus("❌ Failed: " + data.error);
      }
    } catch (err: any) {
      console.error("💥 Git connect failed:", err);
      setStatus("❌ Exception: " + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect to Git Repository</DialogTitle>
          <DialogDescription>
            Enter your GitHub repository details to enable commits and pushes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Git Repository URL</Label>
            <Input
              id="repo-url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo.git"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">GitHub Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">GitHub Personal Access Token</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground">
              Token must have <code>repo</code> access to push
            </p>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
          {status && <div className="text-sm text-muted-foreground">{status}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect Repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GitAuthModal;
