import React, { useState, useRef, useEffect } from "react";
import { CanvasContainer } from "@/components/ui/canvas-container";
import { Node } from "@/components/ui/node";
import { Connection } from "@/components/ui/connection";
import { Server, Database, HardDrive, Box, Cloud } from "lucide-react";

interface NodeItem {
  id: string;
  type: string;
  x: number;
  y: number;
  title: string;
}

interface ConnectionItem {
  id: string;
  sourceId: string;
  targetId: string;
}

const Canvas: React.FC = () => {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const serviceType = e.dataTransfer.getData("serviceType");
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
    };

    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const getServiceTitle = (type: string): string => {
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

  const getServiceIcon = (type: string) => {
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

    setSelectedNodeId(nodeId);
    setIsDragging(true);

    // Calculate offset from node position to mouse position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
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

      setNodes(
        nodes.map((node) =>
          node.id === selectedNodeId ? { ...node, x, y } : node,
        ),
      );
    } else if (isConnecting && connectionStart && canvasRef.current) {
      // Handle drawing connection line while connecting
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
  };

  const handleConnectionClick = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedNodeId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas, not on a node or connection
    if (e.target === canvasRef.current) {
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
    }
  };

  const startConnection = (nodeId: string, x: number, y: number) => {
    setIsConnecting(true);
    setConnectionStart({ id: nodeId, x, y });
  };

  const completeConnection = (targetNodeId: string) => {
    if (connectionStart && targetNodeId !== connectionStart.id) {
      const newConnection: ConnectionItem = {
        id: `conn-${Date.now()}`,
        sourceId: connectionStart.id,
        targetId: targetNodeId,
      };
      setConnections([...connections, newConnection]);
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  return (
    <CanvasContainer
      ref={canvasRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {connections.map((connection) => {
          const sourceNode = nodes.find((n) => n.id === connection.sourceId);
          const targetNode = nodes.find((n) => n.id === connection.targetId);

          if (!sourceNode || !targetNode) return null;

          return (
            <Connection
              key={connection.id}
              startX={sourceNode.x + 50}
              startY={sourceNode.y + 50}
              endX={targetNode.x + 50}
              endY={targetNode.y + 50}
              selected={selectedConnectionId === connection.id}
              onClick={() => handleConnectionClick(connection.id)}
              className="pointer-events-auto"
            />
          );
        })}
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
          onClick={() => handleNodeClick(node.id)}
        >
          <Node
            title={node.title}
            type={node.type}
            icon={getServiceIcon(node.type)}
            selected={selectedNodeId === node.id}
          />
        </div>
      ))}
    </CanvasContainer>
  );
};

export default Canvas;
