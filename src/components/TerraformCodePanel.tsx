import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw } from "lucide-react";
import { generateTerraformCode } from "@/api/terraform-api";
import { NodeItem, ConnectionItem } from "./Canvas";

interface TerraformCodePanelProps {
  nodes: NodeItem[];
  connections: ConnectionItem[];
}

const TerraformCodePanel: React.FC<TerraformCodePanelProps> = ({
  nodes,
  connections,
}) => {
  const [activeTab, setActiveTab] = useState("main");
  const [isGenerating, setIsGenerating] = useState(false);
  const [terraformCode, setTerraformCode] = useState({
    mainTf:
      '# No resources defined yet\n\nprovider "aws" {\n  region = var.aws_region\n}',
    variablesTf:
      '# Variables\n\nvariable "aws_region" {\n  description = "AWS region"\n  type        = string\n  default     = "us-east-1"\n}',
    outputsTf: "# No outputs defined yet",
  });

  // Generate Terraform code when nodes or connections change
  useEffect(() => {
    if (nodes.length > 0) {
      handleGenerateCode();
    }
  }, []);

  const handleGenerateCode = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateTerraformCode(nodes, connections);
      setTerraformCode(result);
    } catch (error) {
      console.error("Error generating Terraform code:", error);
    } finally {
      setIsGenerating(false);
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
    const files = [
      { name: "main.tf", content: terraformCode.mainTf },
      { name: "variables.tf", content: terraformCode.variablesTf },
      { name: "outputs.tf", content: terraformCode.outputsTf },
    ];

    // Create a zip file using JSZip (in a real app)
    // For now, just download the current file
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
  };

  return (
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
            {isGenerating ? "Generating..." : "Refresh"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopyCode}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

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

        <ScrollArea className="flex-1">
          <TabsContent value="main" className="p-4 mt-0">
            <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto">
              {terraformCode.mainTf}
            </pre>
          </TabsContent>

          <TabsContent value="variables" className="p-4 mt-0">
            <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto">
              {terraformCode.variablesTf}
            </pre>
          </TabsContent>

          <TabsContent value="outputs" className="p-4 mt-0">
            <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto">
              {terraformCode.outputsTf}
            </pre>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default TerraformCodePanel;
