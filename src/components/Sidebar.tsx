import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCard } from "@/components/ui/service-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Server,
  Database,
  HardDrive,
  Box,
  Cloud,
  Globe,
  Network,
  Shield,
  FileText,
} from "lucide-react";
import { ServiceType } from "@/lib/aws-service-configs";

interface SidebarProps {
  onDragStart: (event: React.DragEvent, serviceType: ServiceType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDragStart = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="w-72 h-full border-r bg-background flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AWS Services</h2>
        <div className="mt-2 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        defaultValue="compute"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 pt-4">
          <TabsList className="w-full grid grid-cols-4 gap-1">
            <TabsTrigger value="compute">Compute</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="compute" className="mt-0 space-y-4">
            <ServiceCard
              title="EC2 Instance"
              icon={<Server className="h-5 w-5" />}
              description="Virtual server in the cloud"
              draggable
              onDragStart={(e) => onDragStart(e, "ec2")}
            />
            <ServiceCard
              title="Lambda Function"
              icon={<Box className="h-5 w-5" />}
              description="Run code without provisioning servers"
              draggable
              onDragStart={(e) => onDragStart(e, "lambda")}
            />
            <ServiceCard
              title="ECS Cluster"
              icon={<Cloud className="h-5 w-5" />}
              description="Run containerized applications"
              draggable
              onDragStart={(e) => onDragStart(e, "ecs")}
            />
          </TabsContent>

          <TabsContent value="storage" className="mt-0 space-y-4">
            <ServiceCard
              title="S3 Bucket"
              icon={<HardDrive className="h-5 w-5" />}
              description="Object storage service"
              draggable
              onDragStart={(e) => onDragStart(e, "s3")}
            />
            <ServiceCard
              title="EBS Volume"
              icon={<HardDrive className="h-5 w-5" />}
              description="Block storage for EC2 instances"
              draggable
              onDragStart={(e) => onDragStart(e, "ebs")}
            />
          </TabsContent>

          <TabsContent value="database" className="mt-0 space-y-4">
            <ServiceCard
              title="RDS Instance"
              icon={<Database className="h-5 w-5" />}
              description="Managed relational database service"
              draggable
              onDragStart={(e) => onDragStart(e, "rds")}
            />
            <ServiceCard
              title="DynamoDB Table"
              icon={<Database className="h-5 w-5" />}
              description="NoSQL database service"
              draggable
              onDragStart={(e) => onDragStart(e, "dynamodb")}
            />
          </TabsContent>

          <TabsContent value="network" className="mt-0 space-y-4">
            <ServiceCard
              title="Subnet"
              icon={<Network className="h-5 w-5" />}
              description="A subnet in a VPC"
              draggable
              onDragStart={(e) => onDragStart(e, "subnet")}
            />
            <ServiceCard
              title="Security Group"
              icon={<Shield className="h-5 w-5" />}
              description="Firewall rules for your resources"
              draggable
              onDragStart={(e) => onDragStart(e, "securitygroup")}
            />
            <ServiceCard
              title="CloudFront Distribution"
              icon={<Globe className="h-5 w-5" />}
              description="Content delivery network"
              draggable
              onDragStart={(e) => onDragStart(e, "cdn")}
            />
            <ServiceCard
              title="CloudWatch Logs"
              icon={<FileText className="h-5 w-5" />}
              description="Log storage and monitoring"
              draggable
              onDragStart={(e) => onDragStart(e, "cloudwatchlogs")}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t">
        <Button className="w-full">Generate Terraform</Button>
      </div>
    </div>
  );
};

export default Sidebar;
