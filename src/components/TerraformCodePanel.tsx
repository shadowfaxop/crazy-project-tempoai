import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  RefreshCw,
  GitBranch,
  Check,
  AlertCircle,
} from "lucide-react";
import { generateTerraformCode } from "@/api/terraform-api";
import { NodeItem, ConnectionItem } from "./Canvas";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GitAuthModal from "./GitAuthModal";
import { createBranch, commitAndPushFiles } from "@/lib/git-utils";

interface TerraformCodePanelProps {
  nodes: NodeItem[];
  connections: ConnectionItem[];
}

interface TerraformFiles {
  mainTf: string;
  variablesTf: string;
  outputsTf: string;
}

const TerraformCodePanel: React.FC<TerraformCodePanelProps> = ({
  nodes,
  connections,
}) => {
  const [activeTab, setActiveTab] = useState("main");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [terraformCode, setTerraformCode] = useState<TerraformFiles>({
    mainTf: "",
    variablesTf: "",
    outputsTf: "",
  });
  const [branchCreated, setBranchCreated] = useState(false);
  const [branchName, setBranchName] = useState("terraform_modules");
  const [showGitAuthModal, setShowGitAuthModal] = useState(false);
  const [isGitConnected, setIsGitConnected] = useState(false);
  const [gitError, setGitError] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const handleGenerateCode = async () => {
    if (isGenerating) return;

    // Check if there are connections between nodes
    if (connections.length === 0 && nodes.length > 1) {
      alert("Please connect your resources before generating Terraform code.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateTerraformCode(nodes, connections);
      setTerraformCode(result);
      setIsCodeGenerated(true);

      if (isGitConnected) {
        await handleCommitToGit();
      }
    } catch (error) {
      console.error("Error generating Terraform code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGitSuccess = () => {
    setIsGitConnected(true);
    setGitError(null);
  };

  const handleCommitToGit = async () => {
    if (!isCodeGenerated || isCommitting) return;

    setIsCommitting(true);
    setGitError(null);

    try {
      const branchSuccess = await createBranch(branchName);

      if (!branchSuccess) {
        setGitError("Failed to create or checkout branch");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const directory = `terraform/modules/${today}`;

      const files = [
        { name: "main.tf", content: terraformCode.mainTf },
        { name: "variables.tf", content: terraformCode.variablesTf },
        { name: "outputs.tf", content: terraformCode.outputsTf },
      ];

      const commitSuccess = await commitAndPushFiles(
        files,
        `Add Terraform modules for infrastructure - ${today}`,
        directory,
      );

      if (commitSuccess) {
        setBranchCreated(true);
      } else {
        setGitError("Failed to commit and push files");
      }
    } catch (error) {
      console.error("Error in Git operations:", error);
      setGitError(`Git error: ${error.message || "Unknown error"}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCopyCode = () => {
    let codeToCopy = "";
    switch (activeTab) {
      case "main":
        codeToCopy = terraformCode.mainTf;
        break;
      case "variables":
        codeToCopy = terraformCode.variablesTf;
        break;
      case "outputs":
        codeToCopy = terraformCode.outputsTf;
        break;
    }
    navigator.clipboard.writeText(codeToCopy);
  };

  const handleDownload = () => {
    // Create a zip file with all terraform files
    import("jszip")
      .then(async ({ default: JSZip }) => {
        const zip = new JSZip();
        const today = new Date().toISOString().split("T")[0];
        const folderName = `terraform-modules-${today}`;
        const folder = zip.folder(folderName);

        if (folder) {
          // Add all terraform files to the zip
          folder.file("main.tf", terraformCode.mainTf);
          folder.file("variables.tf", terraformCode.variablesTf);
          folder.file("outputs.tf", terraformCode.outputsTf);

          // Generate the zip file
          const content = await zip.generateAsync({ type: "blob" });

          // Create download link
          const url = URL.createObjectURL(content);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${folderName}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      })
      .catch((err) => {
        console.error("Failed to create zip file:", err);
        alert(
          "Failed to create zip file. Downloading individual file instead.",
        );

        // Fallback to downloading individual file
        let fileName = "";
        let content = "";
        switch (activeTab) {
          case "main":
            fileName = "main.tf";
            content = terraformCode.mainTf;
            break;
          case "variables":
            fileName = "variables.tf";
            content = terraformCode.variablesTf;
            break;
          case "outputs":
            fileName = "outputs.tf";
            content = terraformCode.outputsTf;
            break;
        }

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <>
      {showGitAuthModal && (
        <GitAuthModal
          open={showGitAuthModal}
          onOpenChange={setShowGitAuthModal}
          onSuccess={handleGitSuccess}
        />
      )}

      <div className="h-full flex flex-col border rounded-md bg-background">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Generated Terraform Code</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateCode}
              disabled={isGenerating}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isGenerating ? "animate-spin" : ""}`}
              />
              {isGenerating ? "Generating..." : "Generate Code"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              disabled={!isCodeGenerated}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={!isCodeGenerated}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant={isGitConnected ? "default" : "outline"}
              onClick={() => setShowGitAuthModal(true)}
            >
              <GitBranch className="h-4 w-4 mr-1" />
              {isGitConnected ? "Connected" : "Connect Git"}
            </Button>
            {isGitConnected && isCodeGenerated && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCommitToGit}
                disabled={isCommitting}
              >
                <GitBranch
                  className={`h-4 w-4 mr-1 ${
                    isCommitting ? "animate-spin" : ""
                  }`}
                />
                {isCommitting ? "Committing..." : "Commit to Git"}
              </Button>
            )}
          </div>
        </div>

        {branchCreated && (
          <Alert className="m-4 bg-muted/50 border border-green-200">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-green-500" />
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Files committed to{" "}
                <code className="bg-muted px-1 rounded">{branchName}</code>{" "}
                branch in your Git repository at:
                <code className="block mt-1 bg-muted p-1 rounded text-xs">
                  /terraform/modules/{new Date().toISOString().split("T")[0]}
                </code>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {gitError && (
          <Alert className="m-4 bg-muted/50 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription>{gitError}</AlertDescription>
            </div>
          </Alert>
        )}

        {!isCodeGenerated ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Click "Generate Code" to create Terraform files</p>
              <p className="text-sm mt-2">
                Files will be created in a separate branch
              </p>
            </div>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="px-4 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="main" className="flex-1">
                  main.tf
                </TabsTrigger>
                <TabsTrigger value="variables" className="flex-1">
                  variables.tf
                </TabsTrigger>
                <TabsTrigger value="outputs" className="flex-1">
                  outputs.tf
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
              <TabsContent value="main" className="p-4 mt-0">
                <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto h-[calc(100vh-300px)]">
                  {terraformCode.mainTf}
                </pre>
              </TabsContent>

              <TabsContent value="variables" className="p-4 mt-0">
                <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto h-[calc(100vh-300px)]">
                  {terraformCode.variablesTf}
                </pre>
              </TabsContent>

              <TabsContent value="outputs" className="p-4 mt-0">
                <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto h-[calc(100vh-300px)]">
                  {terraformCode.outputsTf}
                </pre>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </div>
    </>
  );
};

export default TerraformCodePanel;
