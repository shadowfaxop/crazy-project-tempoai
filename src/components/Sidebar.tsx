import React from "react";
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
} from "lucide-react";

interface SidebarProps {
  onDragStart: (event: React.DragEvent, serviceType: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDragStart = () => {} }) => {
  return (
    <div className="w-64 h-full border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AWS Services</h2>
        <div className="mt-2 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search services..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="compute" className="flex-1">
        <div className="px-4 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="compute" className="flex-1">
              Compute
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex-1">
              Storage
            </TabsTrigger>
            <TabsTrigger value="database" className="flex-1">
              Database
            </TabsTrigger>
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
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full mb-2">
          Save Project
        </Button>
        <Button className="w-full">Generate Terraform</Button>
      </div>
    </div>
  );
};

export default Sidebar;
