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
import { initGit } from "@/lib/git-utils";

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
    "https://github.com/shadowfaxop/crazy-project-tempoai",
  );
  const [username, setUsername] = useState("shadowfaxop");
  const [token, setToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!repoUrl || !username || !token) {
      setError("Please fill in all fields");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Validate repository URL format
      if (
        !repoUrl.match(
          /^https:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w-]+\/[\w.-]+(\.git)?$/,
        )
      ) {
        setError(
          "Invalid repository URL format. Please use HTTPS URL format from GitHub, GitLab, or Bitbucket.",
        );
        setIsConnecting(false);
        return;
      }

      // Ensure URL ends with .git
      const normalizedUrl = repoUrl.endsWith(".git")
        ? repoUrl
        : `${repoUrl}.git`;

      const success = await initGit(normalizedUrl, username, token);

      if (success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(
          "Failed to connect to repository. Please check your credentials and ensure the token has proper permissions.",
        );
      }
    } catch (err) {
      setError(
        `Error connecting to repository: ${err.message || "Unknown error"}`,
      );
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
            Enter your Git repository details to enable real commits and pushes.
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
              Token needs repo permissions to push changes
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive mt-2">{error}</div>
          )}
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
