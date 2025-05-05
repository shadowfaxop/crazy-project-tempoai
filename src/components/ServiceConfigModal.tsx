import React, { useState, useEffect } from "react";
import { useConfigContext } from "./ConfigContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: string;
  nodeId: string;
  initialConfig?: any;
  onSave: (nodeId: string, config: any) => void;
}

const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
  isOpen = true,
  onClose = () => {},
  serviceType = "ec2",
  nodeId = "node-1",
  initialConfig = {},
  onSave = () => {},
}) => {
  const { selectedRegion } = useConfigContext();
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState("basic");

  // Apply the global region to the config if region is not already set
  useEffect(() => {
    if (!config.region) {
      setConfig((prev) => ({
        ...prev,
        region: selectedRegion,
      }));
    }
  }, [selectedRegion, config.region]);

  const handleInputChange = (key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSave(nodeId, config);
    onClose();
  };

  const renderEC2Config = () => (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Configuration</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="instance_type">Instance Type</Label>
              <Select
                value={config.instance_type || "t2.micro"}
                onValueChange={(value) =>
                  handleInputChange("instance_type", value)
                }
              >
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
            <div className="grid gap-2">
              <Label htmlFor="ami_id">AMI ID</Label>
              <Input
                id="ami_id"
                value={config.ami_id || "ami-0c55b159cbfafe1f0"}
                onChange={(e) => handleInputChange("ami_id", e.target.value)}
                placeholder="ami-0c55b159cbfafe1f0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="key_pair">Key Pair</Label>
              <Input
                id="key_pair"
                value={config.key_pair || ""}
                onChange={(e) => handleInputChange("key_pair", e.target.value)}
                placeholder="my-key-pair"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={config.region || selectedRegion}
                onValueChange={(value) => handleInputChange("region", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">
                    US East (N. Virginia)
                  </SelectItem>
                  <SelectItem value="us-east-2">US East (Ohio)</SelectItem>
                  <SelectItem value="us-west-1">
                    US West (N. California)
                  </SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subnet_id">Subnet ID</Label>
              <Input
                id="subnet_id"
                value={config.subnet_id || ""}
                onChange={(e) => handleInputChange("subnet_id", e.target.value)}
                placeholder="subnet-12345"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="security_groups">Security Groups</Label>
              <TagInput
                value={config.security_groups || {}}
                onChange={(value) =>
                  handleInputChange("security_groups", value)
                }
                placeholder="Add security group (name=id)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ebs_optimized"
                checked={config.ebs_optimized || false}
                onCheckedChange={(checked) =>
                  handleInputChange("ebs_optimized", checked)
                }
              />
              <Label htmlFor="ebs_optimized">EBS Optimized</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user_data">User Data</Label>
              <Textarea
                id="user_data"
                value={config.user_data || ""}
                onChange={(e) => handleInputChange("user_data", e.target.value)}
                placeholder="#!/bin/bash\necho 'Hello World'"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );

  const renderRDSConfig = () => (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Configuration</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="engine">Database Engine</Label>
              <Select
                value={config.engine || "mysql"}
                onValueChange={(value) => handleInputChange("engine", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select database engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mariadb">MariaDB</SelectItem>
                  <SelectItem value="oracle">Oracle</SelectItem>
                  <SelectItem value="sqlserver">SQL Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instance_class">Instance Class</Label>
              <Select
                value={config.instance_class || "db.t3.micro"}
                onValueChange={(value) =>
                  handleInputChange("instance_class", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instance class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="db.t3.micro">db.t3.micro</SelectItem>
                  <SelectItem value="db.t3.small">db.t3.small</SelectItem>
                  <SelectItem value="db.t3.medium">db.t3.medium</SelectItem>
                  <SelectItem value="db.m5.large">db.m5.large</SelectItem>
                  <SelectItem value="db.r5.large">db.r5.large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="db_name">Database Name</Label>
              <Input
                id="db_name"
                value={config.db_name || ""}
                onChange={(e) => handleInputChange("db_name", e.target.value)}
                placeholder="mydb"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Master Username</Label>
              <Input
                id="username"
                value={config.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="admin"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Master Password</Label>
              <Input
                id="password"
                type="password"
                value={config.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="allocated_storage">Allocated Storage (GB)</Label>
              <Input
                id="allocated_storage"
                type="number"
                value={config.allocated_storage || "20"}
                onChange={(e) =>
                  handleInputChange("allocated_storage", e.target.value)
                }
                placeholder="20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="multi_az"
                checked={config.multi_az || false}
                onCheckedChange={(checked) =>
                  handleInputChange("multi_az", checked)
                }
              />
              <Label htmlFor="multi_az">Multi-AZ Deployment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="publicly_accessible"
                checked={config.publicly_accessible || false}
                onCheckedChange={(checked) =>
                  handleInputChange("publicly_accessible", checked)
                }
              />
              <Label htmlFor="publicly_accessible">Publicly Accessible</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="backup_retention_period">
                Backup Retention Period (days)
              </Label>
              <Input
                id="backup_retention_period"
                type="number"
                value={config.backup_retention_period || "7"}
                onChange={(e) =>
                  handleInputChange("backup_retention_period", e.target.value)
                }
                placeholder="7"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );

  const renderS3Config = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="bucket_name">Bucket Name</Label>
        <Input
          id="bucket_name"
          value={config.bucket_name || ""}
          onChange={(e) => handleInputChange("bucket_name", e.target.value)}
          placeholder="my-unique-bucket-name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="region">Region</Label>
        <Select
          value={config.region || selectedRegion}
          onValueChange={(value) => handleInputChange("region", value)}
        >
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
      <div className="flex items-center space-x-2">
        <Switch
          id="versioning"
          checked={config.versioning || false}
          onCheckedChange={(checked) =>
            handleInputChange("versioning", checked)
          }
        />
        <Label htmlFor="versioning">Enable Versioning</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="public_access"
          checked={config.public_access || false}
          onCheckedChange={(checked) =>
            handleInputChange("public_access", checked)
          }
        />
        <Label htmlFor="public_access">Block Public Access</Label>
      </div>
    </div>
  );

  const renderLambdaConfig = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="function_name">Function Name</Label>
        <Input
          id="function_name"
          value={config.function_name || ""}
          onChange={(e) => handleInputChange("function_name", e.target.value)}
          placeholder="my-lambda-function"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="handler">Handler</Label>
        <Input
          id="handler"
          value={config.handler || "index.handler"}
          onChange={(e) => handleInputChange("handler", e.target.value)}
          placeholder="index.handler"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="runtime">Runtime</Label>
        <Select
          value={config.runtime || "nodejs18.x"}
          onValueChange={(value) => handleInputChange("runtime", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select runtime" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nodejs18.x">Node.js 18.x</SelectItem>
            <SelectItem value="nodejs16.x">Node.js 16.x</SelectItem>
            <SelectItem value="python3.9">Python 3.9</SelectItem>
            <SelectItem value="python3.8">Python 3.8</SelectItem>
            <SelectItem value="java11">Java 11</SelectItem>
            <SelectItem value="go1.x">Go 1.x</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="s3_code_path">S3 Code Path</Label>
        <Input
          id="s3_code_path"
          value={config.s3_code_path || ""}
          onChange={(e) => handleInputChange("s3_code_path", e.target.value)}
          placeholder="s3://my-bucket/code.zip"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="timeout">Timeout (seconds)</Label>
        <Input
          id="timeout"
          type="number"
          value={config.timeout || "3"}
          onChange={(e) => handleInputChange("timeout", e.target.value)}
          placeholder="3"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="memory_size">Memory Size (MB)</Label>
        <Input
          id="memory_size"
          type="number"
          value={config.memory_size || "128"}
          onChange={(e) => handleInputChange("memory_size", e.target.value)}
          placeholder="128"
        />
      </div>
    </div>
  );

  const renderSNSConfig = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="topic_name">Topic Name</Label>
        <Input
          id="topic_name"
          value={config.topic_name || ""}
          onChange={(e) => handleInputChange("topic_name", e.target.value)}
          placeholder="my-sns-topic"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="display_name">Display Name</Label>
        <Input
          id="display_name"
          value={config.display_name || ""}
          onChange={(e) => handleInputChange("display_name", e.target.value)}
          placeholder="My SNS Topic"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="fifo_topic"
          checked={config.fifo_topic || false}
          onCheckedChange={(checked) =>
            handleInputChange("fifo_topic", checked)
          }
        />
        <Label htmlFor="fifo_topic">FIFO Topic</Label>
      </div>
    </div>
  );

  const renderAPIGatewayConfig = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">API Name</Label>
        <Input
          id="name"
          value={config.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="my-api"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="endpoint_type">Endpoint Type</Label>
        <Select
          value={config.endpoint_type || "REGIONAL"}
          onValueChange={(value) => handleInputChange("endpoint_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select endpoint type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="REGIONAL">Regional</SelectItem>
            <SelectItem value="EDGE">Edge Optimized</SelectItem>
            <SelectItem value="PRIVATE">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="method">HTTP Method</Label>
        <Select
          value={config.method || "GET"}
          onValueChange={(value) => handleInputChange("method", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select HTTP method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lambda_integration">Lambda Integration</Label>
        <Input
          id="lambda_integration"
          value={config.lambda_integration || ""}
          onChange={(e) =>
            handleInputChange("lambda_integration", e.target.value)
          }
          placeholder="my-lambda-function"
        />
      </div>
    </div>
  );

  const renderConfigForm = () => {
    switch (serviceType.toLowerCase()) {
      case "ec2":
        return renderEC2Config();
      case "rds":
        return renderRDSConfig();
      case "s3":
        return renderS3Config();
      case "lambda":
        return renderLambdaConfig();
      case "sns":
        return renderSNSConfig();
      case "api gateway":
      case "apigateway":
        return renderAPIGatewayConfig();
      default:
        return <div>Configuration not available for this service type.</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Configure {serviceType.toUpperCase()} Service
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {renderConfigForm()}
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceConfigModal;
