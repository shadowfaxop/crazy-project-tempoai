// Configuration schemas for different AWS services

export interface ServiceConfigField {
  name: string;
  label: string;
  type: "text" | "select" | "number" | "boolean" | "tags" | "multiselect";
  placeholder?: string;
  options?: { value: string; label: string }[];
  default?: any;
  required?: boolean;
  min?: number;
  max?: number;
  description?: string;
  category?: string;
}

export interface ServiceConfig {
  name: string;
  description: string;
  icon: string;
  fields: ServiceConfigField[];
  terraformType: string;
}

export const EC2_CONFIG: ServiceConfig = {
  name: "EC2 Instance",
  description: "Virtual server in the cloud",
  icon: "Server",
  terraformType: "aws_instance",
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "my-ec2-instance",
      required: true,
      category: "General",
    },
    {
      name: "instance_type",
      label: "Instance Type",
      type: "select",
      options: [
        { value: "t2.micro", label: "t2.micro (1 vCPU, 1 GiB RAM)" },
        { value: "t2.small", label: "t2.small (1 vCPU, 2 GiB RAM)" },
        { value: "t2.medium", label: "t2.medium (2 vCPU, 4 GiB RAM)" },
        { value: "t3.micro", label: "t3.micro (2 vCPU, 1 GiB RAM)" },
        { value: "t3.small", label: "t3.small (2 vCPU, 2 GiB RAM)" },
        { value: "t3.medium", label: "t3.medium (2 vCPU, 4 GiB RAM)" },
        { value: "m5.large", label: "m5.large (2 vCPU, 8 GiB RAM)" },
        { value: "m5.xlarge", label: "m5.xlarge (4 vCPU, 16 GiB RAM)" },
      ],
      default: "t2.micro",
      required: true,
      category: "Instance Details",
    },
    {
      name: "ami",
      label: "AMI ID",
      type: "select",
      options: [
        {
          value: "ami-0c55b159cbfafe1f0",
          label: "Amazon Linux 2 AMI (HVM), SSD Volume Type",
        },
        {
          value: "ami-0b5eea76982371e91",
          label: "Ubuntu Server 20.04 LTS (HVM), SSD Volume Type",
        },
        {
          value: "ami-0a8e758f5e873d1c1",
          label: "Red Hat Enterprise Linux 8 (HVM), SSD Volume Type",
        },
        { value: "ami-0c2b8ca1dad447f8a", label: "Windows Server 2019 Base" },
      ],
      default: "ami-0c55b159cbfafe1f0",
      required: true,
      category: "Instance Details",
    },
    {
      name: "associate_public_ip_address",
      label: "Associate Public IP",
      type: "boolean",
      default: true,
      category: "Networking",
    },
    {
      name: "vpc_security_group_ids",
      label: "Security Groups",
      type: "multiselect",
      options: [
        { value: "sg-default", label: "Default Security Group" },
        { value: "sg-web", label: "Web Traffic (HTTP/HTTPS)" },
        { value: "sg-ssh", label: "SSH Access" },
      ],
      category: "Networking",
    },
    {
      name: "subnet_id",
      label: "Subnet",
      type: "select",
      options: [
        { value: "subnet-public1", label: "Public Subnet 1" },
        { value: "subnet-public2", label: "Public Subnet 2" },
        { value: "subnet-private1", label: "Private Subnet 1" },
        { value: "subnet-private2", label: "Private Subnet 2" },
      ],
      category: "Networking",
    },
    {
      name: "root_volume_size",
      label: "Root Volume Size (GB)",
      type: "number",
      default: 8,
      min: 8,
      max: 16384,
      category: "Storage",
    },
    {
      name: "root_volume_type",
      label: "Root Volume Type",
      type: "select",
      options: [
        { value: "gp2", label: "General Purpose SSD (gp2)" },
        { value: "gp3", label: "General Purpose SSD (gp3)" },
        { value: "io1", label: "Provisioned IOPS SSD (io1)" },
        { value: "standard", label: "Magnetic (standard)" },
      ],
      default: "gp2",
      category: "Storage",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const S3_CONFIG: ServiceConfig = {
  name: "S3 Bucket",
  description: "Object storage service",
  icon: "HardDrive",
  terraformType: "aws_s3_bucket",
  fields: [
    {
      name: "bucket",
      label: "Bucket Name",
      type: "text",
      placeholder: "my-unique-bucket-name",
      required: true,
      category: "General",
    },
    {
      name: "acl",
      label: "Access Control",
      type: "select",
      options: [
        { value: "private", label: "Private" },
        { value: "public-read", label: "Public Read" },
        { value: "public-read-write", label: "Public Read/Write" },
        { value: "authenticated-read", label: "Authenticated Read" },
      ],
      default: "private",
      category: "Permissions",
    },
    {
      name: "versioning",
      label: "Enable Versioning",
      type: "boolean",
      default: false,
      category: "Features",
    },
    {
      name: "encryption",
      label: "Server-side Encryption",
      type: "boolean",
      default: true,
      category: "Security",
    },
    {
      name: "lifecycle_rules",
      label: "Enable Lifecycle Rules",
      type: "boolean",
      default: false,
      category: "Features",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const RDS_CONFIG: ServiceConfig = {
  name: "RDS Instance",
  description: "Managed relational database service",
  icon: "Database",
  terraformType: "aws_db_instance",
  fields: [
    {
      name: "identifier",
      label: "DB Identifier",
      type: "text",
      placeholder: "my-database",
      required: true,
      category: "General",
    },
    {
      name: "engine",
      label: "Database Engine",
      type: "select",
      options: [
        { value: "mysql", label: "MySQL" },
        { value: "postgres", label: "PostgreSQL" },
        { value: "mariadb", label: "MariaDB" },
        { value: "oracle-se2", label: "Oracle Standard Edition 2" },
        { value: "sqlserver-ex", label: "SQL Server Express" },
      ],
      default: "mysql",
      required: true,
      category: "Database Configuration",
    },
    {
      name: "engine_version",
      label: "Engine Version",
      type: "text",
      default: "5.7",
      category: "Database Configuration",
    },
    {
      name: "instance_class",
      label: "Instance Type",
      type: "select",
      options: [
        { value: "db.t3.micro", label: "db.t3.micro" },
        { value: "db.t3.small", label: "db.t3.small" },
        { value: "db.t3.medium", label: "db.t3.medium" },
        { value: "db.m5.large", label: "db.m5.large" },
        { value: "db.m5.xlarge", label: "db.m5.xlarge" },
        { value: "db.r5.large", label: "db.r5.large" },
      ],
      default: "db.t3.micro",
      required: true,
      category: "Instance Details",
    },
    {
      name: "allocated_storage",
      label: "Allocated Storage (GB)",
      type: "number",
      default: 20,
      min: 5,
      max: 16384,
      required: true,
      category: "Storage",
    },
    {
      name: "storage_type",
      label: "Storage Type",
      type: "select",
      options: [
        { value: "gp2", label: "General Purpose SSD (gp2)" },
        { value: "io1", label: "Provisioned IOPS SSD (io1)" },
        { value: "standard", label: "Magnetic" },
      ],
      default: "gp2",
      category: "Storage",
    },
    {
      name: "name",
      label: "Database Name",
      type: "text",
      placeholder: "mydb",
      category: "Database Configuration",
    },
    {
      name: "username",
      label: "Master Username",
      type: "text",
      default: "admin",
      required: true,
      category: "Database Configuration",
    },
    {
      name: "password",
      label: "Master Password",
      type: "text",
      placeholder: "(Will use variable reference)",
      required: true,
      category: "Database Configuration",
    },
    {
      name: "multi_az",
      label: "Multi-AZ Deployment",
      type: "boolean",
      default: false,
      category: "High Availability",
    },
    {
      name: "publicly_accessible",
      label: "Publicly Accessible",
      type: "boolean",
      default: false,
      category: "Networking",
    },
    {
      name: "skip_final_snapshot",
      label: "Skip Final Snapshot",
      type: "boolean",
      default: true,
      category: "Backup",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const LAMBDA_CONFIG: ServiceConfig = {
  name: "Lambda Function",
  description: "Run code without provisioning servers",
  icon: "Box",
  terraformType: "aws_lambda_function",
  fields: [
    {
      name: "function_name",
      label: "Function Name",
      type: "text",
      placeholder: "my-lambda-function",
      required: true,
      category: "General",
    },
    {
      name: "runtime",
      label: "Runtime",
      type: "select",
      options: [
        { value: "nodejs14.x", label: "Node.js 14.x" },
        { value: "nodejs16.x", label: "Node.js 16.x" },
        { value: "python3.8", label: "Python 3.8" },
        { value: "python3.9", label: "Python 3.9" },
        { value: "java11", label: "Java 11" },
        { value: "dotnetcore3.1", label: ".NET Core 3.1" },
        { value: "go1.x", label: "Go 1.x" },
        { value: "ruby2.7", label: "Ruby 2.7" },
      ],
      default: "nodejs14.x",
      required: true,
      category: "Runtime",
    },
    {
      name: "handler",
      label: "Handler",
      type: "text",
      default: "index.handler",
      required: true,
      category: "Runtime",
    },
    {
      name: "memory_size",
      label: "Memory (MB)",
      type: "number",
      default: 128,
      min: 128,
      max: 10240,
      category: "Resources",
    },
    {
      name: "timeout",
      label: "Timeout (seconds)",
      type: "number",
      default: 3,
      min: 1,
      max: 900,
      category: "Resources",
    },
    {
      name: "environment_variables",
      label: "Environment Variables",
      type: "tags",
      placeholder: "KEY=value",
      category: "Configuration",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const DYNAMODB_CONFIG: ServiceConfig = {
  name: "DynamoDB Table",
  description: "NoSQL database service",
  icon: "Database",
  terraformType: "aws_dynamodb_table",
  fields: [
    {
      name: "name",
      label: "Table Name",
      type: "text",
      placeholder: "my-dynamodb-table",
      required: true,
      category: "General",
    },
    {
      name: "billing_mode",
      label: "Billing Mode",
      type: "select",
      options: [
        { value: "PROVISIONED", label: "Provisioned" },
        { value: "PAY_PER_REQUEST", label: "On-Demand" },
      ],
      default: "PAY_PER_REQUEST",
      category: "Capacity",
    },
    {
      name: "read_capacity",
      label: "Read Capacity Units",
      type: "number",
      default: 5,
      min: 1,
      category: "Capacity",
    },
    {
      name: "write_capacity",
      label: "Write Capacity Units",
      type: "number",
      default: 5,
      min: 1,
      category: "Capacity",
    },
    {
      name: "hash_key",
      label: "Partition Key",
      type: "text",
      placeholder: "id",
      required: true,
      category: "Keys",
    },
    {
      name: "hash_key_type",
      label: "Partition Key Type",
      type: "select",
      options: [
        { value: "S", label: "String" },
        { value: "N", label: "Number" },
        { value: "B", label: "Binary" },
      ],
      default: "S",
      required: true,
      category: "Keys",
    },
    {
      name: "range_key",
      label: "Sort Key",
      type: "text",
      placeholder: "timestamp",
      category: "Keys",
    },
    {
      name: "range_key_type",
      label: "Sort Key Type",
      type: "select",
      options: [
        { value: "S", label: "String" },
        { value: "N", label: "Number" },
        { value: "B", label: "Binary" },
      ],
      default: "S",
      category: "Keys",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const EBS_CONFIG: ServiceConfig = {
  name: "EBS Volume",
  description: "Block storage for EC2 instances",
  icon: "HardDrive",
  terraformType: "aws_ebs_volume",
  fields: [
    {
      name: "name",
      label: "Volume Name",
      type: "text",
      placeholder: "my-ebs-volume",
      required: true,
      category: "General",
    },
    {
      name: "availability_zone",
      label: "Availability Zone",
      type: "select",
      // This will be dynamically populated based on selected region
      options: [],
      required: true,
      category: "Location",
    },
    {
      name: "size",
      label: "Size (GB)",
      type: "number",
      default: 8,
      min: 1,
      max: 16384,
      required: true,
      category: "Volume Details",
    },
    {
      name: "volume_type",
      label: "Volume Type",
      type: "select",
      options: [
        { value: "gp2", label: "General Purpose SSD (gp2)" },
        { value: "gp3", label: "General Purpose SSD (gp3)" },
        { value: "io1", label: "Provisioned IOPS SSD (io1)" },
        { value: "io2", label: "Provisioned IOPS SSD (io2)" },
        { value: "sc1", label: "Cold HDD (sc1)" },
        { value: "st1", label: "Throughput Optimized HDD (st1)" },
        { value: "standard", label: "Magnetic (standard)" },
      ],
      default: "gp2",
      required: true,
      category: "Volume Details",
    },
    {
      name: "encrypted",
      label: "Encrypted",
      type: "boolean",
      default: false,
      category: "Security",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const ECS_CONFIG: ServiceConfig = {
  name: "ECS Cluster",
  description: "Run containerized applications",
  icon: "Cloud",
  terraformType: "aws_ecs_cluster",
  fields: [
    {
      name: "name",
      label: "Cluster Name",
      type: "text",
      placeholder: "my-ecs-cluster",
      required: true,
      category: "General",
    },
    {
      name: "capacity_providers",
      label: "Capacity Providers",
      type: "multiselect",
      options: [
        { value: "FARGATE", label: "AWS Fargate" },
        { value: "FARGATE_SPOT", label: "AWS Fargate Spot" },
        { value: "EC2", label: "EC2 Instances" },
      ],
      default: ["FARGATE"],
      category: "Capacity",
    },
    {
      name: "container_insights",
      label: "Enable Container Insights",
      type: "boolean",
      default: false,
      category: "Monitoring",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const SUBNET_CONFIG: ServiceConfig = {
  name: "Subnet",
  description: "A subnet in a VPC",
  icon: "Network",
  terraformType: "aws_subnet",
  fields: [
    {
      name: "name",
      label: "Subnet Name",
      type: "text",
      placeholder: "my-subnet",
      required: true,
      category: "General",
    },
    {
      name: "vpc_id",
      label: "VPC ID",
      type: "text",
      placeholder: "vpc-12345",
      required: true,
      category: "Network",
    },
    {
      name: "cidr_block",
      label: "CIDR Block",
      type: "text",
      placeholder: "10.0.1.0/24",
      required: true,
      category: "Network",
    },
    {
      name: "availability_zone",
      label: "Availability Zone",
      type: "select",
      options: [],
      category: "Network",
    },
    {
      name: "map_public_ip_on_launch",
      label: "Auto-assign Public IP",
      type: "boolean",
      default: false,
      category: "Network",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const SECURITY_GROUP_CONFIG: ServiceConfig = {
  name: "Security Group",
  description: "Firewall rules for your resources",
  icon: "Shield",
  terraformType: "aws_security_group",
  fields: [
    {
      name: "name",
      label: "Security Group Name",
      type: "text",
      placeholder: "my-security-group",
      required: true,
      category: "General",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Allow specific traffic",
      default: "Managed by Terraform",
      category: "General",
    },
    {
      name: "vpc_id",
      label: "VPC ID",
      type: "text",
      placeholder: "vpc-12345",
      required: true,
      category: "Network",
    },
    {
      name: "ingress_rules",
      label: "Ingress Rules",
      type: "tags",
      placeholder: "port=protocol:cidr_blocks",
      description: "Format: 80=tcp:0.0.0.0/0, 443=tcp:0.0.0.0/0",
      category: "Rules",
    },
    {
      name: "egress_rules",
      label: "Egress Rules",
      type: "tags",
      placeholder: "port=protocol:cidr_blocks",
      description: "Format: 0=all:0.0.0.0/0",
      category: "Rules",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const CDN_CONFIG: ServiceConfig = {
  name: "CloudFront Distribution",
  description: "Content delivery network",
  icon: "Globe",
  terraformType: "aws_cloudfront_distribution",
  fields: [
    {
      name: "name",
      label: "Distribution Name",
      type: "text",
      placeholder: "my-cdn",
      required: true,
      category: "General",
    },
    {
      name: "origin_domain_name",
      label: "Origin Domain Name",
      type: "text",
      placeholder: "my-bucket.s3.amazonaws.com",
      required: true,
      category: "Origin",
    },
    {
      name: "origin_id",
      label: "Origin ID",
      type: "text",
      placeholder: "my-origin",
      required: true,
      category: "Origin",
    },
    {
      name: "enabled",
      label: "Enabled",
      type: "boolean",
      default: true,
      category: "General",
    },
    {
      name: "default_root_object",
      label: "Default Root Object",
      type: "text",
      placeholder: "index.html",
      category: "Behavior",
    },
    {
      name: "price_class",
      label: "Price Class",
      type: "select",
      options: [
        { value: "PriceClass_All", label: "All Edge Locations" },
        { value: "PriceClass_200", label: "North America, Europe, Asia" },
        { value: "PriceClass_100", label: "North America and Europe" },
      ],
      default: "PriceClass_100",
      category: "General",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const CLOUDWATCH_LOGS_CONFIG: ServiceConfig = {
  name: "CloudWatch Log Group",
  description: "Log storage and monitoring",
  icon: "FileText",
  terraformType: "aws_cloudwatch_log_group",
  fields: [
    {
      name: "name",
      label: "Log Group Name",
      type: "text",
      placeholder: "/aws/lambda/my-function",
      required: true,
      category: "General",
    },
    {
      name: "retention_in_days",
      label: "Retention Period (days)",
      type: "select",
      options: [
        { value: "1", label: "1 day" },
        { value: "3", label: "3 days" },
        { value: "5", label: "5 days" },
        { value: "7", label: "1 week" },
        { value: "14", label: "2 weeks" },
        { value: "30", label: "1 month" },
        { value: "60", label: "2 months" },
        { value: "90", label: "3 months" },
        { value: "120", label: "4 months" },
        { value: "150", label: "5 months" },
        { value: "180", label: "6 months" },
        { value: "365", label: "1 year" },
        { value: "400", label: "400 days" },
        { value: "545", label: "18 months" },
        { value: "731", label: "2 years" },
        { value: "1827", label: "5 years" },
        { value: "3653", label: "10 years" },
      ],
      default: "30",
      category: "Configuration",
    },
    {
      name: "kms_key_id",
      label: "KMS Key ID",
      type: "text",
      placeholder: "arn:aws:kms:region:account-id:key/key-id",
      category: "Encryption",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "key=value",
      category: "Tags",
    },
  ],
};

export const SERVICE_CONFIGS = {
  ec2: EC2_CONFIG,
  s3: S3_CONFIG,
  rds: RDS_CONFIG,
  lambda: LAMBDA_CONFIG,
  dynamodb: DYNAMODB_CONFIG,
  ebs: EBS_CONFIG,
  ecs: ECS_CONFIG,
  subnet: SUBNET_CONFIG,
  securitygroup: SECURITY_GROUP_CONFIG,
  cdn: CDN_CONFIG,
  cloudwatchlogs: CLOUDWATCH_LOGS_CONFIG,
};

export type ServiceType = keyof typeof SERVICE_CONFIGS;
