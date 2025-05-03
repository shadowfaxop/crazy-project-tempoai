import React, { useState, useRef, useEffect } from "react";
import { CanvasContainer } from "@/components/ui/canvas-container";
import { Node } from "@/components/ui/node";
import ConnectionLine from "@/components/ui/connection-line";
import { Server, Database, HardDrive, Box, Cloud, Plus } from "lucide-react";
import { ServiceType } from "@/lib/aws-service-configs";

export interface NodeItem {
  id: string;
  type: ServiceType;
  x: number;
  y: number;
  title: string;
  config: Record<string, any>;
}

export interface ConnectionItem {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  description?: string;
}

interface CanvasProps {
  nodes: NodeItem[];
  connections: ConnectionItem[];
  onNodesChange: (nodes: NodeItem[]) => void;
  onConnectionsChange: (connections: ConnectionItem[]) => void;
  onSelectNode: (nodeId: string | null) => void;
  onSelectConnection: (connectionId: string | null) => void;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
}

const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  onSelectNode,
  onSelectConnection,
  selectedNodeId,
  selectedConnectionId,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const serviceType = e.dataTransfer.getData("serviceType") as ServiceType;
    if (!serviceType || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    const newNode: NodeItem = {
      id: `node-${Date.now()}`,
      type: serviceType,
      x,
      y,
      title: getServiceTitle(serviceType),
      config: {},
    };

    onNodesChange([...nodes, newNode]);
    onSelectNode(newNode.id);
  };

  const getServiceTitle = (type: ServiceType): string => {
    switch (type) {
      case "ec2":
        return "EC2 Instance";
      case "s3":
        return "S3 Bucket";
      case "rds":
        return "RDS Instance";
      case "lambda":
        return "Lambda Function";
      case "dynamodb":
        return "DynamoDB Table";
      case "ebs":
        return "EBS Volume";
      case "ecs":
        return "ECS Cluster";
      default:
        return "AWS Service";
    }
  };

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case "ec2":
        return <Server className="h-6 w-6" />;
      case "s3":
        return <HardDrive className="h-6 w-6" />;
      case "rds":
        return <Database className="h-6 w-6" />;
      case "lambda":
        return <Box className="h-6 w-6" />;
      case "dynamodb":
        return <Database className="h-6 w-6" />;
      case "ebs":
        return <HardDrive className="h-6 w-6" />;
      case "ecs":
        return <Cloud className="h-6 w-6" />;
      default:
        return <Server className="h-6 w-6" />;
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return; // Only left mouse button

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // If holding shift, start connection
    if (e.shiftKey) {
      e.stopPropagation();
      setIsConnecting(true);
      setConnectionStart({ id: nodeId, x: node.x, y: node.y });
      setConnectionEnd({ x: node.x, y: node.y });
      return;
    }

    onSelectNode(nodeId);
    setIsDragging(true);

    // Calculate offset from node position to mouse position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedNodeId && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - dragOffset.x;
      const y = e.clientY - canvasRect.top - dragOffset.y;

      const updatedNodes = nodes.map((node) =>
        node.id === selectedNodeId ? { ...node, x, y } : node,
      );

      onNodesChange(updatedNodes);
    } else if (isConnecting && connectionStart && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      setConnectionEnd({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);

    if (isConnecting && connectionStart && connectionEnd) {
      // Check if mouse is over a node
      const targetNode = nodes.find((node) => {
        const dx = node.x - connectionEnd.x;
        const dy = node.y - connectionEnd.y;
        // Check if within 50px radius of node center
        return Math.sqrt(dx * dx + dy * dy) < 50;
      });

      if (targetNode && targetNode.id !== connectionStart.id) {
        // Create a new connection
        const newConnection: ConnectionItem = {
          id: `conn-${Date.now()}`,
          sourceId: connectionStart.id,
          targetId: targetNode.id,
          type: "default",
        };

        onConnectionsChange([...connections, newConnection]);
        onSelectConnection(newConnection.id);
      }

      setIsConnecting(false);
      setConnectionStart(null);
      setConnectionEnd(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas, not on a node or connection
    if (e.target === canvasRef.current) {
      onSelectNode(null);
      onSelectConnection(null);
    }
  };

  const handleConnectionClick = (connectionId: string) => {
    onSelectConnection(connectionId);
    onSelectNode(null);
  };

  return (
    <CanvasContainer
      ref={canvasRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      className={isConnecting ? "cursor-crosshair" : undefined}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Existing connections */}
        {connections.map((connection) => {
          const sourceNode = nodes.find((n) => n.id === connection.sourceId);
          const targetNode = nodes.find((n) => n.id === connection.targetId);

          if (!sourceNode || !targetNode) return null;

          return (
            <g key={connection.id} className="pointer-events-auto">
              <ConnectionLine
                startX={sourceNode.x}
                startY={sourceNode.y}
                endX={targetNode.x}
                endY={targetNode.y}
                isSelected={selectedConnectionId === connection.id}
                onClick={() => handleConnectionClick(connection.id)}
              />
            </g>
          );
        })}

        {/* Connection being created */}
        {isConnecting && connectionStart && connectionEnd && (
          <ConnectionLine
            startX={connectionStart.x}
            startY={connectionStart.y}
            endX={connectionEnd.x}
            endY={connectionEnd.y}
            isCreating={true}
          />
        )}
      </svg>

      {nodes.map((node) => (
        <div
          key={node.id}
          style={{
            position: "absolute",
            left: `${node.x}px`,
            top: `${node.y}px`,
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
        >
          <Node
            title={node.title}
            type={node.type}
            icon={getServiceIcon(node.type)}
            selected={selectedNodeId === node.id}
          >
            {isConnecting && (
              <div className="absolute -right-2 -top-2 bg-primary text-primary-foreground rounded-full p-1">
                <Plus className="h-3 w-3" />
              </div>
            )}
          </Node>
        </div>
      ))}

      {/* Instructions overlay */}
      <div className="absolute bottom-4 right-4 bg-background/80 p-3 rounded-md shadow-sm border text-xs">
        <p>
          <strong>Tip:</strong> Hold Shift + Click on a node to create
          connections
        </p>
      </div>
    </CanvasContainer>
  );
};

export default Canvas;
