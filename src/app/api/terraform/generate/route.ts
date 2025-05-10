import { NextResponse } from "next/server";
import { generateTerraformCode } from "@/lib/terraform-generator";
import { ServiceType } from "@/lib/aws-service-configs";

interface NodeData {
  id: string;
  type: ServiceType;
  title: string;
  config: Record<string, any>;
}

interface ConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const { nodes, connections } = (await request.json()) as {
      nodes: NodeData[];
      connections: ConnectionData[];
    };

    const result = generateTerraformCode(nodes, connections);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating Terraform code:", error);
    return NextResponse.json(
      { error: "Failed to generate Terraform code" },
      { status: 500 },
    );
  }
}
