import React, { useState, useEffect } from "react";
import ValidationAlertDialog from "./ValidationAlertDialog";
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
import { useConfigContext } from "./ConfigContext";

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
  const { selectedRegion } = useConfigContext();
  const [activeTab, setActiveTab] = useState("main");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [terraformCode, setTerraformCode] = useState<TerraformFiles>({
    mainTf: "",
    variablesTf: "",
    outputsTf: "",
  });
  const [branchCreated, setBranchCreated] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [showGitAuthModal, setShowGitAuthModal] = useState(false);
  const [isGitConnected, setIsGitConnected] = useState(false);
  const [gitError, setGitError] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    const gitConnected = localStorage.getItem("aws-infra-git-connected");
    if (gitConnected === "true") setIsGitConnected(true);
  }, []);

  const handleGenerateCode = async () => {
    if (isGenerating) return;

    if (connections.length === 0 && nodes.length > 1) {
      setValidationMessage("Please connect your resources before generating Terraform code.");
      setShowValidationAlert(true);
      return;
    }

    if (nodes.length > 1) {
      const connectedNodeIds = new Set<string>();
      connections.forEach((conn) => {
        connectedNodeIds.add(conn.sourceId);
        connectedNodeIds.add(conn.targetId);
      });

      const unconnectedNodes = nodes.filter((node) => !connectedNodeIds.has(node.id));
      if (unconnectedNodes.length > 0) {
        const nodeNames = unconnectedNodes.map((n) => n.title).join(", ");
        setValidationMessage(`All resources must be connected. Unconnected resources: ${nodeNames}`);
        setShowValidationAlert(true);
        return;
      }
    }

    setIsGenerating(true);
    try {
      const result = await generateTerraformCode(nodes, connections);
      setTerraformCode(result);
      setIsCodeGenerated(true);

      if (isGitConnected) {
        await handleCommitToGit(result);
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
    localStorage.setItem("aws-infra-git-connected", "true");
  };

  const handleCommitToGit = async (code: TerraformFiles = terraformCode) => {
    console.log("📤 Commit triggered");
    if (!isCodeGenerated || isCommitting) return;

    setIsCommitting(true);
    setGitError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const branch = `terraform_modules_${today}`;
      const directory = `terraform/modules/${selectedRegion}/${today}`;
      
      console.log("📡 Sending push-terraform request...", {
        branchName: branch,
        directory,
        files: [
          { name: "main.tf", length: code.mainTf.length },
          { name: "variables.tf", length: code.variablesTf.length },
          { name: "outputs.tf", length: code.outputsTf.length },
        ],
      });

      const response = await fetch("http://localhost:4000/api/push-terraform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchName: branch,
          directory,
          files: [
            { name: "main.tf", content: code.mainTf },
            { name: "variables.tf", content: code.variablesTf },
            { name: "outputs.tf", content: code.outputsTf },
            { name: "README.md", content: generateReadme() },
          ],
        }),
      });

      const data = await response.json();
      console.log("📬 Response from push-terraform:", data);

      if (data.success) {
        setBranchCreated(true);
        setBranchName(branch);
      } else {
        setGitError("Failed to push Terraform code to Git.");
      }
    } catch (err: any) {
      console.error("Git push error:", err);
      setGitError("Unexpected error while pushing code.");
    } finally {
      setIsCommitting(false);
    }
  };

  const generateReadme = () => {
    return `# AWS Infrastructure as Code\n\n## Region: ${selectedRegion}\n\nThis directory contains Terraform code for deploying AWS infrastructure.\n\n## Resources\n\n${nodes.map((node) => `- **${node.title}** (${node.type}): ${node.config?.name || node.id}`).join("\n")}\n\n## Deployment Instructions\n\n1. Install Terraform\n2. Run \`terraform init\`\n3. Run \`terraform plan\` to preview changes\n4. Run \`terraform apply\` to deploy the infrastructure\n\n## Generated on: ${new Date().toISOString()}`;
  };

  const handleCopyCode = () => {
    const codeToCopy =
      activeTab === "main"
        ? terraformCode.mainTf
        : activeTab === "variables"
        ? terraformCode.variablesTf
        : terraformCode.outputsTf;
    navigator.clipboard.writeText(codeToCopy);
  };

  const handleDownload = () => {
    import("jszip")
      .then(async ({ default: JSZip }) => {
        const zip = new JSZip();
        const today = new Date().toISOString().split("T")[0];
        const folderName = `terraform-modules-${selectedRegion}-${today}`;
        const folder = zip.folder(folderName);

        if (folder) {
          folder.file("main.tf", terraformCode.mainTf);
          folder.file("variables.tf", terraformCode.variablesTf);
          folder.file("outputs.tf", terraformCode.outputsTf);
          folder.file("README.md", generateReadme());

          const content = await zip.generateAsync({ type: "blob" });
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
        alert("Failed to create zip file. Downloading individual file instead.");

        const fileName = `${activeTab}.tf`;
        const content =
          activeTab === "main"
            ? terraformCode.mainTf
            : activeTab === "variables"
            ? terraformCode.variablesTf
            : terraformCode.outputsTf;

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

      <ValidationAlertDialog
        open={showValidationAlert}
        onOpenChange={setShowValidationAlert}
        title="Validation Error"
        description={validationMessage}
        actionLabel="OK"
      />

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
            {/* Commit button (show when code generated) */}
            {isCodeGenerated && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log("🐛 Commit button clicked");
                  handleCommitToGit();
                }}
                disabled={isCommitting}
              >
                <GitBranch className={`h-4 w-4 mr-1 ${isCommitting ? "animate-spin" : ""}`} />
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
                  /terraform/modules/{selectedRegion}/
                  {new Date().toISOString().split("T")[0]}
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
