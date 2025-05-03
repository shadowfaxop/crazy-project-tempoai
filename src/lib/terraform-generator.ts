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
  connections: ConnectionData[]
): {
  mainTf: string;
  variablesTf: string;
  outputsTf: string;
} {
  // Generate provider block
  const providerBlock = `provider "aws" {
  region = var.aws_region
}`;

  // Generate resource blocks
  const resourceBlocks = nodes.map(node => {
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
        resourceBlock += `\n  ${key} = [${value.map(v => `"${v}"`).join(", ")}]`;
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
        resourceBlock += `\n  attribute {\n    name = "${node.config.hash_key}"\n    type = "${node.config.hash_key_type || 'S'}"\n  }`;
      }
      if (node.config?.range_key) {
        resourceBlock += `\n  attribute {\n    name = "${node.config.range_key}"\n    type = "${node.config.range_key_type || 'S'}"\n  }`;
      }
    }
    
    // Close the resource block
    resourceBlock += "\n}";
    
    return resourceBlock;
  }).filter(Boolean).join("\n\n");

  // Generate connection-related resources (e.g., security group rules, attachments)
  const connectionResources = connections.map(connection => {
    const sourceNode = nodes.find(n => n.id === connection.sourceId);
    const targetNode = nodes.find(n => n.id === connection.targetId);
    
    if (!sourceNode || !targetNode) return "";
    
    const sourceType = sourceNode.type;
    const targetType = targetNode.type;
    const sourceResourceName = connection.sourceId.replace(/[^a-zA-Z0-9_]/g, "_");
    const targetResourceName = connection.targetId.replace(/[^a-zA-Z0-9_]/g, "_");
    
    // Handle different connection types based on the source and target resources
    if (sourceType === "ec2" && targetType === "ebs") {
      return `resource "aws_volume_attachment" "${connection.id.replace(/[^a-zA-Z0-9_]/g, "_")}" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.${targetResourceName}.id
  instance_id = aws_instance.${sourceResourceName}.id
}`;
    }
    
    if (sourceType === "ec2" && targetType === "s3") {
      return `# IAM role and policy for EC2 to access S3 bucket\nresource "aws_iam_role" "${sourceResourceName}_s3_access" {\n  name = "${sourceResourceName}-s3-access"\n  assume_role_policy = jsonencode({\n    Version = "2012-10-17"\n    Statement = [\n      {\n        Action = "sts:AssumeRole"\n        Effect = "Allow"\n        Principal = {\n          Service = "ec2.amazonaws.com"\n        }\n      }\n    ]\n  })\n}\n\nresource "aws_iam_role_policy" "${sourceResourceName}_s3_access_policy" {\n  name = "${sourceResourceName}-s3-access-policy"\n  role = aws_iam_role.${sourceResourceName}_s3_access.id\n  policy = jsonencode({\n    Version = "2012-10-17"\n    Statement = [\n      {\n        Action = [\n          "s3:GetObject",\n          "s3:PutObject",\n          "s3:ListBucket"\n        ]\n        Effect = "Allow"\n        Resource = [\n          aws_s3_bucket.${targetResourceName}.arn,\n          "${aws_s3_bucket.${targetResourceName}.arn}/*"\n        ]\n      }\n    ]\n  })\n}\n\nresource "aws_iam_instance_profile" "${sourceResourceName}_profile" {\n  name = "${sourceResourceName}-profile"\n  role = aws_iam_role.${sourceResourceName}_s3_access.name\n}`;
    }
    
    if (sourceType === "lambda" && targetType === "dynamodb") {
      return `# IAM role and policy for Lambda to access DynamoDB\nresource "aws_iam_role" "${sourceResourceName}_dynamodb_access" {\n  name = "${sourceResourceName}-dynamodb-access"\n  assume_role_policy = jsonencode({\n    Version = "2012-10-17"\n    Statement = [\n      {\n        Action = "sts:AssumeRole"\n        Effect = "Allow"\n        Principal = {\n          Service = "lambda.amazonaws.com"\n        }\n      }\n    ]\n  })\n}\n\nresource "aws_iam_role_policy" "${sourceResourceName}_dynamodb_access_policy" {\n  name = "${sourceResourceName}-dynamodb-access-policy"\n  role = aws_iam_role.${sourceResourceName}_dynamodb_access.id\n  policy = jsonencode({\n    Version = "2012-10-17"\n    Statement = [\n      {\n        Action = [\n          "dynamodb:GetItem",\n          "dynamodb:PutItem",\n          "dynamodb:UpdateItem",\n          "dynamodb:DeleteItem",\n          "dynamodb:Query",\n          "dynamodb:Scan"\n        ]\n        Effect = "Allow"\n        Resource = aws_dynamodb_table.${targetResourceName}.arn\n      }\n    ]\n  })\n}`;
    }
    
    // Default case - just add a comment
    return `# Connection from ${sourceNode.title} (${sourceType}) to ${targetNode.title} (${targetType})\n# Connection type: ${connection.type || 'default'}\n# ${connection.description || 'No description provided'}`;
  }).filter(Boolean).join("\n\n");

  // Combine all resource blocks
  const mainTf = [
    "# Generated Terraform Code",
    providerBlock,
    resourceBlocks,
    connectionResources
  ].filter(Boolean).join("\n\n");

  // Generate variables.tf
  const variableBlocks = [
    `variable "aws_region" {\n  description = "AWS region"\n  type        = string\n  default     = "us-east-1"\n}`,
  ];

  // Add password variables for RDS instances
  nodes.forEach(node => {
    if (node.type === "rds" && node.config?.password) {
      const resourceName = node.id.replace(/[^a-zA-Z0-9_]/g, "_");
      variableBlocks.push(`variable "${resourceName}_password" {\n  description = "Password for ${node.title} database"\n  type        = string\n  sensitive   = true\n}`);
    }
  });

  const variablesTf = ["# Variables", ...variableBlocks].join("\n\n");

  // Generate outputs.tf
  const outputBlocks = nodes.map(node => {
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
  }).filter(Boolean);

  const outputsTf = ["# Outputs", ...outputBlocks].join("\n\n");

  return {
    mainTf,
    variablesTf,
    outputsTf
  };
}
