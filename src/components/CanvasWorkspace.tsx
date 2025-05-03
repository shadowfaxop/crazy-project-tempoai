import React, { useState, useCallback } from "react";
import { CanvasContainer } from "@/components/ui/canvas-container";
import { Node } from "@/components/ui/node";
import ConnectionLine from "@/components/ui/connection-line";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ZoomIn, ZoomOut, Save } from "lucide-react";

interface CanvasNode {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CanvasWorkspaceProps {
  onNodeSelect?: (nodeId: string) => void;
  onSave?: (nodes: CanvasNode[], connections: Connection[]) => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  onNodeSelect = () => {},
  onSave = () => {},
}) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([
    { id: "1", type: "EC2", title: "Web Server", x: 200, y: 150 },
    { id: "2", type: "RDS", title: "Database", x: 500, y: 300 },
    { id: "3", type: "S3", title: "Storage Bucket", x: 300, y: 450 },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "conn-1",
      sourceId: "1",
      targetId: "2",
      startX: 250,
      startY: 200,
      endX: 500,
      endY: 300,
    },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [newConnectionStart, setNewConnectionStart] = useState({
    nodeId: "",
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setSelectedConnectionId(null);
      onNodeSelect(nodeId);
    },
    [onNodeSelect],
  );

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedNodeId(null);
  }, []);

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - node.x,
          y: e.clientY - node.y,
        });
        handleNodeClick(nodeId);
      }
    },
    [nodes, handleNodeClick],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && selectedNodeId) {
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === selectedNodeId
              ? {
                  ...node,
                  x: e.clientX - dragOffset.x,
                  y: e.clientY - dragOffset.y,
                }
              : node,
          ),
        );

        // Update connections
        setConnections((prevConnections) =>
          prevConnections.map((conn) => {
            if (conn.sourceId === selectedNodeId) {
              return {
                ...conn,
                startX: e.clientX - dragOffset.x + 50,
                startY: e.clientY - dragOffset.y + 50,
              };
            } else if (conn.targetId === selectedNodeId) {
              return {
                ...conn,
                endX: e.clientX - dragOffset.x + 50,
                endY: e.clientY - dragOffset.y + 50,
              };
            }
            return conn;
          }),
        );
      } else if (isCreatingConnection) {
        // Update the temporary connection end point
      }
    },
    [isDragging, selectedNodeId, dragOffset, isCreatingConnection],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (isCreatingConnection) {
      // Finish creating connection if over a valid target
      setIsCreatingConnection(false);
    }
  }, [isCreatingConnection]);

  const startConnectionCreation = useCallback(
    (nodeId: string, x: number, y: number) => {
      setIsCreatingConnection(true);
      setNewConnectionStart({ nodeId, x, y });
    },
    [],
  );

  const deleteSelectedItem = useCallback(() => {
    if (selectedNodeId) {
      setNodes((prevNodes) =>
        prevNodes.filter((node) => node.id !== selectedNodeId),
      );
      setConnections((prevConnections) =>
        prevConnections.filter(
          (conn) =>
            conn.sourceId !== selectedNodeId &&
            conn.targetId !== selectedNodeId,
        ),
      );
      setSelectedNodeId(null);
    } else if (selectedConnectionId) {
      setConnections((prevConnections) =>
        prevConnections.filter((conn) => conn.id !== selectedConnectionId),
      );
      setSelectedConnectionId(null);
    }
  }, [selectedNodeId, selectedConnectionId]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleSave = useCallback(() => {
    onSave(nodes, connections);
  }, [nodes, connections, onSave]);

  const addNewNode = useCallback(() => {
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      type: "EC2", // Default type
      title: "New Service",
      x: 300,
      y: 300,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
  }, []);

  return (
    <div className="relative w-full h-full bg-background">
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button size="icon" variant="outline" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={addNewNode}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={deleteSelectedItem}
          disabled={!selectedNodeId && !selectedConnectionId}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleSave}>
          <Save className="h-4 w-4" />
        </Button>
      </div>

      <CanvasContainer
        className="w-full h-full overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* SVG for connections */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {connections.map((connection) => (
              <g key={connection.id} className="pointer-events-auto">
                <ConnectionLine
                  startX={connection.startX}
                  startY={connection.startY}
                  endX={connection.endX}
                  endY={connection.endY}
                  isSelected={connection.id === selectedConnectionId}
                  onClick={() => handleConnectionClick(connection.id)}
                />
              </g>
            ))}

            {isCreatingConnection && (
              <ConnectionLine
                startX={newConnectionStart.x}
                startY={newConnectionStart.y}
                endX={0} // Will be updated during mouse move
                endY={0} // Will be updated during mouse move
                isCreating={true}
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute cursor-move"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <Node
                title={node.title}
                type={node.type}
                selected={node.id === selectedNodeId}
                icon={<div className="text-lg">AWS</div>}
              />
            </div>
          ))}
        </div>
      </CanvasContainer>
    </div>
  );
};

export default CanvasWorkspace;
