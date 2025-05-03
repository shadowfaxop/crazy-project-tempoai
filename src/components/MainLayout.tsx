import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import ConfigPanel from "@/components/ConfigPanel";
import TerraformCodePanel from "@/components/TerraformCodePanel";
import DeploymentModal from "@/components/DeploymentModal";
import { Button } from "@/components/ui/button";
import { Code, Play } from "lucide-react";

const MainLayout: React.FC = () => {
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);

  const handleDragStart = (event: React.DragEvent, serviceType: string) => {
    event.dataTransfer.setData("serviceType", serviceType);
  };

  const handleNodeUpdate = (nodeId: string, updates: any) => {
    setNodes(
      nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node,
      ),
    );
  };

  const handleConnectionUpdate = (connectionId: string, updates: any) => {
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

  return (
    <div className="h-screen flex flex-col">
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
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15}>
            <Sidebar onDragStart={handleDragStart} />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={showCodePanel ? 60 : 100}>
                <Canvas />
              </ResizablePanel>

              {showCodePanel && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={40}>
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

          <ResizablePanel defaultSize={20} minSize={15}>
            <ConfigPanel
              selectedNodeId={selectedNodeId}
              selectedConnectionId={selectedConnectionId}
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
    </div>
  );
};

export default MainLayout;
