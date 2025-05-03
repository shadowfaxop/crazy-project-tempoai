import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";

interface TerraformCodePanelProps {
  nodes: any[];
  connections: any[];
}

const TerraformCodePanel: React.FC<TerraformCodePanelProps> = ({
  nodes,
  connections,
}) => {
  const [activeTab, setActiveTab] = useState("main");

  const mainTfCode = `# Generated Terraform Code

provider "aws" {
  region = "us-east-1"
}

${nodes
  .map((node) => {
    if (node.type === "ec2") {
      return `resource "aws_instance" "${node.id}" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  tags = {
    Name = "${node.title}"
  }
}`;
    } else if (node.type === "s3") {
      return `resource "aws_s3_bucket" "${node.id}" {
  bucket = "${node.title.toLowerCase().replace(/ /g, "-")}"
  tags = {
    Name = "${node.title}"
  }
}`;
    } else if (node.type === "rds") {
      return `resource "aws_db_instance" "${node.id}" {
  allocated_storage    = 10
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t3.micro"
  name                 = "${node.title.toLowerCase().replace(/ /g, "_")}"
  username             = "admin"
  password             = var.db_password
  parameter_group_name = "default.mysql5.7"
  skip_final_snapshot  = true
}`;
    }
    return "";
  })
  .join("\n\n")}`;

  const variablesTfCode = `# Variables

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Password for database"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}
`;

  const outputsTfCode = `# Outputs

${nodes
  .map((node) => {
    if (node.type === "ec2") {
      return `output "${node.id}_public_ip" {
  description = "Public IP of ${node.title}"
  value       = aws_instance.${node.id}.public_ip
}`;
    } else if (node.type === "s3") {
      return `output "${node.id}_bucket_name" {
  description = "Name of ${node.title}"
  value       = aws_s3_bucket.${node.id}.bucket
}`;
    } else if (node.type === "rds") {
      return `output "${node.id}_endpoint" {
  description = "Endpoint of ${node.title}"
  value       = aws_db_instance.${node.id}.endpoint
}`;
    }
    return "";
  })
  .join("\n\n")}`;

  return (
    <div className="h-full flex flex-col border rounded-md bg-background">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Generated Terraform Code</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button size="sm" variant="outline">
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
              {mainTfCode}
            </pre>
          </TabsContent>

          <TabsContent value="variables" className="p-4 mt-0">
            <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto">
              {variablesTfCode}
            </pre>
          </TabsContent>

          <TabsContent value="outputs" className="p-4 mt-0">
            <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto">
              {outputsTfCode}
            </pre>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default TerraformCodePanel;
