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
      options: [
        { value: "us-east-1a", label: "us-east-1a" },
        { value: "us-east-1b", label: "us-east-1b" },
        { value: "us-east-1c", label: "us-east-1c" },
        { value: "us-west-1a", label: "us-west-1a" },
        { value: "us-west-1b", label: "us-west-1b" },
      ],
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

export const SERVICE_CONFIGS = {
  ec2: EC2_CONFIG,
  s3: S3_CONFIG,
  rds: RDS_CONFIG,
  lambda: LAMBDA_CONFIG,
  dynamodb: DYNAMODB_CONFIG,
  ebs: EBS_CONFIG,
  ecs: ECS_CONFIG,
};

export type ServiceType = keyof typeof SERVICE_CONFIGS;
