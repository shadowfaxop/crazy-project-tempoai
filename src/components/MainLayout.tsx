import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "@/components/Sidebar";
import Canvas, { NodeItem, ConnectionItem } from "@/components/Canvas";
import ConfigPanel from "@/components/ConfigPanel";
import TerraformCodePanel from "@/components/TerraformCodePanel";
import DeploymentModal from "@/components/DeploymentModal";
import { Button } from "@/components/ui/button";
import { Code, Play } from "lucide-react";
import { ServiceType } from "@/lib/aws-service-configs";
import { ConfigProvider } from "@/components/ConfigContext";
import ValidationAlertDialog from "@/components/ValidationAlertDialog";

const MainLayout: React.FC = () => {
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState({
    title: "",
    description: "",
  });

  const handleDragStart = (
    event: React.DragEvent,
    serviceType: ServiceType,
  ) => {
    event.dataTransfer.setData("serviceType", serviceType);
  };

  const handleNodesChange = (updatedNodes: NodeItem[]) => {
    setNodes(updatedNodes);
  };

  const handleConnectionsChange = (updatedConnections: ConnectionItem[]) => {
    setConnections(updatedConnections);
  };

  const handleNodeUpdate = (nodeId: string, updates: Partial<NodeItem>) => {
    setNodes(
      nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node,
      ),
    );
  };

  const handleConnectionUpdate = (
    connectionId: string,
    updates: Partial<ConnectionItem>,
  ) => {
    setConnections(
      connections.map((connection) =>
        connection.id === connectionId
          ? { ...connection, ...updates }
          : connection,
      ),
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter((node) => node.id !== nodeId));
    setConnections(
      connections.filter(
        (connection) =>
          connection.sourceId !== nodeId && connection.targetId !== nodeId,
      ),
    );
    setSelectedNodeId(null);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(
      connections.filter((connection) => connection.id !== connectionId),
    );
    setSelectedConnectionId(null);
  };

  const handleGenerateCode = () => {
    // Check if all nodes are connected
    const nodeIds = new Set(nodes.map((node) => node.id));
    const connectedNodeIds = new Set();

    connections.forEach((conn) => {
      connectedNodeIds.add(conn.sourceId);
      connectedNodeIds.add(conn.targetId);
    });

    // Check if there are nodes that aren't connected
    const unconnectedNodes = [...nodeIds].filter(
      (id) => !connectedNodeIds.has(id),
    );

    if (unconnectedNodes.length > 0) {
      setValidationMessage({
        title: "Unconnected Resources",
        description:
          "Some resources are not connected. All resources should be connected before generating Terraform code.",
      });
      setShowValidationAlert(true);
      return;
    }

    setShowCodePanel(true);
  };

  return (
    <ConfigProvider nodes={nodes} className="flex w-full h-full">
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <div className="border-b bg-background p-2 flex justify-between items-center">
          <h1 className="text-xl font-bold px-2">AWS Infrastructure Builder</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodePanel(!showCodePanel)}
            >
              <Code className="h-4 w-4 mr-1" />
              {showCodePanel ? "Hide Code" : "Show Code"}
            </Button>
            <Button size="sm" onClick={() => setShowDeployModal(true)}>
              <Play className="h-4 w-4 mr-1" />
              Deploy
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="w-full">
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              className="overflow-hidden"
            >
              <Sidebar onDragStart={handleDragStart} />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel
              defaultSize={60}
              minSize={30}
              className="overflow-hidden"
            >
              <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel
                  defaultSize={showCodePanel ? 60 : 100}
                  className="overflow-hidden"
                >
                  <Canvas
                    nodes={nodes}
                    connections={connections}
                    onNodesChange={handleNodesChange}
                    onConnectionsChange={handleConnectionsChange}
                    onSelectNode={setSelectedNodeId}
                    onSelectConnection={setSelectedConnectionId}
                    selectedNodeId={selectedNodeId}
                    selectedConnectionId={selectedConnectionId}
                  />
                </ResizablePanel>

                {showCodePanel && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel
                      defaultSize={40}
                      className="overflow-hidden"
                    >
                      <TerraformCodePanel
                        nodes={nodes}
                        connections={connections}
                      />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel
              defaultSize={20}
              minSize={15}
              className="overflow-hidden"
            >
              <ConfigPanel
                selectedNodeId={selectedNodeId}
                selectedConnectionId={selectedConnectionId}
                nodes={nodes}
                connections={connections}
                onNodeUpdate={handleNodeUpdate}
                onConnectionUpdate={handleConnectionUpdate}
                onDeleteNode={handleDeleteNode}
                onDeleteConnection={handleDeleteConnection}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        <DeploymentModal
          open={showDeployModal}
          onOpenChange={setShowDeployModal}
        />

        <ValidationAlertDialog
          open={showValidationAlert}
          onOpenChange={setShowValidationAlert}
          title={validationMessage.title}
          description={validationMessage.description}
          actionLabel="OK"
        />
      </div>
    </ConfigProvider>
  );
};

export default MainLayout;
