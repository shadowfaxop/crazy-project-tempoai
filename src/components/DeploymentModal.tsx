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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface DeploymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("git");
  const [deploymentStatus, setDeploymentStatus] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);

  const handleDeploy = () => {
    setDeploymentStatus("running");
    setProgress(0);

    // Simulate deployment process
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDeploymentStatus("success");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const renderGitConfig = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="repo-url">Git Repository URL</Label>
        <Input
          id="repo-url"
          placeholder="https://github.com/username/repo.git"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch">Branch</Label>
        <Input id="branch" placeholder="main" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="commit-message">Commit Message</Label>
        <Input
          id="commit-message"
          placeholder="Add infrastructure for project X"
        />
      </div>
    </div>
  );

  const renderJenkinsConfig = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="jenkins-url">Jenkins URL</Label>
        <Input id="jenkins-url" placeholder="https://jenkins.example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenkins-job">Pipeline Job</Label>
        <Select>
          <SelectTrigger id="jenkins-job">
            <SelectValue placeholder="Select pipeline job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="terraform-apply">terraform-apply</SelectItem>
            <SelectItem value="terraform-plan">terraform-plan</SelectItem>
            <SelectItem value="infrastructure-deploy">
              infrastructure-deploy
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenkins-params">Pipeline Parameters</Label>
        <Textarea
          id="jenkins-params"
          placeholder="ENVIRONMENT=dev\nREGION=us-east-1"
          className="h-20"
        />
      </div>
    </div>
  );

  const renderDeploymentStatus = () => {
    if (deploymentStatus === "idle") return null;

    return (
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Deployment Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="space-y-2">
          {deploymentStatus === "running" && (
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Deployment in progress...</span>
            </div>
          )}

          {deploymentStatus === "success" && (
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              <span>Deployment completed successfully!</span>
            </div>
          )}

          {deploymentStatus === "error" && (
            <div className="flex items-center text-sm text-muted-foreground">
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              <span>Deployment failed. Check logs for details.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deploy Infrastructure</DialogTitle>
          <DialogDescription>
            Configure deployment settings and push your Terraform code to Git
            repository.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="git">Git Repository</TabsTrigger>
            <TabsTrigger value="jenkins">Jenkins Pipeline</TabsTrigger>
          </TabsList>

          <TabsContent value="git">{renderGitConfig()}</TabsContent>

          <TabsContent value="jenkins">{renderJenkinsConfig()}</TabsContent>
        </Tabs>

        {renderDeploymentStatus()}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={deploymentStatus === "running"}
          >
            {deploymentStatus === "running" ? "Deploying..." : "Deploy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentModal;
