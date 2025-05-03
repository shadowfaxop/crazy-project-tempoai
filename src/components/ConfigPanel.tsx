import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface ConfigPanelProps {
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  onNodeUpdate?: (nodeId: string, updates: any) => void;
  onConnectionUpdate?: (connectionId: string, updates: any) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDeleteConnection?: (connectionId: string) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  selectedNodeId,
  selectedConnectionId,
  onNodeUpdate = () => {},
  onConnectionUpdate = () => {},
  onDeleteNode = () => {},
  onDeleteConnection = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("properties");

  const renderNodeConfig = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="node-name">Name</Label>
          <Input id="node-name" placeholder="Enter resource name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="node-type">Instance Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select instance type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="t2.micro">t2.micro</SelectItem>
              <SelectItem value="t2.small">t2.small</SelectItem>
              <SelectItem value="t2.medium">t2.medium</SelectItem>
              <SelectItem value="t3.micro">t3.micro</SelectItem>
              <SelectItem value="t3.small">t3.small</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="node-region">Region</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
              <SelectItem value="us-east-2">US East (Ohio)</SelectItem>
              <SelectItem value="us-west-1">US West (N. California)</SelectItem>
              <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
              <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="node-public-ip">Public IP</Label>
          <Switch id="node-public-ip" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="node-tags">Tags</Label>
          <Textarea id="node-tags" placeholder="key=value" className="h-20" />
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onDeleteNode(selectedNodeId!)}
          >
            Delete
          </Button>
          <Button>Apply Changes</Button>
        </div>
      </div>
    );
  };

  const renderConnectionConfig = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="connection-type">Connection Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select connection type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="network">Network Connection</SelectItem>
              <SelectItem value="dependency">Dependency</SelectItem>
              <SelectItem value="data-flow">Data Flow</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="connection-description">Description</Label>
          <Textarea
            id="connection-description"
            placeholder="Describe this connection"
            className="h-20"
          />
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onDeleteConnection(selectedConnectionId!)}
          >
            Delete
          </Button>
          <Button>Apply Changes</Button>
        </div>
      </div>
    );
  };

  const renderTerraformConfig = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="terraform-code">Generated Terraform</Label>
          <Textarea
            id="terraform-code"
            className="h-[300px] font-mono text-sm"
            readOnly
            value={`resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  tags = {
    Name = "ExampleInstance"
  }
}`}
          />
        </div>

        <div className="flex justify-end">
          <Button>Copy Code</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 h-full border-l bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {selectedNodeId
            ? "Resource Configuration"
            : selectedConnectionId
              ? "Connection Configuration"
              : "Configuration"}
        </h2>
      </div>

      {selectedNodeId || selectedConnectionId ? (
        <Tabs
          defaultValue="properties"
          className="flex-1 flex flex-col"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="px-4 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="properties" className="flex-1">
                Properties
              </TabsTrigger>
              <TabsTrigger value="terraform" className="flex-1">
                Terraform
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="properties" className="mt-0">
              {selectedNodeId && renderNodeConfig()}
              {selectedConnectionId && renderConnectionConfig()}
            </TabsContent>

            <TabsContent value="terraform" className="mt-0">
              {renderTerraformConfig()}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
          <div>
            <p>Select a resource or connection to configure</p>
            <p className="text-sm mt-2">
              Drag services from the sidebar to the canvas
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;
