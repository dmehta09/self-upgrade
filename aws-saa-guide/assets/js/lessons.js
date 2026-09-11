/* ============================================================
   AWS SAA Field Guide — canonical lesson registry
   GENERATED from tools/manifest.js by tools/gen.js — edit the
   manifest, then re-run `node tools/gen.js`. Stable lesson ids;
   each lesson page sets <body data-lesson="<id>">.
   ============================================================ */
window.LESSONS = [
  { id: "fo-cloud", title: "Cloud mental model", url: "foundations/cloud-mental-model.html", module: "foundations", tool: "foundations" },
  { id: "fo-regions", title: "Regions, AZs & the edge", url: "foundations/regions-azs-edge.html", module: "foundations", tool: "foundations" },
  { id: "fo-wa", title: "Well-Architected Framework", url: "foundations/well-architected.html", module: "foundations", tool: "foundations" },
  { id: "fo-shared", title: "Shared responsibility", url: "foundations/shared-responsibility.html", module: "foundations", tool: "foundations" },
  { id: "fo-exam", title: "How to take SAA-C03", url: "foundations/exam-method.html", module: "foundations", tool: "foundations" },
  { id: "net-vpc", title: "VPC & subnets", url: "networking/vpc-and-subnets.html", module: "networking", tool: "networking" },
  { id: "net-route", title: "Routing, security groups & NACLs", url: "networking/routing-sg-nacl.html", module: "networking", tool: "networking" },
  { id: "net-endpoints", title: "VPC endpoints & PrivateLink", url: "networking/endpoints-privatelink.html", module: "networking", tool: "networking" },
  { id: "net-r53", title: "Route 53 & DNS patterns", url: "networking/route53-dns.html", module: "networking", tool: "networking" },
  { id: "net-cf", title: "CloudFront & global edge", url: "networking/cloudfront-global.html", module: "networking", tool: "networking" },
  { id: "sec-iam", title: "IAM users, roles & policies", url: "identity-security/iam-users-roles-policies.html", module: "identity-security", tool: "identity-security" },
  { id: "sec-kms", title: "Encryption, KMS & secrets", url: "identity-security/encryption-kms-secrets.html", module: "identity-security", tool: "identity-security" },
  { id: "sec-org", title: "Organizations, SCPs & Identity Center", url: "identity-security/org-scp-identity-center.html", module: "identity-security", tool: "identity-security" },
  { id: "sec-waf", title: "WAF, Shield & edge protection", url: "identity-security/edge-waf-shield.html", module: "identity-security", tool: "identity-security" },
  { id: "sec-detect", title: "Detective controls", url: "identity-security/detective-controls.html", module: "identity-security", tool: "identity-security" },
  { id: "cmp-ec2", title: "EC2, ASG & placement", url: "compute/ec2-asg-placement.html", module: "compute", tool: "compute" },
  { id: "cmp-elb", title: "Elastic Load Balancing patterns", url: "compute/elb-patterns.html", module: "compute", tool: "compute" },
  { id: "cmp-lambda", title: "Lambda & serverless compute", url: "compute/lambda-serverless.html", module: "compute", tool: "compute" },
  { id: "cmp-containers", title: "Containers: ECS vs EKS", url: "compute/containers-ecs-eks.html", module: "compute", tool: "compute" },
  { id: "sto-s3", title: "S3 storage classes & access", url: "storage/s3-classes-and-access.html", module: "storage", tool: "storage" },
  { id: "sto-block", title: "EBS, EFS & FSx", url: "storage/ebs-efs-fsx.html", module: "storage", tool: "storage" },
  { id: "sto-backup", title: "AWS Backup & protection", url: "storage/aws-backup.html", module: "storage", tool: "storage" },
  { id: "db-rds", title: "RDS & Aurora high availability", url: "databases/rds-aurora-ha.html", module: "databases", tool: "databases" },
  { id: "db-ddb", title: "DynamoDB access patterns", url: "databases/dynamodb-access-patterns.html", module: "databases", tool: "databases" },
  { id: "db-cache", title: "ElastiCache", url: "databases/elasticache.html", module: "databases", tool: "databases" },
  { id: "int-msg", title: "SQS, SNS & EventBridge", url: "integration/sqs-sns-eventbridge.html", module: "integration", tool: "integration" },
  { id: "int-api", title: "API Gateway & Step Functions", url: "integration/api-gateway-step-functions.html", module: "integration", tool: "integration" },
  { id: "res-az", title: "Multi-AZ vs multi-Region", url: "resilience/multi-az-multi-region.html", module: "resilience", tool: "resilience" },
  { id: "res-dr", title: "DR strategies, RPO & RTO", url: "resilience/dr-rpo-rto.html", module: "resilience", tool: "resilience" },
  { id: "res-scale", title: "Decoupling & scaling patterns", url: "resilience/decoupling-and-scaling.html", module: "resilience", tool: "resilience" },
  { id: "cost-price", title: "Pricing models", url: "cost-ops/pricing-models.html", module: "cost-ops", tool: "cost-ops" },
  { id: "cost-tools", title: "Cost Explorer, Budgets & allocation", url: "cost-ops/cost-explorer-budgets.html", module: "cost-ops", tool: "cost-ops" },
  { id: "cost-ops", title: "CloudWatch, Config & CloudTrail", url: "cost-ops/cloudwatch-config-cloudtrail.html", module: "cost-ops", tool: "cost-ops" },
  { id: "ex-map", title: "SAA-C03 domain map", url: "exam/domain-map.html", module: "exam", tool: "exam" },
  { id: "ex-scenarios", title: "Architecture scenario bank", url: "exam/scenario-bank.html", module: "exam", tool: "exam" },
  { id: "ex-mock", title: "Timed mock exam", url: "exam/mock-exam.html", module: "exam", tool: "exam" },
];

window.LESSON_MODULES = [
  { key: "foundations", label: "Foundations" },
  { key: "networking", label: "Networking" },
  { key: "identity-security", label: "Identity & Security" },
  { key: "compute", label: "Compute" },
  { key: "storage", label: "Storage" },
  { key: "databases", label: "Databases" },
  { key: "integration", label: "Application Integration" },
  { key: "resilience", label: "Resilience & DR" },
  { key: "cost-ops", label: "Cost & Operations" },
  { key: "exam", label: "Exam prep" },
];
