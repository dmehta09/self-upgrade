#!/usr/bin/env node
/**
 * Builds SAA-C03 mock bank HTML fragments (3 × 65 Q) from question templates.
 * Run from cert-mocks-guide: node tools/build-saa-banks.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "content");
const COMPANIES = [
  "Acme Tickets",
  "Ledger Bank",
  "Nova Health",
  "Polar Retail",
  "Cobalt IoT",
];

const DOMAIN_COUNTS = {
  Secure: 20,
  Resilient: 17,
  "High-performing": 16,
  Cost: 12,
};

const L = {
  iam: "../../aws-saa-guide/identity-security/iam-users-roles-policies.html",
  org: "../../aws-saa-guide/identity-security/org-scp-identity-center.html",
  kms: "../../aws-saa-guide/identity-security/encryption-kms-secrets.html",
  waf: "../../aws-saa-guide/identity-security/edge-waf-shield.html",
  detective: "../../aws-saa-guide/identity-security/detective-controls.html",
  vpc: "../../aws-saa-guide/networking/vpc-and-subnets.html",
  sgnacl: "../../aws-saa-guide/networking/routing-sg-nacl.html",
  plink: "../../aws-saa-guide/networking/endpoints-privatelink.html",
  cf: "../../aws-saa-guide/networking/cloudfront-global.html",
  r53: "../../aws-saa-guide/networking/route53-dns.html",
  elb: "../../aws-saa-guide/compute/elb-patterns.html",
  ec2: "../../aws-saa-guide/compute/ec2-asg-placement.html",
  lambda: "../../aws-saa-guide/compute/lambda-serverless.html",
  ecs: "../../aws-saa-guide/compute/containers-ecs-eks.html",
  s3: "../../aws-saa-guide/storage/s3-classes-and-access.html",
  ebs: "../../aws-saa-guide/storage/ebs-efs-fsx.html",
  backup: "../../aws-saa-guide/storage/aws-backup.html",
  aurora: "../../aws-saa-guide/databases/rds-aurora-ha.html",
  ddb: "../../aws-saa-guide/databases/dynamodb-access-patterns.html",
  cache: "../../aws-saa-guide/databases/elasticache.html",
  sqs: "../../aws-saa-guide/integration/sqs-sns-eventbridge.html",
  apigw: "../../aws-saa-guide/integration/api-gateway-step-functions.html",
  maz: "../../aws-saa-guide/resilience/multi-az-multi-region.html",
  dr: "../../aws-saa-guide/resilience/dr-rpo-rto.html",
  decouple: "../../aws-saa-guide/resilience/decoupling-and-scaling.html",
  pricing: "../../aws-saa-guide/cost-ops/pricing-models.html",
  costx: "../../aws-saa-guide/cost-ops/cost-explorer-budgets.html",
  ops: "../../aws-saa-guide/cost-ops/cloudwatch-config-cloudtrail.html",
};

/** @type {Array<{id:string,domain:string,stemTemplate:string,stems?:string[],choices:string[],answer:number,why:string,lesson:string}>} */
const TEMPLATES = [
  // ——— Secure (24) ———
  {
    id: "sec-iam-role-not-keys",
    domain: "Secure",
    stemTemplate:
      "{{company}} runs a fleet of EC2 workers that must put objects into a private S3 bucket. Security forbids long-lived access keys on instances. What is the best design?",
    stems: [
      "{{company}} EC2 batch workers need write access to a private S3 bucket; long-lived keys are banned. Best approach?",
      "At {{company}}, compute instances must upload to S3 without embedding static credentials. Which pattern fits?",
    ],
    choices: [
      "Attach an IAM role to the instances (or instance profile) with least-privilege S3 permissions",
      "Create an IAM user, generate access keys, and bake them into the AMI",
      "Make the bucket public and rely on obscurity of object keys",
      "Store root account keys in Systems Manager Parameter Store as String",
    ],
    answer: 0,
    why: "Instance profiles / IAM roles provide temporary credentials via the metadata service. Static keys and public buckets violate least privilege.",
    lesson: L.iam,
  },
  {
    id: "sec-resource-policy-cross-account",
    domain: "Secure",
    stemTemplate:
      "{{company}} Account A owns an S3 bucket that Account B’s Lambda must read. What is required?",
    stems: [
      "{{company}} needs cross-account Lambda (Account B) reads on a bucket in Account A. Correct control?",
      "Cross-account S3 read for {{company}}: Lambda in B, bucket in A. What must you configure?",
    ],
    choices: [
      "Bucket policy allowing the Lambda role ARN in Account B, plus that role’s permission to s3:GetObject",
      "Only an IAM user in Account A shared with Account B",
      "Disable Block Public Access and grant Everyone s3:GetObject",
      "VPC peering alone grants cross-account S3 access",
    ],
    answer: 0,
    why: "Cross-account S3 needs both a resource policy naming the principal and identity permissions on that principal.",
    lesson: L.iam,
  },
  {
    id: "sec-idc-workforce",
    domain: "Secure",
    stemTemplate:
      "{{company}} wants workforce SSO into many AWS accounts with temporary credentials and centralized permission sets. Which service?",
    stems: [
      "{{company}} must federate employees into dozens of accounts without IAM users per person. Best control plane?",
      "Central workforce access for {{company}} across an AWS Organization — preferred pattern?",
    ],
    choices: [
      "IAM Identity Center with permission sets assigned to groups",
      "Create IAM users in every account and sync passwords via scripts",
      "Share one IAM role’s long-term access keys via Secrets Manager",
      "Use only Amazon Cognito user pools for console access to accounts",
    ],
    answer: 0,
    why: "Identity Center (successor to AWS SSO) is the org-scale workforce federation pattern with permission sets.",
    lesson: L.org,
  },
  {
    id: "sec-scp-deny-regions",
    domain: "Secure",
    stemTemplate:
      "{{company}}’s AWS Organization must prevent member accounts from launching resources outside eu-west-1 and eu-central-1, even if an admin attaches Allow * policies. What enforces this?",
    stems: [
      "{{company}} needs a hard ceiling: no resources outside two EU regions regardless of IAM Allows. Which control?",
      "Org guardrail for {{company}}: block non-approved Regions despite permissive IAM. Mechanism?",
    ],
    choices: [
      "Service Control Policy (SCP) denying actions when aws:RequestedRegion is not allow-listed",
      "IAM permission boundary on every role only",
      "AWS Config rule that deletes resources after creation",
      "Security group egress rules limited to EU CIDRs",
    ],
    answer: 0,
    why: "SCPs are permission ceilings on accounts/OUs; they filter even Allow * identity policies.",
    lesson: L.org,
  },
  {
    id: "sec-kms-cmk-rotate",
    domain: "Secure",
    stemTemplate:
      "{{company}} stores PHI and must control key policy, enable automatic annual rotation, and audit key use in CloudTrail. Which key type?",
    stems: [
      "{{company}} compliance requires customer-managed keys with rotation and CloudTrail key events. Choose:",
      "For {{company}} regulated data, which KMS option gives key-policy control plus automatic rotation?",
    ],
    choices: [
      "Customer managed KMS key (CMK) with rotation enabled",
      "AWS owned key with no customer visibility",
      "SSE-S3 only (AES-256) with no KMS involvement",
      "Plaintext secrets in DynamoDB with client-side XOR",
    ],
    answer: 0,
    why: "Customer managed keys support key policies, rotation, and detailed CloudTrail events for audits.",
    lesson: L.kms,
  },
  {
    id: "sec-secrets-vs-ssm",
    domain: "Secure",
    stemTemplate:
      "{{company}} needs database passwords with automatic rotation, fine-grained IAM, and audit of secret retrieval. Best store?",
    stems: [
      "{{company}} app credentials must rotate automatically and log every GetSecretValue. Prefer:",
      "Rotating DB credentials for {{company}} with retrieval auditing — which service?",
    ],
    choices: [
      "AWS Secrets Manager with rotation Lambda",
      "SSM Parameter Store String (unencrypted) only",
      "Hard-code in Lambda environment variables",
      "S3 object with public-read ACL",
    ],
    answer: 0,
    why: "Secrets Manager is built for secrets lifecycle (rotation, versions) and integrates with RDS rotation.",
    lesson: L.kms,
  },
  {
    id: "sec-vpc-private-subnets",
    domain: "Secure",
    stemTemplate:
      "{{company}} must place application tiers so they have no public IPs yet can call AWS APIs privately. Design?",
    stems: [
      "{{company}} wants private subnets without Internet gateways for app tiers, still reaching S3/DynamoDB privately. How?",
      "Network design for {{company}}: no public IPs on apps; private access to AWS services. Pattern?",
    ],
    choices: [
      "Private subnets + VPC gateway/interface endpoints (and/or PrivateLink) for AWS APIs",
      "Public subnets with security groups denying 0.0.0.0/0 inbound only",
      "Place all instances in one public subnet behind a single NACL deny",
      "Use only ClassicLink to EC2-Classic",
    ],
    answer: 0,
    why: "Private = no public IP + routing that does not use IGW for those workloads; endpoints avoid NAT for AWS APIs.",
    lesson: L.vpc,
  },
  {
    id: "sec-sg-vs-nacl",
    domain: "Secure",
    stemTemplate:
      "{{company}} sees unexpected return traffic blocked after adding a subnet NACL allow for ephemeral ports incorrectly. Which statement is true?",
    stems: [
      "{{company}} troubleshooting: SG allows 443 but NACL misconfigured. Key difference to remember?",
      "At {{company}}, clarify SG vs NACL behavior for a connectivity outage. Correct fact?",
    ],
    choices: [
      "Security groups are stateful; NACLs are stateless and need explicit ephemeral return rules",
      "NACLs are stateful; security groups are stateless",
      "Both are stateful and identical in evaluation order",
      "NACLs only apply to traffic that already passed a security group",
    ],
    answer: 0,
    why: "SG tracks connections; NACL evaluates every packet direction separately.",
    lesson: L.sgnacl,
  },
  {
    id: "sec-privatelink-saas",
    domain: "Secure",
    stemTemplate:
      "{{company}} consumes a partner SaaS API and must keep traffic off the public Internet while the partner retains their own VPC. Best pattern?",
    stems: [
      "{{company}} needs private connectivity to a multi-tenant SaaS without Internet exposure. Choose:",
      "Partner-hosted API for {{company}} should stay private end-to-end. Preferred AWS pattern?",
    ],
    choices: [
      "AWS PrivateLink (interface VPC endpoint to the partner’s endpoint service)",
      "Internet-facing ALB with a long random URL path",
      "Public NLB and IP allow lists only",
      "S3 Transfer Acceleration to the partner",
    ],
    answer: 0,
    why: "PrivateLink exposes a service via interface endpoints in the consumer VPC without peering or public IPs.",
    lesson: L.plink,
  },
  {
    id: "sec-waf-alb",
    domain: "Secure",
    stemTemplate:
      "{{company}}’s public ALB receives SQL injection and bad bots. They need managed rule groups at L7 before targets. Solution?",
    stems: [
      "{{company}} must filter OWASP-style attacks on an ALB. Which control?",
      "Edge L7 filtering for {{company}}’s ALB-facing web app — best fit?",
    ],
    choices: [
      "AWS WAF web ACL associated with the ALB (or CloudFront in front)",
      "Only security group deny lists for known bot IPs",
      "NACL deny on ports 80/443",
      "GuardDuty alone blocks HTTP payloads",
    ],
    answer: 0,
    why: "WAF inspects HTTP(S) requests; SG/NACL cannot parse application payloads.",
    lesson: L.waf,
  },
  {
    id: "sec-shield-ddos",
    domain: "Secure",
    stemTemplate:
      "{{company}} runs a global public API and wants AWS-native volumetric DDoS protections with 24/7 response for large events. Option?",
    stems: [
      "{{company}} needs advanced DDoS protection and engagement for large attacks. Choose:",
      "Public edge for {{company}}: which AWS offering adds proactive DDoS response beyond standard?",
    ],
    choices: [
      "AWS Shield Advanced (with WAF/CloudFront/Route 53 as applicable)",
      "Only increase ALB idle timeout",
      "Disable CloudTrail to reduce load",
      "Replace ALB with a single EC2 in one AZ",
    ],
    answer: 0,
    why: "Shield Standard is on by default; Advanced adds enhanced protections and DDoS response team access.",
    lesson: L.waf,
  },
  {
    id: "sec-bucket-bpa",
    domain: "Secure",
    stemTemplate:
      "{{company}} must ensure no S3 bucket can become public accidentally via ACL or policy. Baseline control?",
    stems: [
      "{{company}} security baseline: prevent accidental public S3. Primary control?",
      "Org-wide for {{company}}: stop public bucket exposure by default. How?",
    ],
    choices: [
      "Enable S3 Block Public Access (account and/or bucket) and prefer private + IAM/bucket policies",
      "Rely on random bucket names",
      "Turn off encryption so policies are simpler",
      "Use only website hosting endpoints for all data",
    ],
    answer: 0,
    why: "Block Public Access is the hard stop against public ACLs/policies.",
    lesson: L.s3,
  },
  {
    id: "sec-imdsv2",
    domain: "Secure",
    stemTemplate:
      "{{company}} hardens EC2 against SSRF stealing instance credentials. What should they enforce?",
    stems: [
      "{{company}} wants to reduce IMDS credential theft risk on EC2. Control?",
      "SSRF mitigation for {{company}} instance roles — recommended IMDS setting?",
    ],
    choices: [
      "Require IMDSv2 (hop limit / HttpTokens required) on instances",
      "Disable all IAM roles so IMDS is unused",
      "Publish instance role keys to CloudWatch Logs",
      "Open security group 0.0.0.0/0 to port 80 for health",
    ],
    answer: 0,
    why: "IMDSv2 session tokens mitigate many SSRF paths to the metadata service.",
    lesson: L.iam,
  },
  {
    id: "sec-cloudtrail-org",
    domain: "Secure",
    stemTemplate:
      "{{company}} needs immutable API activity logs across all Organization accounts into a locked log archive account. Pattern?",
    stems: [
      "{{company}} Org wants centralized, tamper-resistant API audit logs. Design?",
      "Detective control for {{company}}: org-wide API history in a security account. How?",
    ],
    choices: [
      "Organization CloudTrail to a dedicated log-archive account with restricted bucket policy / Object Lock as needed",
      "Disable CloudTrail in member accounts to save cost",
      "Only VPC Flow Logs to stdout",
      "Store API logs in the same buckets apps write to",
    ],
    answer: 0,
    why: "Org trails + segregated log account is the standard detective baseline.",
    lesson: L.detective,
  },
  {
    id: "sec-guardduty",
    domain: "Secure",
    stemTemplate:
      "{{company}} wants continuous threat detection from CloudTrail, VPC Flow, and DNS logs with managed ML findings. Service?",
    stems: [
      "{{company}} needs managed anomaly/threat findings from AWS log sources. Choose:",
      "Threat detection service for {{company}} integrating VPC Flow and CloudTrail — which?",
    ],
    choices: [
      "Amazon GuardDuty",
      "AWS WAF only",
      "AWS Backup",
      "Amazon Macie only for all threat types",
    ],
    answer: 0,
    why: "GuardDuty analyzes account/network telemetry for suspicious activity.",
    lesson: L.detective,
  },
  {
    id: "sec-macie-pii",
    domain: "Secure",
    stemTemplate:
      "{{company}} must discover sensitive data (PII) sitting in S3 buckets across accounts. Best managed service?",
    stems: [
      "{{company}} compliance asks for automated PII discovery in S3. Tool?",
      "Scan {{company}} S3 estates for sensitive data classification — which AWS service?",
    ],
    choices: [
      "Amazon Macie",
      "Amazon Inspector for EC2 CVEs only",
      "AWS Trusted Advisor cost checks",
      "Amazon Athena without classification",
    ],
    answer: 0,
    why: "Macie specializes in sensitive data discovery and protection findings in S3.",
    lesson: L.detective,
  },
  {
    id: "sec-kms-envelope",
    domain: "Secure",
    stemTemplate:
      "{{company}} encrypts large objects client-side and wants KMS only for data keys, not bulk ciphertext. Pattern name?",
    stems: [
      "{{company}} uses KMS to wrap data keys while encrypting payloads locally. This is:",
      "Efficient bulk encryption for {{company}} with KMS — recommended pattern?",
    ],
    choices: [
      "Envelope encryption (generate data key, encrypt data locally, store encrypted data key)",
      "Send every byte through KMS Encrypt API",
      "Disable encryption for objects over 1 MB",
      "Use only plaintext KMS keys in env vars",
    ],
    answer: 0,
    why: "Envelope encryption keeps KMS calls small and scales to large payloads.",
    lesson: L.kms,
  },
  {
    id: "sec-tls-acm",
    domain: "Secure",
    stemTemplate:
      "{{company}} terminates HTTPS on an ALB with a public certificate that auto-renews. Where should the cert live?",
    stems: [
      "{{company}} ALB needs a public TLS cert with managed renewal. Store in?",
      "TLS termination for {{company}} on ALB — certificate service?",
    ],
    choices: [
      "ACM certificate in the same Region as the ALB, attached to the listener",
      "Self-signed cert baked into each target AMI only",
      "IAM server certificate uploaded once and never renewed",
      "CloudHSM private key pasted into userdata",
    ],
    answer: 0,
    why: "ACM integrates with ALB/CloudFront and handles renewal for public certs.",
    lesson: L.waf,
  },
  {
    id: "sec-vpce-policy",
    domain: "Secure",
    stemTemplate:
      "{{company}} uses an S3 gateway endpoint and must ensure only specific buckets are reachable through it. Control?",
    stems: [
      "{{company}} S3 gateway endpoint should allow only approved bucket ARNs. How?",
      "Restrict {{company}} VPC endpoint access to named S3 buckets. Mechanism?",
    ],
    choices: [
      "Endpoint policy on the VPC endpoint limiting s3 actions to allowed bucket ARNs",
      "Security group on the gateway endpoint (gateway endpoints do not use SGs this way)",
      "Make buckets public so the endpoint is unused",
      "NACL deny all then allow 443 only to 0.0.0.0/0",
    ],
    answer: 0,
    why: "Gateway endpoint policies refine which resources are reachable via the endpoint.",
    lesson: L.plink,
  },
  {
    id: "sec-least-privilege-boundary",
    domain: "Secure",
    stemTemplate:
      "{{company}} lets developers create roles in a sandbox but must cap maximum permissions those roles can ever receive. IAM feature?",
    stems: [
      "{{company}} sandbox: developers create roles but cannot exceed a max permission set. Control?",
      "Cap {{company}} developer-created role permissions regardless of attached policies. Use:",
    ],
    choices: [
      "Permissions boundaries on the roles developers create",
      "Only SCPs (they do not replace boundaries for identity max-perms inside an account the same way)",
      "Disable IAM entirely",
      "Resource groups tagging only",
    ],
    answer: 0,
    why: "Permissions boundaries set the maximum permissions an IAM principal can have.",
    lesson: L.iam,
  },
  {
    id: "sec-cognito-app",
    domain: "Secure",
    stemTemplate:
      "{{company}} mobile app needs user sign-up/sign-in and temporary AWS credentials to upload to S3. Fit?",
    stems: [
      "{{company}} consumer app auth with federated AWS access for uploads. Pattern?",
      "End-user identity for {{company}} app plus short-lived AWS creds — which combo?",
    ],
    choices: [
      "Amazon Cognito user pools + identity pools (roles) for temporary credentials",
      "Embed IAM user access keys in the mobile binary",
      "Share one root password with all users",
      "Open the bucket publicly and skip auth",
    ],
    answer: 0,
    why: "Cognito handles app users; identity pools vended temporary AWS credentials via roles.",
    lesson: L.iam,
  },
  {
    id: "sec-config-conformance",
    domain: "Secure",
    stemTemplate:
      "{{company}} must continuously evaluate whether resources remain encrypted and private, with drift findings. Service?",
    stems: [
      "{{company}} wants continuous compliance rules on resource configuration. Choose:",
      "Configuration drift and encryption checks for {{company}} — AWS service?",
    ],
    choices: [
      "AWS Config (rules / conformance packs)",
      "Amazon SNS only",
      "Amazon SQS FIFO",
      "AWS Snowball",
    ],
    answer: 0,
    why: "Config records configuration history and evaluates rules continuously.",
    lesson: L.detective,
  },
  {
    id: "sec-sg-default-deny",
    domain: "Secure",
    stemTemplate:
      "{{company}} creates a new security group for a private API. Default inbound behavior?",
    stems: [
      "{{company}} new SG for private API — what is default inbound?",
      "Fresh security group at {{company}}: inbound traffic default is?",
    ],
    choices: [
      "Deny all inbound until you add allow rules; allow all outbound by default (until changed)",
      "Allow all inbound and outbound by default",
      "Allow inbound from 0.0.0.0/0 on 22 and 3389",
      "Mirror the VPC NACL automatically",
    ],
    answer: 0,
    why: "New SGs deny inbound by default; outbound starts open unless you tighten.",
    lesson: L.sgnacl,
  },
  {
    id: "sec-private-api-execute",
    domain: "Secure",
    stemTemplate:
      "{{company}} exposes an internal REST API only inside the VPC (no Internet). API Gateway mode?",
    stems: [
      "{{company}} needs API Gateway reachable only from VPC. Configuration?",
      "Internal-only API for {{company}} — which API Gateway endpoint type?",
    ],
    choices: [
      "Private API with interface VPC endpoint (execute-api) and resource policy",
      "EDGE endpoint with WAF geo match only",
      "REGIONAL public endpoint and hope NACLs hide it",
      "WebSocket public API with API keys in query strings",
    ],
    answer: 0,
    why: "Private APIs use VPC endpoints and policies to keep traffic on the AWS network.",
    lesson: L.apigw,
  },

  // ——— Resilient (20) ———
  {
    id: "res-multi-az-rds",
    domain: "Resilient",
    stemTemplate:
      "{{company}} needs automatic failover for a relational database with synchronous standby in another AZ. Feature?",
    stems: [
      "{{company}} RDS must survive AZ failure with automatic failover. Enable:",
      "AZ outage resilience for {{company}}’s primary relational DB — correct HA feature?",
    ],
    choices: [
      "Multi-AZ deployment (standby)",
      "Single-AZ with more frequent snapshots only",
      "Read replica in the same AZ only",
      "Store DB files on instance store volumes",
    ],
    answer: 0,
    why: "Multi-AZ provides synchronous standby and automatic failover; replicas alone are for scale/DR async.",
    lesson: L.maz,
  },
  {
    id: "res-aurora-storage",
    domain: "Resilient",
    stemTemplate:
      "{{company}} chooses Aurora for a write-heavy OLTP app needing storage that replicates across AZs automatically. Benefit?",
    stems: [
      "{{company}} picks Aurora; which resilience trait is inherent to Aurora storage?",
      "Aurora for {{company}}: storage durability characteristic?",
    ],
    choices: [
      "Aurora storage is replicated across multiple AZs; volume auto-grows",
      "Aurora stores data on a single EBS volume in one AZ only",
      "Aurora requires customer-managed RAID across instances",
      "Aurora disables automated backups by default permanently",
    ],
    answer: 0,
    why: "Aurora’s shared storage layer spans AZs for durability and failover speed.",
    lesson: L.aurora,
  },
  {
    id: "res-rpo-backup",
    domain: "Resilient",
    stemTemplate:
      "{{company}} can tolerate up to 1 hour of data loss (RPO) and several hours of recovery (RTO) for a non-critical system. Lowest-cost DR?",
    stems: [
      "{{company}} RPO ~1h, RTO hours OK — cost-efficient DR approach?",
      "Loose RPO/RTO for {{company}} secondary system. Cheapest fitting strategy?",
    ],
    choices: [
      "Backup and restore (automated backups / AWS Backup to another Region as needed)",
      "Active-active multi-Region with continuous dual writes",
      "Hot standby at full production capacity 24/7",
      "Pilot light with always-on full-size fleet",
    ],
    answer: 0,
    why: "Loose RPO/RTO maps to backup/restore; hotter strategies cost more.",
    lesson: L.dr,
  },
  {
    id: "res-rto-pilot",
    domain: "Resilient",
    stemTemplate:
      "{{company}} wants faster Region recovery than restore-from-backup but will not pay for a full duplicate environment always running. Strategy?",
    stems: [
      "{{company}} DR: core data replicated, scale compute on disaster. Named strategy?",
      "Balance cost vs RTO for {{company}} multi-Region — which DR pattern?",
    ],
    choices: [
      "Pilot light (replicate data; minimal core in DR Region; scale out on failover)",
      "Backup only with no replication",
      "Active-active with 100% capacity both Regions always",
      "Single-AZ production with no backups",
    ],
    answer: 0,
    why: "Pilot light keeps a minimal footprint ready to scale, improving RTO vs cold backup.",
    lesson: L.dr,
  },
  {
    id: "res-sqs-buffer",
    domain: "Resilient",
    stemTemplate:
      "{{company}} producers spike unpredictably; consumers must not lose work when downstream is slow. Decoupling?",
    stems: [
      "{{company}} needs durable buffering between producers and workers. Service?",
      "Absorb {{company}} traffic spikes without dropping jobs — which pattern?",
    ],
    choices: [
      "Amazon SQS queue between producers and consumers",
      "Synchronous Lambda invoke only with no retries",
      "Store jobs only in EC2 memory",
      "Public S3 bucket listing as a queue",
    ],
    answer: 0,
    why: "SQS durably buffers and decouples producers from consumer availability.",
    lesson: L.sqs,
  },
  {
    id: "res-sns-fanout",
    domain: "Resilient",
    stemTemplate:
      "{{company}} must notify email, Lambda, and SQS from one business event. Pattern?",
    stems: [
      "{{company}} one event, many subscriber types — which service fans out?",
      "Fan-out notifications for {{company}} order events to multiple targets. Use:",
    ],
    choices: [
      "Amazon SNS topic with multiple subscriptions",
      "A single SQS queue with competing consumer types parsing differently only",
      "CloudFront invalidation as event bus",
      "Direct EC2 SSH callbacks",
    ],
    answer: 0,
    why: "SNS is pub/sub fan-out; often paired with SQS for durable processing.",
    lesson: L.sqs,
  },
  {
    id: "res-eventbridge-rules",
    domain: "Resilient",
    stemTemplate:
      "{{company}} wants content-based routing of AWS and custom events to Step Functions and Lambda. Bus?",
    stems: [
      "{{company}} needs rule-based event routing across SaaS and AWS sources. Choose:",
      "Event-driven routing for {{company}} with schema-friendly bus — service?",
    ],
    choices: [
      "Amazon EventBridge",
      "Amazon MQ only",
      "Elastic Transcoder",
      "AWS Data Pipeline (legacy) only",
    ],
    answer: 0,
    why: "EventBridge routes events with rules to many targets including Lambda and Step Functions.",
    lesson: L.sqs,
  },
  {
    id: "res-asg-multi-az",
    domain: "Resilient",
    stemTemplate:
      "{{company}} web tier must survive an AZ impairment without manual intervention. Placement?",
    stems: [
      "{{company}} ASG should remain available if one AZ fails. Configure:",
      "AZ resilience for {{company}} EC2 web fleet — correct ASG setup?",
    ],
    choices: [
      "Auto Scaling group spanning multiple AZs behind a load balancer",
      "All instances in one AZ for lower latency only",
      "One oversized instance with no ASG",
      "Placement group cluster across Regions",
    ],
    answer: 0,
    why: "Multi-AZ ASG + ELB redistributes traffic when an AZ fails.",
    lesson: L.ec2,
  },
  {
    id: "res-alb-health",
    domain: "Resilient",
    stemTemplate:
      "{{company}} ALB should stop sending traffic to unhealthy targets automatically. Mechanism?",
    stems: [
      "{{company}} needs automatic removal of bad targets from rotation. Feature?",
      "ALB for {{company}}: keep users off failed instances. How?",
    ],
    choices: [
      "Target group health checks with deregistration of unhealthy targets",
      "Manual DNS edits every incident",
      "Disable stickiness forever as the only control",
      "NACL deny to the entire subnet on any 5xx",
    ],
    answer: 0,
    why: "ELB health checks remove unhealthy targets until they recover.",
    lesson: L.elb,
  },
  {
    id: "res-s3-versioning-mfa",
    domain: "Resilient",
    stemTemplate:
      "{{company}} must recover from accidental deletes/overwrites of critical objects. S3 feature?",
    stems: [
      "{{company}} needs object recoverability after overwrite. Enable:",
      "Protect {{company}} S3 assets from accidental deletion impact — primary feature?",
    ],
    choices: [
      "S3 Versioning (optionally MFA Delete / Object Lock for stronger controls)",
      "Disable all logging",
      "Use only ONEZONE_IA without versions",
      "Turn off bucket policies",
    ],
    answer: 0,
    why: "Versioning retains prior object versions for recovery.",
    lesson: L.s3,
  },
  {
    id: "res-ddb-global",
    domain: "Resilient",
    stemTemplate:
      "{{company}} needs a multi-Region active-active key-value store with low single-digit ms reads locally. Choice?",
    stems: [
      "{{company}} globally distributed sessions need multi-Region active tables. Service feature?",
      "Active-active NoSQL for {{company}} across Regions — best fit?",
    ],
    choices: [
      "DynamoDB global tables",
      "Single-Region RDS Multi-AZ only",
      "EFS with Regional mount targets only",
      "S3 Standard without Cross-Region Replication",
    ],
    answer: 0,
    why: "Global tables provide multi-Region replication for DynamoDB.",
    lesson: L.ddb,
  },
  {
    id: "res-route53-failover",
    domain: "Resilient",
    stemTemplate:
      "{{company}} primary site in us-east-1 fails health checks; traffic should move to us-west-2 secondary. DNS feature?",
    stems: [
      "{{company}} DNS should fail over between Regions based on health. Use:",
      "Health-based DNS failover for {{company}} — Route 53 policy?",
    ],
    choices: [
      "Route 53 failover routing with health checks",
      "Simple routing to a single A record only",
      "Weighted routing with zero health checks only",
      "IP addresses hard-coded in clients",
    ],
    answer: 0,
    why: "Failover routing pairs primary/secondary with health checks.",
    lesson: L.r53,
  },
  {
    id: "res-sqs-dlq",
    domain: "Resilient",
    stemTemplate:
      "{{company}} consumers repeatedly fail a poison message and block the queue. Protect the pipeline?",
    stems: [
      "{{company}} needs isolation of repeatedly failing messages. Pattern?",
      "Poison-pill handling for {{company}} SQS consumers — configure:",
    ],
    choices: [
      "Dead-letter queue (DLQ) after maxReceiveCount",
      "Delete the main queue daily",
      "Increase visibility timeout to 12 hours permanently without DLQ",
      "Disable CloudWatch alarms",
    ],
    answer: 0,
    why: "DLQs quarantine messages that exceed redrive thresholds.",
    lesson: L.sqs,
  },
  {
    id: "res-ebs-snapshots",
    domain: "Resilient",
    stemTemplate:
      "{{company}} must protect EBS volumes with point-in-time backups that can restore to new volumes. Mechanism?",
    stems: [
      "{{company}} EBS protection via point-in-time copies. Use:",
      "Recover {{company}} volumes after corruption — primary AWS mechanism?",
    ],
    choices: [
      "EBS snapshots (often orchestrated by AWS Backup)",
      "Copy files to /tmp on the instance only",
      "RAID-0 without snapshots",
      "Disable encryption to speed backups",
    ],
    answer: 0,
    why: "Snapshots are the durable backup primitive for EBS.",
    lesson: L.backup,
  },
  {
    id: "res-aws-backup",
    domain: "Resilient",
    stemTemplate:
      "{{company}} wants centralized backup policies across EBS, RDS, and DynamoDB with vaults and lifecycle. Service?",
    stems: [
      "{{company}} needs org-style backup plans across multiple resource types. Choose:",
      "Central backup orchestration for {{company}} data services — which?",
    ],
    choices: [
      "AWS Backup",
      "Amazon SES",
      "AWS Glue only",
      "Amazon QuickSight",
    ],
    answer: 0,
    why: "AWS Backup centralizes backup policies and vaults across supported services.",
    lesson: L.backup,
  },
  {
    id: "res-nlb-static",
    domain: "Resilient",
    stemTemplate:
      "{{company}} needs extreme-scale TCP load balancing with static IPs / PrivateLink integration for a financial protocol. LB type?",
    stems: [
      "{{company}} L4 load balancing with preserved source IP and static IPs — choose:",
      "High-performance TCP for {{company}} APIs — which ELB?",
    ],
    choices: [
      "Network Load Balancer",
      "Application Load Balancer only (L7)",
      "Classic Load Balancer in one AZ only",
      "Gateway Load Balancer for HTTP path routing",
    ],
    answer: 0,
    why: "NLB is L4, supports static IPs and PrivateLink endpoint services well.",
    lesson: L.elb,
  },
  {
    id: "res-lambda-destinations",
    domain: "Resilient",
    stemTemplate:
      "{{company}} asynchronous Lambda must capture failures for later analysis without blocking callers. Feature?",
    stems: [
      "{{company}} async Lambda failures should land in SQS/SNS/EventBridge. Use:",
      "Failure capture for {{company}} async functions — configure:",
    ],
    choices: [
      "Lambda destinations (or DLQ) for on-failure",
      "Only synchronous invoke with infinite retries in the client",
      "Disable reserved concurrency",
      "Put the function in a public subnet",
    ],
    answer: 0,
    why: "Destinations/DLQ route failed async events for remediation.",
    lesson: L.lambda,
  },
  {
    id: "res-s3-crr",
    domain: "Resilient",
    stemTemplate:
      "{{company}} requires object copies in a second Region for DR with independent failure domain. S3 feature?",
    stems: [
      "{{company}} needs automatic S3 replication to another Region. Feature?",
      "Multi-Region object durability for {{company}} — configure:",
    ],
    choices: [
      "S3 Cross-Region Replication (CRR) with versioning enabled",
      "Same-Region lifecycle to Glacier only",
      "CloudFront OAC without replication",
      "Manual download via console weekly",
    ],
    answer: 0,
    why: "CRR replicates objects to a destination bucket in another Region (versioning required).",
    lesson: L.s3,
  },
  {
    id: "res-ecs-multi-az",
    domain: "Resilient",
    stemTemplate:
      "{{company}} runs ECS services that must reschedule tasks if an AZ fails. Requirement?",
    stems: [
      "{{company}} ECS service resilience across AZs. Ensure:",
      "Task placement for {{company}} containers surviving AZ loss — practice?",
    ],
    choices: [
      "Run the service across multiple subnets/AZs with desired count > 1",
      "Pin all tasks to one subnet for simplicity",
      "Use only host network mode on a single instance",
      "Disable ELB health checks",
    ],
    answer: 0,
    why: "Spread tasks across AZs so capacity remains when one AZ fails.",
    lesson: L.ecs,
  },
  {
    id: "res-stepfunctions",
    domain: "Resilient",
    stemTemplate:
      "{{company}} long-running workflow must retry flaky steps, wait, and branch on errors with visible state. Orchestrator?",
    stems: [
      "{{company}} needs managed workflow orchestration with retries/catchers. Service?",
      "Durable multi-step processing for {{company}} — which AWS orchestrator?",
    ],
    choices: [
      "AWS Step Functions",
      "Cron on a single EC2 only",
      "SQS without a state machine for complex branching",
      "Amazon Polly",
    ],
    answer: 0,
    why: "Step Functions provide durable state, retries, and error handling for workflows.",
    lesson: L.apigw,
  },

  // ——— High-performing (18) ———
  {
    id: "hp-alb-path",
    domain: "High-performing",
    stemTemplate:
      "{{company}} needs host- and path-based routing to microservices on HTTP. Load balancer?",
    stems: [
      "{{company}} microservices need L7 path routing. Choose:",
      "HTTP host/path rules for {{company}} — which balancer?",
    ],
    choices: [
      "Application Load Balancer",
      "Network Load Balancer only",
      "Gateway Load Balancer for URL maps",
      "Classic Load Balancer sticky only without rules",
    ],
    answer: 0,
    why: "ALB provides L7 routing features for HTTP/HTTPS.",
    lesson: L.elb,
  },
  {
    id: "hp-cloudfront",
    domain: "High-performing",
    stemTemplate:
      "{{company}} serves static and dynamic web content globally with low latency and TLS at the edge. Service?",
    stems: [
      "{{company}} global content delivery with edge caching. Use:",
      "Lower TTFB worldwide for {{company}} site — AWS edge service?",
    ],
    choices: [
      "Amazon CloudFront",
      "Amazon Connect",
      "AWS Direct Connect only without CDN",
      "Amazon WorkSpaces",
    ],
    answer: 0,
    why: "CloudFront is the CDN for global edge caching and acceleration.",
    lesson: L.cf,
  },
  {
    id: "hp-s3-perf",
    domain: "High-performing",
    stemTemplate:
      "{{company}} analytics job reads many large objects from S3 concurrently and needs high aggregate throughput. Practice?",
    stems: [
      "{{company}} parallel S3 reads for big data — performance tip?",
      "Maximize {{company}} S3 GET throughput for analytics. Approach?",
    ],
    choices: [
      "Use parallelized GETs / multipart and modern prefixes (S3 scales automatically)",
      "Force all keys under a single hot prefix with sequential reads only",
      "Disable transfer acceleration and multipart always",
      "Store objects as one 5 TB file and stream from one client",
    ],
    answer: 0,
    why: "S3 scales with concurrent requests; parallelize and avoid unnecessary bottlenecks.",
    lesson: L.s3,
  },
  {
    id: "hp-ebs-gp3",
    domain: "High-performing",
    stemTemplate:
      "{{company}} needs tunable IOPS/throughput for a general-purpose SSD boot and data volume without provisioning io2 unless required. Type?",
    stems: [
      "{{company}} wants cost-effective SSD with independent IOPS/throughput knobs. Volume?",
      "EBS for {{company}} general DB-ish workload short of io2 — prefer:",
    ],
    choices: [
      "gp3 volumes",
      "magnetic standard only",
      "Instance store only for durable data",
      "st1 for random boot volumes",
    ],
    answer: 0,
    why: "gp3 offers baseline SSD with configurable IOPS/throughput at lower cost than io families for many cases.",
    lesson: L.ebs,
  },
  {
    id: "hp-efs",
    domain: "High-performing",
    stemTemplate:
      "{{company}} needs a shared POSIX file system mounted by hundreds of containers across AZs. Service?",
    stems: [
      "{{company}} shared file storage for multi-AZ containers. Choose:",
      "Concurrent multi-AZ file mounts for {{company}} — which service?",
    ],
    choices: [
      "Amazon EFS",
      "Single EBS volume attached to many instances simultaneously (not supported that way)",
      "Instance store shared via NFS you build on one AZ",
      "S3 mounted with POSIX locks guaranteed",
    ],
    answer: 0,
    why: "EFS is shared, elastic, multi-AZ NFS for many clients.",
    lesson: L.ebs,
  },
  {
    id: "hp-aurora-read",
    domain: "High-performing",
    stemTemplate:
      "{{company}} Aurora primary is CPU-bound on reads. Scale read traffic with low lag. Feature?",
    stems: [
      "{{company}} needs more Aurora read capacity quickly. Use:",
      "Offload {{company}} Aurora SELECTs — scaling feature?",
    ],
    choices: [
      "Aurora replicas / reader endpoint",
      "Disable the buffer pool",
      "Convert to single-AZ RDS MySQL only",
      "Move the database to S3 Select",
    ],
    answer: 0,
    why: "Aurora replicas serve read traffic via the reader endpoint.",
    lesson: L.aurora,
  },
  {
    id: "hp-ddb-gsi",
    domain: "High-performing",
    stemTemplate:
      "{{company}} DynamoDB access pattern needs queries on a non-primary attribute at scale. Feature?",
    stems: [
      "{{company}} must query DynamoDB by alternate keys efficiently. Add:",
      "Secondary access pattern for {{company}} DynamoDB — which?",
    ],
    choices: [
      "Global secondary index (GSI) or LSI as appropriate",
      "Scan the table on every request in production",
      "Export to CSV on EC2 each query",
      "Store JSON in a single item and filter in the app only",
    ],
    answer: 0,
    why: "GSIs/LSIs enable alternate query patterns without full scans.",
    lesson: L.ddb,
  },
  {
    id: "hp-elasticache",
    domain: "High-performing",
    stemTemplate:
      "{{company}} product pages hammer Aurora with identical reads. Cut latency and DB load. Layer?",
    stems: [
      "{{company}} hot-key reads overwhelm the DB. Caching service?",
      "Microsecond-ish reads for {{company}} catalog — add:",
    ],
    choices: [
      "Amazon ElastiCache (Redis/Memcached) in front of the DB",
      "Larger single AZ NAT Gateway only",
      "Disable CloudFront",
      "S3 Glacier Instant Retrieval for session data",
    ],
    answer: 0,
    why: "ElastiCache absorbs repeated reads and reduces primary DB pressure.",
    lesson: L.cache,
  },
  {
    id: "hp-lambda-perf",
    domain: "High-performing",
    stemTemplate:
      "{{company}} latency-sensitive Lambda is CPU-bound during init and runtime. Primary tuning knob?",
    stems: [
      "{{company}} Lambda needs more CPU for tight SLAs. How is CPU allocated?",
      "Speed up {{company}} compute-heavy Lambda — main lever?",
    ],
    choices: [
      "Increase memory (CPU and network scale with memory)",
      "Decrease memory to force more concurrency",
      "Always use the smallest arm64 with 128 MB regardless",
      "Attach a spinning rust disk via iSCSI",
    ],
    answer: 0,
    why: "Lambda CPU and network scale with configured memory.",
    lesson: L.lambda,
  },
  {
    id: "hp-privatelink-latency",
    domain: "High-performing",
    stemTemplate:
      "{{company}} microservices call AWS APIs heavily from private subnets; NAT Gateway adds cost and hops. Improve private API access?",
    stems: [
      "{{company}} wants lower-latency private access to AWS APIs than NAT. Prefer:",
      "Avoid NAT hairpinning for {{company}} S3/DynamoDB calls — use:",
    ],
    choices: [
      "VPC endpoints / PrivateLink (gateway or interface as appropriate)",
      "Hairpin through a public ALB in another account",
      "Disable DNS in the VPC",
      "Force all traffic via Internet Gateway from private IPs (invalid)",
    ],
    answer: 0,
    why: "Endpoints keep AWS API traffic on the Amazon network with better cost/latency profiles.",
    lesson: L.plink,
  },
  {
    id: "hp-route53-latency",
    domain: "High-performing",
    stemTemplate:
      "{{company}} serves users from multiple Regions and wants DNS to pick the lowest-latency Region. Policy?",
    stems: [
      "{{company}} multi-Region app — Route 53 routing for lowest latency?",
      "Steer {{company}} clients to nearest healthy Region via DNS. Policy?",
    ],
    choices: [
      "Latency-based routing",
      "Failover only with no latency consideration",
      "Simple routing to one Region",
      "Geoproximity only without any health checks ever (not the latency policy)",
    ],
    answer: 0,
    why: "Latency-based routing sends users to the Region with lowest latency.",
    lesson: L.r53,
  },
  {
    id: "hp-http2-alb",
    domain: "High-performing",
    stemTemplate:
      "{{company}} modern browsers speak HTTP/2 to the load balancer while targets speak HTTP/1.1. Supported on?",
    stems: [
      "{{company}} wants HTTP/2 on the front door. Which LB?",
      "Protocol modernisation for {{company}} web entry — ALB capability?",
    ],
    choices: [
      "Application Load Balancer (HTTP/2 / gRPC as configured)",
      "Network Load Balancer terminating HTTP/2 paths natively like ALB",
      "Classic Load Balancer HTTP/2 end-to-end only",
      "NAT Gateway HTTP/2 multiplexing",
    ],
    answer: 0,
    why: "ALB supports HTTP/2 and gRPC features at L7.",
    lesson: L.elb,
  },
  {
    id: "hp-ddb-ondemand",
    domain: "High-performing",
    stemTemplate:
      "{{company}} traffic is spiky and unpredictable; they need DynamoDB to absorb peaks without capacity planning toil. Mode?",
    stems: [
      "{{company}} unpredictable DynamoDB peaks — capacity mode?",
      "Spike-friendly DynamoDB for {{company}} — choose:",
    ],
    choices: [
      "On-demand capacity mode",
      "Provisioned with zero autoscaling and fixed tiny RCUs",
      "Scan-based design only",
      "Single partition hot key intentional design",
    ],
    answer: 0,
    why: "On-demand handles unpredictable spikes without manual provisioning.",
    lesson: L.ddb,
  },
  {
    id: "hp-enhanced-networking",
    domain: "High-performing",
    stemTemplate:
      "{{company}} HPC-ish EC2 fleet needs higher PPS and lower latency networking on supported types. Feature?",
    stems: [
      "{{company}} needs better EC2 network performance (ENA/SR-IOV). Enable:",
      "Packet-rate sensitive apps at {{company}} — networking feature?",
    ],
    choices: [
      "Enhanced networking (ENA) on supported instance types",
      "Disable jumbo frames always for all traffic",
      "Use t3.nano exclusively",
      "Turn off VPC DNS",
    ],
    answer: 0,
    why: "Enhanced networking (ENA) improves PPS and latency on modern instances.",
    lesson: L.ec2,
  },
  {
    id: "hp-s3-transfer-accel",
    domain: "High-performing",
    stemTemplate:
      "{{company}} global offices upload large objects to a bucket in one Region and need faster long-distance PUT performance. Feature?",
    stems: [
      "{{company}} distant clients upload slowly to a home-Region bucket. Accelerate with:",
      "Long-haul S3 uploads for {{company}} — which feature?",
    ],
    choices: [
      "S3 Transfer Acceleration",
      "S3 Glacier Deep Archive upload edge",
      "Disable multipart uploads",
      "Use only HTTP without TLS",
    ],
    answer: 0,
    why: "Transfer Acceleration uses CloudFront edge locations to speed distant transfers.",
    lesson: L.s3,
  },
  {
    id: "hp-apigw-caching",
    domain: "High-performing",
    stemTemplate:
      "{{company}} API Gateway GET endpoints return mostly identical responses and need reduced backend load. Feature?",
    stems: [
      "{{company}} wants API Gateway to cache GET responses. Enable:",
      "Cut {{company}} backend QPS for idempotent GETs — API Gateway feature?",
    ],
    choices: [
      "API Gateway response caching on the stage",
      "Force every request through a Step Functions Express sync only",
      "Disable CloudWatch metrics",
      "Use SOAP only",
    ],
    answer: 0,
    why: "Stage caching reduces calls to integrations for cacheable GETs.",
    lesson: L.apigw,
  },
  {
    id: "hp-read-replicas-rds",
    domain: "High-performing",
    stemTemplate:
      "{{company}} RDS MySQL primary is fine on writes but reporting queries contend. Scale reads asynchronously?",
    stems: [
      "{{company}} needs async read scaling for RDS MySQL. Feature?",
      "Offload {{company}} reporting from the primary — RDS option?",
    ],
    choices: [
      "Create read replicas (same or cross-Region as needed)",
      "Multi-AZ standby used as a read endpoint (standby is not for reads)",
      "Delete indexes to speed reports",
      "Move OLTP to Glacier",
    ],
    answer: 0,
    why: "Read replicas serve read traffic; Multi-AZ standby is not a read target.",
    lesson: L.aurora,
  },
  {
    id: "hp-graviton",
    domain: "High-performing",
    stemTemplate:
      "{{company}} wants better price-performance for Linux web fleets on EC2 without changing architecture much. Direction?",
    stems: [
      "{{company}} Linux services — modern price-performance instance family tip?",
      "Improve {{company}} web tier perf/$ — prefer which CPU architecture on AWS?",
    ],
    choices: [
      "Graviton-based instance types where software supports ARM64",
      "Only the oldest Intel types for compatibility theater",
      "GPU instances for static HTML",
      "Mac instances for Linux APIs",
    ],
    answer: 0,
    why: "Graviton often delivers strong price-performance for supported Linux workloads.",
    lesson: L.ec2,
  },

  // ——— Cost (14) ———
  {
    id: "cost-savings-plans",
    domain: "Cost",
    stemTemplate:
      "{{company}} has steady EC2/Fargate/Lambda usage and wants flexible discounts without locking to a single instance family. Product?",
    stems: [
      "{{company}} steady compute spend — flexible discount instrument?",
      "Commit discount for {{company}} across EC2/Lambda/Fargate — prefer:",
    ],
    choices: [
      "Compute Savings Plans",
      "Only Spot for stateful databases",
      "On-Demand exclusively forever",
      "Dedicated Hosts for every microservice",
    ],
    answer: 0,
    why: "Compute Savings Plans discount eligible usage flexibly across instance families and some serverless.",
    lesson: L.pricing,
  },
  {
    id: "cost-spot",
    domain: "Cost",
    stemTemplate:
      "{{company}} runs fault-tolerant batch that can checkpoint and retry. Deepest compute discount?",
    stems: [
      "{{company}} interruptible batch jobs — cheapest EC2 purchasing option?",
      "Stateless/retriable workers for {{company}} — maximize savings with:",
    ],
    choices: [
      "EC2 Spot Instances (diversified / Spot Fleet or ASG mixed)",
      "On-Demand only",
      "Standard Reserved Instances for 3 years on every experimental job",
      "Dedicated Instances for batch",
    ],
    answer: 0,
    why: "Spot offers the steepest discounts for interruptible workloads.",
    lesson: L.pricing,
  },
  {
    id: "cost-s3-it",
    domain: "Cost",
    stemTemplate:
      "{{company}} has unknown/changing access patterns on a large dataset and wants automatic cost tiering. Class?",
    stems: [
      "{{company}} uncertain object access — S3 class that auto-tiers?",
      "Minimize {{company}} storage toil for mixed access objects. Prefer:",
    ],
    choices: [
      "S3 Intelligent-Tiering",
      "S3 Glacier Deep Archive for all hot assets",
      "S3 Reduced Redundancy (legacy) only",
      "Store everything in EBS io2",
    ],
    answer: 0,
    why: "Intelligent-Tiering moves objects across tiers based on access without lifecycle guesswork.",
    lesson: L.s3,
  },
  {
    id: "cost-lifecycle",
    domain: "Cost",
    stemTemplate:
      "{{company}} logs are hot 30 days, then rarely read, then must be retained 7 years cheaply. Approach?",
    stems: [
      "{{company}} log retention cost curve — S3 tool?",
      "Age {{company}} logs into colder storage automatically. Use:",
    ],
    choices: [
      "S3 Lifecycle rules transitioning to IA/Glacier classes",
      "Keep all objects in S3 Standard indefinitely",
      "Delete after 7 days despite retention law",
      "Replicate every object to five Regions always",
    ],
    answer: 0,
    why: "Lifecycle policies move/expire objects to match access and retention economics.",
    lesson: L.s3,
  },
  {
    id: "cost-nat-vs-endpoint",
    domain: "Cost",
    stemTemplate:
      "{{company}} private subnets pull large volumes from S3 via NAT Gateway and the bill is high. Cost fix?",
    stems: [
      "{{company}} S3 via NAT is expensive. Cheaper private path?",
      "Cut {{company}} NAT data processing for S3. Prefer:",
    ],
    choices: [
      "S3 gateway VPC endpoint so traffic avoids NAT",
      "Add more NAT Gateways in every AZ without endpoints",
      "Make the bucket public",
      "Hairpin through a transit VPC in another Region",
    ],
    answer: 0,
    why: "Gateway endpoints for S3/DynamoDB remove NAT data charges for that traffic.",
    lesson: L.plink,
  },
  {
    id: "cost-explorer",
    domain: "Cost",
    stemTemplate:
      "{{company}} finance needs interactive breakdowns of spend by service, account, and tag. Tool?",
    stems: [
      "{{company}} wants to analyze AWS spend trends visually. Use:",
      "Attribution of {{company}} cloud bill by tag — primary console tool?",
    ],
    choices: [
      "AWS Cost Explorer",
      "Amazon CloudFront real-time logs only",
      "VPC Reachability Analyzer",
      "Amazon Rekognition",
    ],
    answer: 0,
    why: "Cost Explorer is the interactive cost analysis tool.",
    lesson: L.costx,
  },
  {
    id: "cost-budgets",
    domain: "Cost",
    stemTemplate:
      "{{company}} wants alerts when forecasted spend exceeds a threshold. Service?",
    stems: [
      "{{company}} needs proactive spend threshold alerts. Configure:",
      "Notify {{company}} FinOps when costs approach a cap — which?",
    ],
    choices: [
      "AWS Budgets",
      "Amazon SNS without a budget metric alone",
      "AWS WAF rate rules",
      "Amazon Macie",
    ],
    answer: 0,
    why: "Budgets tracks actual/forecast cost and usage against thresholds.",
    lesson: L.costx,
  },
  {
    id: "cost-rightsize",
    domain: "Cost",
    stemTemplate:
      "{{company}} CloudWatch shows EC2 fleets at 5% CPU for months. Cost action?",
    stems: [
      "{{company}} chronically underutilized EC2 — first cost move?",
      "Waste on {{company}} idle instances — recommended practice?",
    ],
    choices: [
      "Rightsizing (smaller types / Graviton) or schedule stop for non-prod",
      "Buy more Reserved capacity for the oversized fleet immediately",
      "Disable detailed monitoring only",
      "Move everything to the largest bare metal",
    ],
    answer: 0,
    why: "Rightsizing and scheduling beat committing spend on waste.",
    lesson: L.pricing,
  },
  {
    id: "cost-aurora-serverless",
    domain: "Cost",
    stemTemplate:
      "{{company}} has a spiky, often-idle relational workload and wants to pay mainly when active. Option?",
    stems: [
      "{{company}} intermittent OLTP — Aurora option to cut idle cost?",
      "Variable {{company}} DB traffic with idle nights — consider:",
    ],
    choices: [
      "Aurora Serverless v2 (or appropriate serverless relational option)",
      "Provisioned max-size Multi-AZ always at peak",
      "DynamoDB for strong relational joins only",
      "Run MySQL on a leftover desktop",
    ],
    answer: 0,
    why: "Serverless Aurora scales capacity with demand and reduces idle over-provisioning.",
    lesson: L.aurora,
  },
  {
    id: "cost-ddb-ttl",
    domain: "Cost",
    stemTemplate:
      "{{company}} session table in DynamoDB grows forever; items should expire after 24h. Feature?",
    stems: [
      "{{company}} must auto-delete stale DynamoDB sessions. Use:",
      "Bound {{company}} DynamoDB storage growth for ephemeral items — enable:",
    ],
    choices: [
      "DynamoDB TTL attribute",
      "Manual scans deleting items every second from Lambda without TTL",
      "S3 lifecycle on the DynamoDB table",
      "EBS snapshots of DynamoDB",
    ],
    answer: 0,
    why: "TTL expires items automatically, controlling storage cost.",
    lesson: L.ddb,
  },
  {
    id: "cost-cw-logs",
    domain: "Cost",
    stemTemplate:
      "{{company}} CloudWatch Logs ingestion/storage costs soar from verbose debug logs in prod. Control?",
    stems: [
      "{{company}} log bill too high — operational cost control?",
      "Reduce {{company}} CloudWatch Logs spend without losing critical audit. Approach?",
    ],
    choices: [
      "Tune log levels, retention periods, and filter/subscription strategies",
      "Set retention to Never expire for all log groups",
      "Duplicate every log to five Regions",
      "Disable CloudTrail instead",
    ],
    answer: 0,
    why: "Retention, verbosity, and filtering are the primary log cost levers.",
    lesson: L.ops,
  },
  {
    id: "cost-gp3-vs-io",
    domain: "Cost",
    stemTemplate:
      "{{company}} provisioned io1 volumes far above needed IOPS. Cost-savvy move for many workloads?",
    stems: [
      "{{company}} overpaying for provisioned IOPS EBS. Often switch to?",
      "Right-cost SSD for {{company}} when io1 is overkill — prefer:",
    ],
    choices: [
      "Migrate eligible volumes to gp3 with appropriate IOPS/throughput",
      "Move boot volumes to st1 throughput HDD",
      "Use only io2 Block Express for static sites",
      "Disable EBS encryption to save pennies unsafely",
    ],
    answer: 0,
    why: "gp3 often matches needed performance cheaper than legacy provisioned-IOPS defaults.",
    lesson: L.ebs,
  },
  {
    id: "cost-cloudfront-egress",
    domain: "Cost",
    stemTemplate:
      "{{company}} serves large media from S3 to a global audience; origin egress is expensive. Architecture tweak?",
    stems: [
      "{{company}} global media egress from S3 is costly. Front with?",
      "Cut {{company}} S3 data transfer to viewers worldwide — pattern?",
    ],
    choices: [
      "CloudFront in front of S3 (cache hits avoid repeated origin egress)",
      "Replicate the bucket to every Region and use multi-Region DNS always",
      "Expose the bucket publicly without CDN",
      "Transfer Acceleration for downloads of tiny JSON only",
    ],
    answer: 0,
    why: "CDN caching reduces origin bytes out and often improves cost at scale.",
    lesson: L.cf,
  },
  {
    id: "cost-fargate-spot",
    domain: "Cost",
    stemTemplate:
      "{{company}} ECS tasks are stateless and tolerant of interruption. Further reduce Fargate cost?",
    stems: [
      "{{company}} interruptible ECS tasks on Fargate — cheaper capacity?",
      "Stateless {{company}} containers — Fargate discount option?",
    ],
    choices: [
      "Fargate Spot capacity providers for eligible tasks",
      "Always On-Demand Fargate with max CPU",
      "Replace with dedicated GPU bare metal",
      "Run tasks on Lambda with 10 GB ephemeral for all stateful needs",
    ],
    answer: 0,
    why: "Fargate Spot discounts interruptible container workloads.",
    lesson: L.pricing,
  },
];

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function companyFor(mockN, idx, rng) {
  const base = (mockN * 3 + idx + Math.floor(rng() * COMPANIES.length)) % COMPANIES.length;
  return COMPANIES[base];
}

function fillCompany(text, company) {
  return String(text).split("{{company}}").join(company);
}

function pickStem(tpl, company, mockN, rng) {
  const variants = [tpl.stemTemplate].concat(tpl.stems || []);
  const pick = variants[(mockN + Math.floor(rng() * variants.length)) % variants.length];
  return fillCompany(pick, company);
}

function rotateChoices(choices, answer, mockN, rng) {
  // Keep correctness; lightly permute distractor order across mocks while preserving answer index mapping
  const items = choices.map((c, i) => ({ c, i }));
  const correct = items[answer];
  const distractors = shuffle(
    items.filter((x) => x.i !== answer),
    rng
  );
  // Insert correct at a stable-but-mock-dependent slot
  const slot = (answer + mockN) % choices.length;
  const out = [];
  let di = 0;
  for (let s = 0; s < choices.length; s++) {
    if (s === slot) out.push(correct);
    else out.push(distractors[di++]);
  }
  const newAnswer = out.findIndex((x) => x.i === answer);
  return { choices: out.map((x) => x.c), answer: newAnswer };
}

function selectForMock(mockN) {
  const rng = mulberry32(20260911 + mockN * 7919);
  const byDomain = {};
  for (const t of TEMPLATES) {
    if (!byDomain[t.domain]) byDomain[t.domain] = [];
    byDomain[t.domain].push(t);
  }

  const selected = [];
  for (const [domain, need] of Object.entries(DOMAIN_COUNTS)) {
    const pool = byDomain[domain] || [];
    if (pool.length < need) {
      throw new Error(
        `Domain ${domain}: need ${need} templates, have ${pool.length}`
      );
    }
    const shuffled = shuffle(pool, rng);
    // Offset start so mocks prefer different subsets when extras exist
    const offset = (mockN * 5) % pool.length;
    const rotated = shuffled.slice(offset).concat(shuffled.slice(0, offset));
    selected.push(...rotated.slice(0, need));
  }

  const ordered = shuffle(selected, rng);
  return ordered.map((tpl, idx) => {
    const company = companyFor(mockN, idx, rng);
    const stem = pickStem(tpl, company, mockN, rng);
    const rotated = rotateChoices(tpl.choices, tpl.answer, mockN, rng);
    const why = fillCompany(tpl.why, company);
    return {
      domain: tpl.domain,
      stem,
      choices: rotated.choices,
      answer: rotated.answer,
      why,
      lesson: tpl.lesson,
      _id: tpl.id,
    };
  });
}

function escJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function wrapHtml(mockN, bank) {
  const next =
    mockN < 3
      ? `<a href="mock-${mockN + 1}.html">Mock ${mockN + 1}</a>`
      : `<a href="high-yield.html">High-yield drill</a>`;
  const prev =
    mockN > 1
      ? `<a href="mock-${mockN - 1}.html">Mock ${mockN - 1}</a> · `
      : `<a href="domain-map.html">Domain map</a> · `;

  // Strip helper ids from published bank
  const published = {
    minutes: bank.minutes,
    label: bank.label,
    passHint: bank.passHint,
    questions: bank.questions.map(({ domain, stem, choices, answer, why, lesson }) => ({
      domain,
      stem,
      choices,
      answer,
      why,
      lesson,
    })),
  };

  return `<section class="hero reveal">
  <span class="eyebrow">SAA-C03 · mock ${mockN}</span>
  <span class="domain-chip">65 Q · 130 min</span>
  <h1>SAA Mock ${mockN}.</h1>
  <p class="lead">Full-length timed practice. Domains ≈ Secure 20 · Resilient 17 · High-performing 16 · Cost 12. Score, then remediate weak areas in <a href="../../aws-saa-guide/index.html">aws-saa-guide</a>.</p>
</section>

<section class="section reveal in" id="mock">
  <h2><span class="section-num">01</span> Timed mock</h2>
  <div data-mock>
  <script type="application/json" id="mockBank">
${escJson(published)}
  </script>
  </div>
</section>

<section class="section reveal" id="check">
  <h2><span class="section-num">02</span> After you score</h2>
  <p>Open every miss’s lesson link. Then: ${prev}${next} · <a href="high-yield.html">High-yield</a>.</p>
</section>
`;
}

function countDomains(questions) {
  const c = {};
  for (const q of questions) {
    c[q.domain] = (c[q.domain] || 0) + 1;
  }
  return c;
}

function main() {
  if (TEMPLATES.length < 70) {
    throw new Error(`Need ≥70 templates, have ${TEMPLATES.length}`);
  }

  const summary = {};
  for (let n = 1; n <= 3; n++) {
    const questions = selectForMock(n);
    if (questions.length !== 65) {
      throw new Error(`Mock ${n}: expected 65, got ${questions.length}`);
    }
    const counts = countDomains(questions);
    for (const [d, need] of Object.entries(DOMAIN_COUNTS)) {
      if (counts[d] !== need) {
        throw new Error(`Mock ${n}: ${d} has ${counts[d]}, need ${need}`);
      }
    }

    const bank = {
      minutes: 130,
      label: `SAA-C03 · Mock ${n}`,
      passHint: "Practice bar ≥72% (~AWS 720/1000).",
      questions,
    };

    // Validate JSON round-trip
    const parsed = JSON.parse(JSON.stringify(bank));
    if (!parsed.questions || parsed.questions.length !== 65) {
      throw new Error(`Mock ${n}: JSON round-trip failed`);
    }

    const html = wrapHtml(n, bank);
    // Ensure embedded JSON parses
    const m = html.match(/<script type="application\/json" id="mockBank">\s*([\s\S]*?)\s*<\/script>/);
    if (!m) throw new Error(`Mock ${n}: mockBank script missing`);
    const bankParsed = JSON.parse(m[1]);
    if (bankParsed.questions.length !== 65 || bankParsed.minutes !== 130) {
      throw new Error(`Mock ${n}: embedded bank invalid`);
    }

    const outPath = path.join(OUT_DIR, `saa-mock-${n}.html`);
    fs.writeFileSync(outPath, html, "utf8");
    summary[`mock-${n}`] = counts;
    console.log(`Wrote ${outPath} (${TEMPLATES.length} templates available)`);
  }

  console.log("\nDomain counts per mock:");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nTemplates: ${TEMPLATES.length}`);
  const tplBy = countDomains(TEMPLATES);
  console.log("Template pool by domain:", JSON.stringify(tplBy));
}

main();
