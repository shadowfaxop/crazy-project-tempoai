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

interface TerraformGenerateResponse {
  mainTf: string;
  variablesTf: string;
  outputsTf: string;
}

// Updated to use Next.js API route
export async function generateTerraformCode(
  nodes: NodeData[],
  connections: ConnectionData[],
): Promise<TerraformGenerateResponse> {
  try {
    const response = await fetch("/api/terraform/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nodes, connections }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate Terraform code");
    }

    return response.json();
  } catch (error) {
    console.error("Error calling Terraform API:", error);

    // Fallback to local generation for development/testing
    if (process.env.NODE_ENV === "development") {
      console.log("Falling back to local generation");
      const { generateTerraformCode: localGenerate } = await import(
        "@/lib/terraform-generator"
      );
      return localGenerate(nodes, connections);
    }

    throw error;
  }
}
