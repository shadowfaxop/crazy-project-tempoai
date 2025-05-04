import { ServiceType, SERVICE_CONFIGS } from "./aws-service-configs";

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

export function generateTerraformCode(
  nodes: NodeData[],
  connections: ConnectionData[],
): {
  mainTf: string;
  variablesTf: string;
  outputsTf: string;
} {
  // Sort nodes based on dependencies
  const sortedNodes = sortNodesByDependency(nodes, connections);

  // Generate provider block
  const providerBlock = `provider "aws" {
  region = var.aws_region
}`;

  // Generate resource blocks
  const resourceBlocks = sortedNodes
    .map((node) => {
      const serviceConfig = SERVICE_CONFIGS[node.type];
      if (!serviceConfig) return "";

      const resourceType = serviceConfig.terraformType;
      const resourceName = node.id.replace(/[^a-zA-Z0-9_]/g, "_");

      // Start building the resource block
      let resourceBlock = `resource "${resourceType}" "${resourceName}" {`;

      // Add all configured fields
      Object.entries(node.config || {}).forEach(([key, value]) => {
        if (key === "tags") {
          // Handle tags specially
          if (value && Object.keys(value).length > 0) {
            resourceBlock += "\n  tags = {";
            Object.entries(value).forEach(([tagKey, tagValue]) => {
              resourceBlock += `\n    ${tagKey} = "${tagValue}"`;
            });
            resourceBlock += "\n  }";
          }
        } else if (Array.isArray(value)) {
          // Handle arrays
          resourceBlock += `\n  ${key} = [${value.map((v) => `"${v}"`).join(", ")}]`;
        } else if (typeof value === "boolean") {
          // Handle booleans
          resourceBlock += `\n  ${key} = ${value}`;
        } else if (typeof value === "number") {
          // Handle numbers
          resourceBlock += `\n  ${key} = ${value}`;
        } else if (value) {
          // Handle strings and other values
          // Special case for passwords - use variable reference
          if (key === "password") {
            resourceBlock += `\n  ${key} = var.${resourceName}_${key}`;
          } else {
            resourceBlock += `\n  ${key} = "${value}"`;
          }
        }
      });

      // Special handling for specific resource types
      if (resourceType === "aws_dynamodb_table") {
        // Add attribute blocks for hash and range keys
        if (node.config?.hash_key) {
          resourceBlock += `\n  attribute {\n    name = "${node.config.hash_key}"\n    type = "${node.config.hash_key_type || "S"}"\n  }`;
        }
        if (node.config?.range_key) {
          resourceBlock += `\n  attribute {\n    name = "${node.config.range_key}"\n    type = "${node.config.range_key_type || "S"}"\n  }`;
        }
      }

      // Close the resource block
      resourceBlock += "\n}";

      return resourceBlock;
    })
    .filter(Boolean)
    .join("\n\n");

  // Generate connection-related resources (e.g., security group rules, attachments)
  const connectionResources = connections
    .map((connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.sourceId);
      const targetNode = nodes.find((n) => n.id === connection.targetId);

      if (!sourceNode || !targetNode) return "";

      const sourceType = sourceNode.type;
      const targetType = targetNode.type;
      const sourceResourceName = connection.sourceId.replace(
        /[^a-zA-Z0-9_]/g,
        "_",
      );
      const targetResourceName = connection.targetId.replace(
        /[^a-zA-Z0-9_]/g,
        "_",
      );

      // Handle different connection types based on the source and target resources
      if (sourceType === "ec2" && targetType === "ebs") {
        return `resource "aws_volume_attachment" "${connection.id.replace(/[^a-zA-Z0-9_]/g, "_")}" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.${targetResourceName}.id
  instance_id = aws_instance.${sourceResourceName}.id
}`;
      }

      if (sourceType === "ec2" && targetType === "s3") {
        return `# IAM role and policy for EC2 to access S3 bucket
resource "aws_iam_role" "${sourceResourceName}_s3_access" {
  name = "${sourceResourceName}-s3-access"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "${sourceResourceName}_s3_access_policy" {
  name = "${sourceResourceName}-s3-access-policy"
  role = aws_iam_role.${sourceResourceName}_s3_access.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Effect = "Allow"
        Resource = [
          "\${aws_s3_bucket.${targetResourceName}.arn}",
          "\${aws_s3_bucket.${targetResourceName}.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "${sourceResourceName}_profile" {
  name = "${sourceResourceName}-profile"
  role = aws_iam_role.${sourceResourceName}_s3_access.name
}`;
      }

      if (sourceType === "lambda" && targetType === "dynamodb") {
        return `# IAM role and policy for Lambda to access DynamoDB
resource "aws_iam_role" "${sourceResourceName}_dynamodb_access" {
  name = "${sourceResourceName}-dynamodb-access"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "${sourceResourceName}_dynamodb_access_policy" {
  name = "${sourceResourceName}-dynamodb-access-policy"
  role = aws_iam_role.${sourceResourceName}_dynamodb_access.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Effect = "Allow"
        Resource = "\${aws_dynamodb_table.${targetResourceName}.arn}"
      }
    ]
  })
}`;
      }

      // Default case - just add a comment
      return `# Connection from ${sourceNode.title} (${sourceType}) to ${targetNode.title} (${targetType})\n# Connection type: ${connection.type || "default"}\n# ${connection.description || "No description provided"}`;
    })
    .filter(Boolean)
    .join("\n\n");

  // Combine all resource blocks
  const mainTf = [
    "# Generated Terraform Code",
    providerBlock,
    resourceBlocks,
    connectionResources,
  ]
    .filter(Boolean)
    .join("\n\n");

  // Generate variables.tf
  const variableBlocks = [
    `variable "aws_region" {\n  description = "AWS region"\n  type        = string\n  default     = "us-east-1"\n}`,
  ];

  // Add password variables for RDS instances
  nodes.forEach((node) => {
    if (node.type === "rds" && node.config?.password) {
      const resourceName = node.id.replace(/[^a-zA-Z0-9_]/g, "_");
      variableBlocks.push(
        `variable "${resourceName}_password" {\n  description = "Password for ${node.title} database"\n  type        = string\n  sensitive   = true\n}`,
      );
    }
  });

  const variablesTf = ["# Variables", ...variableBlocks].join("\n\n");

  // Generate outputs.tf
  const outputBlocks = nodes
    .map((node) => {
      const resourceName = node.id.replace(/[^a-zA-Z0-9_]/g, "_");
      const serviceConfig = SERVICE_CONFIGS[node.type];
      if (!serviceConfig) return "";

      const resourceType = serviceConfig.terraformType;

      switch (node.type) {
        case "ec2":
          return `output "${resourceName}_public_ip" {\n  description = "Public IP of ${node.title}"\n  value       = aws_instance.${resourceName}.public_ip\n}`;
        case "s3":
          return `output "${resourceName}_bucket_name" {\n  description = "Name of ${node.title}"\n  value       = aws_s3_bucket.${resourceName}.bucket\n}`;
        case "rds":
          return `output "${resourceName}_endpoint" {\n  description = "Endpoint of ${node.title}"\n  value       = aws_db_instance.${resourceName}.endpoint\n}`;
        case "lambda":
          return `output "${resourceName}_function_name" {\n  description = "Name of ${node.title}"\n  value       = aws_lambda_function.${resourceName}.function_name\n}`;
        case "dynamodb":
          return `output "${resourceName}_table_name" {\n  description = "Name of ${node.title}"\n  value       = aws_dynamodb_table.${resourceName}.name\n}`;
        default:
          return "";
      }
    })
    .filter(Boolean);

  const outputsTf = ["# Outputs", ...outputBlocks].join("\n\n");

  return {
    mainTf,
    variablesTf,
    outputsTf,
  };
}

// Function to sort nodes based on dependencies
function sortNodesByDependency(
  nodes: NodeData[],
  connections: ConnectionData[],
): NodeData[] {
  // Create a dependency graph
  const dependencyGraph: Record<string, string[]> = {};

  // Initialize the graph with all nodes
  nodes.forEach((node) => {
    dependencyGraph[node.id] = [];
  });

  // Add dependencies based on connections
  connections.forEach((connection) => {
    // The target depends on the source
    if (dependencyGraph[connection.targetId]) {
      dependencyGraph[connection.targetId].push(connection.sourceId);
    }
  });

  // Add explicit dependencies from node.dependsOn if available
  nodes.forEach((node) => {
    if ((node as any).dependsOn && Array.isArray((node as any).dependsOn)) {
      dependencyGraph[node.id] = [
        ...dependencyGraph[node.id],
        ...(node as any).dependsOn,
      ];
    }
  });

  // Topological sort
  const visited: Record<string, boolean> = {};
  const temp: Record<string, boolean> = {};
  const order: string[] = [];

  // Visit function for topological sort
  function visit(nodeId: string): void {
    // If temporary mark, we have a cycle
    if (temp[nodeId]) {
      // Handle cycle by breaking it
      return;
    }

    // If not visited
    if (!visited[nodeId]) {
      // Mark temporarily
      temp[nodeId] = true;

      // Visit all dependencies
      dependencyGraph[nodeId].forEach((depId) => {
        visit(depId);
      });

      // Mark visited and remove temporary mark
      visited[nodeId] = true;
      temp[nodeId] = false;

      // Add to order
      order.push(nodeId);
    }
  }

  // Visit all nodes
  nodes.forEach((node) => {
    if (!visited[node.id]) {
      visit(node.id);
    }
  });

  // Reverse to get correct order (dependencies first)
  order.reverse();

  // Map order back to nodes
  const nodeMap: Record<string, NodeData> = {};
  nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });

  return order.map((id) => nodeMap[id]).filter(Boolean);
}
