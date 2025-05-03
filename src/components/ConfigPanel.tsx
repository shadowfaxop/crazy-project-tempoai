import React, { useState, useEffect } from "react";
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
import { TagInput } from "@/components/ui/tag-input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  SERVICE_CONFIGS,
  ServiceType,
  ServiceConfigField,
} from "@/lib/aws-service-configs";
import { NodeItem, ConnectionItem } from "./Canvas";

interface ConfigPanelProps {
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  nodes: NodeItem[];
  connections: ConnectionItem[];
  onNodeUpdate: (nodeId: string, updates: Partial<NodeItem>) => void;
  onConnectionUpdate: (
    connectionId: string,
    updates: Partial<ConnectionItem>,
  ) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  selectedNodeId,
  selectedConnectionId,
  nodes,
  connections,
  onNodeUpdate,
  onConnectionUpdate,
  onDeleteNode,
  onDeleteConnection,
}) => {
  const [activeTab, setActiveTab] = useState("properties");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Get the selected node or connection
  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null;
  const selectedConnection = selectedConnectionId
    ? connections.find((c) => c.id === selectedConnectionId)
    : null;

  // Reset form values when selection changes
  useEffect(() => {
    if (selectedNode) {
      setFormValues(selectedNode.config || {});
      setActiveTab("properties");
      setActiveCategory(null);
    } else if (selectedConnection) {
      setFormValues({
        type: selectedConnection.type || "default",
        description: selectedConnection.description || "",
      });
      setActiveTab("properties");
    } else {
      setFormValues({});
    }
  }, [selectedNode, selectedConnection]);

  const handleInputChange = (name: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyChanges = () => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, { config: formValues });
    } else if (selectedConnection) {
      onConnectionUpdate(selectedConnection.id, {
        type: formValues.type,
        description: formValues.description,
      });
    }
  };

  const renderNodeConfig = () => {
    if (!selectedNode) return null;

    const serviceConfig = SERVICE_CONFIGS[selectedNode.type];
    if (!serviceConfig)
      return <p>No configuration available for this service type.</p>;

    // Get all categories from the fields
    const categories = Array.from(
      new Set(serviceConfig.fields.map((field) => field.category || "General")),
    ).sort();

    // If no active category is set, use the first one
    const currentCategory = activeCategory || categories[0];

    // Filter fields by the current category
    const fieldsInCategory = serviceConfig.fields.filter(
      (field) => (field.category || "General") === currentCategory,
    );

    return (
      <div className="space-y-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={currentCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {fieldsInCategory.map((field) => renderConfigField(field))}
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onDeleteNode(selectedNode.id)}
          >
            Delete
          </Button>
          <Button onClick={handleApplyChanges}>Apply Changes</Button>
        </div>
      </div>
    );
  };

  const renderConfigField = (field: ServiceConfigField) => {
    const value =
      formValues[field.name] !== undefined
        ? formValues[field.name]
        : field.default;

    switch (field.type) {
      case "text":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.name}
              value={value || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleInputChange(field.name, Number(e.target.value))
              }
              min={field.min}
              max={field.max}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select
              value={value || ""}
              onValueChange={(val) => handleInputChange(field.name, val)}
            >
              <SelectTrigger id={field.name}>
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div
            key={field.name}
            className="flex items-center justify-between space-y-0"
          >
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) =>
                handleInputChange(field.name, checked)
              }
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "tags":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <TagInput
              value={value || {}}
              onChange={(tags) => handleInputChange(field.name, tags)}
              placeholder={field.placeholder}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      case "multiselect":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <MultiSelect
              options={field.options || []}
              selected={value || []}
              onChange={(selected) => handleInputChange(field.name, selected)}
              placeholder={`Select ${field.label.toLowerCase()}`}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderConnectionConfig = () => {
    if (!selectedConnection) return null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="connection-type">Connection Type</Label>
          <Select
            value={formValues.type || "default"}
            onValueChange={(val) => handleInputChange("type", val)}
          >
            <SelectTrigger id="connection-type">
              <SelectValue placeholder="Select connection type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="network">Network Connection</SelectItem>
              <SelectItem value="dependency">Dependency</SelectItem>
              <SelectItem value="data-flow">Data Flow</SelectItem>
              <SelectItem value="access">Access Permission</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="connection-description">Description</Label>
          <Textarea
            id="connection-description"
            value={formValues.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe this connection"
            className="h-20"
          />
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onDeleteConnection(selectedConnection.id)}
          >
            Delete
          </Button>
          <Button onClick={handleApplyChanges}>Apply Changes</Button>
        </div>
      </div>
    );
  };

  const renderTerraformConfig = () => {
    const terraformCode = selectedNode
      ? generateNodeTerraform(selectedNode)
      : "";

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="terraform-code">Generated Terraform</Label>
          <Textarea
            id="terraform-code"
            className="h-[300px] font-mono text-sm"
            readOnly
            value={terraformCode}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(terraformCode);
            }}
          >
            Copy Code
          </Button>
        </div>
      </div>
    );
  };

  const generateNodeTerraform = (node: NodeItem): string => {
    const serviceConfig = SERVICE_CONFIGS[node.type];
    if (!serviceConfig)
      return "# No Terraform configuration available for this service type.";

    const resourceType = serviceConfig.terraformType;
    const resourceName = node.id.replace(/[^a-zA-Z0-9_]/g, "_");

    let code = `resource "${resourceType}" "${resourceName}" {\n`;

    // Add all configured fields
    Object.entries(node.config || {}).forEach(([key, value]) => {
      if (key === "tags" && typeof value === "object") {
        // Handle tags specially
        if (value && Object.keys(value).length > 0) {
          code += "  tags = {\n";
          Object.entries(value).forEach(([tagKey, tagValue]) => {
            code += `    ${tagKey} = "${tagValue}"\n`;
          });
          code += "  }\n";
        }
      } else if (Array.isArray(value)) {
        // Handle arrays
        code += `  ${key} = [${value.map((v) => `"${v}"`).join(", ")}]\n`;
      } else if (typeof value === "boolean") {
        // Handle booleans
        code += `  ${key} = ${value}\n`;
      } else if (typeof value === "number") {
        // Handle numbers
        code += `  ${key} = ${value}\n`;
      } else if (value) {
        // Handle strings and other values
        code += `  ${key} = "${value}"\n`;
      }
    });

    // Special handling for specific resource types
    if (resourceType === "aws_dynamodb_table") {
      // Add attribute blocks for hash and range keys
      if (node.config?.hash_key) {
        code += `  attribute {\n    name = "${node.config.hash_key}"\n    type = "${node.config.hash_key_type || "S"}"\n  }\n`;
      }
      if (node.config?.range_key) {
        code += `  attribute {\n    name = "${node.config.range_key}"\n    type = "${node.config.range_key_type || "S"}"\n  }\n`;
      }
    }

    code += "}";
    return code;
  };

  return (
    <div className="w-80 h-full border-l bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {selectedNode
            ? "Resource Configuration"
            : selectedConnection
              ? "Connection Configuration"
              : "Configuration"}
        </h2>
      </div>

      {selectedNode || selectedConnection ? (
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
              {selectedNode && renderNodeConfig()}
              {selectedConnection && renderConnectionConfig()}
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
