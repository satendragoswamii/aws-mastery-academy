/**
 * The full learning path, in teaching order.
 * A lesson is "available" once its content file exists in ./lessons and is
 * registered in ./lessons/index.ts. Everything else is shown as "planned".
 * Add topics here freely: the curriculum is data, not code.
 */

export type CurriculumEntry = { slug: string; title: string };
export type CurriculumModule = { id: string; title: string; lessons: CurriculumEntry[] };
export type CurriculumLevel = {
  id: string;
  number: number;
  title: string;
  description: string;
  modules: CurriculumModule[];
};

export const CURRICULUM: CurriculumLevel[] = [
  {
    id: "level-1",
    number: 1,
    title: "Cloud Computing Fundamentals",
    description: "What the cloud is, why it exists, and the ideas every AWS service is built on.",
    modules: [
      {
        id: "cloud-basics",
        title: "The cloud, from zero",
        lessons: [
          { slug: "what-is-cloud-computing", title: "What is cloud computing?" },
          { slug: "traditional-it-infrastructure", title: "Traditional IT and on-premises servers" },
          { slug: "data-centres", title: "Data centres" },
          { slug: "public-private-hybrid-cloud", title: "Public, private and hybrid cloud" },
          { slug: "iaas-paas-saas", title: "IaaS, PaaS and SaaS" },
        ],
      },
      {
        id: "cloud-qualities",
        title: "What makes a system good in the cloud",
        lessons: [
          { slug: "scalability-and-elasticity", title: "Scalability and elasticity" },
          { slug: "high-availability", title: "High availability" },
          { slug: "fault-tolerance", title: "Fault tolerance" },
          { slug: "disaster-recovery", title: "Disaster recovery" },
        ],
      },
      {
        id: "cloud-technology",
        title: "The technology underneath",
        lessons: [
          { slug: "virtualization", title: "Virtualization" },
          { slug: "containers", title: "Containers" },
          { slug: "cloud-networking-basics", title: "Cloud networking basics" },
          { slug: "cloud-security-basics", title: "Cloud security basics" },
          { slug: "cloud-pricing-models", title: "Cloud pricing models" },
        ],
      },
      {
        id: "aws-foundations",
        title: "AWS foundations",
        lessons: [
          { slug: "aws-global-infrastructure", title: "AWS global infrastructure" },
          { slug: "regions-and-availability-zones", title: "Regions and Availability Zones" },
          { slug: "shared-responsibility-model", title: "The shared responsibility model" },
          { slug: "well-architected-framework", title: "The AWS Well-Architected Framework" },
        ],
      },
    ],
  },
  {
    id: "level-2",
    number: 2,
    title: "AWS Core Fundamentals",
    description: "How you talk to AWS, how access is controlled, and how AWS is billed.",
    modules: [
      {
        id: "using-aws",
        title: "Talking to AWS",
        lessons: [
          { slug: "aws-account-structure", title: "AWS account structure" },
          { slug: "aws-management-console", title: "The AWS Management Console" },
          { slug: "aws-apis", title: "AWS APIs: how everything really works" },
          { slug: "aws-cli", title: "The AWS CLI" },
          { slug: "aws-sdk", title: "AWS SDKs" },
          { slug: "aws-credentials", title: "AWS credentials" },
          { slug: "aws-regions-in-practice", title: "Working with regions" },
          { slug: "arns", title: "Amazon Resource Names (ARNs)" },
        ],
      },
      {
        id: "iam-core",
        title: "Identity and access (IAM)",
        lessons: [
          { slug: "iam-introduction", title: "IAM from absolute zero" },
          { slug: "iam-users-groups-roles", title: "Users, groups and roles" },
          { slug: "iam-policies", title: "Policies and permissions" },
        ],
      },
      {
        id: "running-an-account",
        title: "Running an AWS account",
        lessons: [
          { slug: "service-quotas", title: "Service quotas" },
          { slug: "aws-billing", title: "AWS billing" },
          { slug: "free-tier", title: "The Free Tier" },
          { slug: "support-plans", title: "AWS support plans" },
          { slug: "aws-documentation", title: "Reading AWS documentation" },
        ],
      },
    ],
  },
  {
    id: "level-3",
    number: 3,
    title: "AWS Services in Depth",
    description: "Every major service category, with hands-on labs wherever Floci supports them.",
    modules: [
      {
        id: "storage",
        title: "Storage",
        lessons: [
          { slug: "s3-fundamentals", title: "Amazon S3 fundamentals" },
          { slug: "s3-versioning-lifecycle", title: "S3 versioning and lifecycle" },
          { slug: "s3-security", title: "S3 permissions and security" },
          { slug: "ebs", title: "Amazon EBS" },
          { slug: "efs-fsx", title: "Amazon EFS and FSx" },
          { slug: "glacier-backup", title: "S3 Glacier and AWS Backup" },
          { slug: "storage-gateway", title: "AWS Storage Gateway" },
        ],
      },
      {
        id: "databases",
        title: "Databases",
        lessons: [
          { slug: "dynamodb-fundamentals", title: "Amazon DynamoDB fundamentals" },
          { slug: "dynamodb-queries-indexes", title: "DynamoDB queries and indexes" },
          { slug: "rds-aurora", title: "Amazon RDS and Aurora" },
          { slug: "elasticache", title: "Amazon ElastiCache" },
          { slug: "redshift", title: "Amazon Redshift" },
          { slug: "documentdb-neptune", title: "DocumentDB and Neptune" },
        ],
      },
      {
        id: "compute",
        title: "Compute",
        lessons: [
          { slug: "ec2-fundamentals", title: "Amazon EC2 fundamentals" },
          { slug: "lambda-fundamentals", title: "AWS Lambda fundamentals" },
          { slug: "lambda-integrations", title: "Lambda triggers, roles and logs" },
          { slug: "load-balancing-auto-scaling", title: "Load balancing and Auto Scaling" },
          { slug: "ecs-fargate", title: "Amazon ECS and Fargate" },
          { slug: "eks", title: "Amazon EKS" },
          { slug: "elastic-beanstalk", title: "AWS Elastic Beanstalk" },
        ],
      },
      {
        id: "networking",
        title: "Networking",
        lessons: [
          { slug: "vpc-fundamentals", title: "Amazon VPC fundamentals" },
          { slug: "subnets-route-tables-gateways", title: "Subnets, route tables and gateways" },
          { slug: "security-groups-nacls", title: "Security groups and network ACLs" },
          { slug: "vpc-peering-transit-gateway", title: "VPC peering and Transit Gateway" },
          { slug: "route53", title: "Amazon Route 53" },
          { slug: "cloudfront", title: "Amazon CloudFront" },
          { slug: "vpn-direct-connect", title: "VPN and Direct Connect" },
        ],
      },
      {
        id: "security",
        title: "Security",
        lessons: [
          { slug: "iam-advanced", title: "IAM in depth" },
          { slug: "kms", title: "AWS KMS" },
          { slug: "secrets-manager", title: "AWS Secrets Manager" },
          { slug: "acm", title: "AWS Certificate Manager" },
          { slug: "waf-shield", title: "AWS WAF and Shield" },
          { slug: "guardduty-security-hub-inspector", title: "GuardDuty, Security Hub and Inspector" },
          { slug: "cloudtrail-config", title: "CloudTrail and AWS Config" },
        ],
      },
      {
        id: "integration",
        title: "Application integration",
        lessons: [
          { slug: "sqs", title: "Amazon SQS" },
          { slug: "sns", title: "Amazon SNS" },
          { slug: "eventbridge", title: "Amazon EventBridge" },
          { slug: "api-gateway", title: "Amazon API Gateway" },
          { slug: "step-functions", title: "AWS Step Functions" },
          { slug: "appsync", title: "AWS AppSync" },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring and operations",
        lessons: [
          { slug: "cloudwatch", title: "Amazon CloudWatch" },
          { slug: "systems-manager", title: "AWS Systems Manager" },
          { slug: "trusted-advisor-health", title: "Trusted Advisor and AWS Health" },
        ],
      },
      {
        id: "devops",
        title: "DevOps and infrastructure as code",
        lessons: [
          { slug: "ecr", title: "Amazon ECR" },
          { slug: "codebuild-codepipeline-codedeploy", title: "CodeBuild, CodePipeline and CodeDeploy" },
          { slug: "cloudformation", title: "AWS CloudFormation" },
          { slug: "cdk", title: "AWS CDK" },
          { slug: "terraform-on-aws", title: "Terraform on AWS" },
        ],
      },
      {
        id: "analytics",
        title: "Analytics",
        lessons: [
          { slug: "athena-glue", title: "Athena and Glue" },
          { slug: "kinesis", title: "Amazon Kinesis" },
          { slug: "emr", title: "Amazon EMR" },
          { slug: "opensearch", title: "Amazon OpenSearch Service" },
          { slug: "quicksight", title: "Amazon QuickSight" },
        ],
      },
      {
        id: "ai",
        title: "Artificial intelligence",
        lessons: [
          { slug: "bedrock", title: "Amazon Bedrock" },
          { slug: "sagemaker", title: "Amazon SageMaker" },
          { slug: "ai-services", title: "Rekognition, Textract, Comprehend, Transcribe and Polly" },
        ],
      },
      {
        id: "migration-cost",
        title: "Migration and cost management",
        lessons: [
          { slug: "migration-services", title: "Migration Hub, DMS and DataSync" },
          { slug: "cost-management", title: "Cost Explorer, Budgets and the Pricing Calculator" },
        ],
      },
    ],
  },
];

/** Flat list in teaching order. */
export const CURRICULUM_ORDER: (CurriculumEntry & { levelId: string; moduleId: string })[] =
  CURRICULUM.flatMap((level) =>
    level.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, levelId: level.id, moduleId: m.id })),
    ),
  );
