/* AWS SAA Field Guide — site manifest (SAA-C03) */
const MODULES = [
  { key: "foundations", label: "Foundations", pages: [
    { slug: "cloud-mental-model", title: "Cloud mental model", nav: "Cloud mental model", id: "fo-cloud", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "regions-azs-edge", title: "Regions, AZs & the edge", nav: "Regions & AZs", id: "fo-regions", widgets: ["mermaid-init.js"] },
    { slug: "well-architected", title: "Well-Architected Framework", nav: "Well-Architected", id: "fo-wa", widgets: ["mermaid-init.js", "tradeoff.js"] },
    { slug: "shared-responsibility", title: "Shared responsibility", nav: "Shared responsibility", id: "fo-shared", widgets: ["mermaid-init.js"] },
    { slug: "exam-method", title: "How to take SAA-C03", nav: "Exam method", id: "fo-exam", widgets: ["mermaid-init.js"] },
  ]},
  { key: "networking", label: "Networking", pages: [
    { slug: "vpc-and-subnets", title: "VPC & subnets", nav: "VPC & subnets", id: "net-vpc", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "routing-sg-nacl", title: "Routing, security groups & NACLs", nav: "Routing · SG · NACL", id: "net-route", widgets: ["mermaid-init.js"] },
    { slug: "endpoints-privatelink", title: "VPC endpoints & PrivateLink", nav: "Endpoints & PrivateLink", id: "net-endpoints", widgets: ["mermaid-init.js"] },
    { slug: "route53-dns", title: "Route 53 & DNS patterns", nav: "Route 53", id: "net-r53", widgets: ["mermaid-init.js"] },
    { slug: "cloudfront-global", title: "CloudFront & global edge", nav: "CloudFront", id: "net-cf", widgets: ["mermaid-init.js"] },
  ]},
  { key: "identity-security", label: "Identity & Security", pages: [
    { slug: "iam-users-roles-policies", title: "IAM users, roles & policies", nav: "IAM", id: "sec-iam", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "encryption-kms-secrets", title: "Encryption, KMS & secrets", nav: "KMS & secrets", id: "sec-kms", widgets: ["mermaid-init.js"] },
    { slug: "org-scp-identity-center", title: "Organizations, SCPs & Identity Center", nav: "Orgs · SCP · IDC", id: "sec-org", widgets: ["mermaid-init.js"] },
    { slug: "edge-waf-shield", title: "WAF, Shield & edge protection", nav: "WAF & Shield", id: "sec-waf" },
    { slug: "detective-controls", title: "Detective controls", nav: "Detective controls", id: "sec-detect", widgets: ["mermaid-init.js"] },
  ]},
  { key: "compute", label: "Compute", pages: [
    { slug: "ec2-asg-placement", title: "EC2, ASG & placement", nav: "EC2 & ASG", id: "cmp-ec2", widgets: ["mermaid-init.js", "tradeoff.js"] },
    { slug: "elb-patterns", title: "Elastic Load Balancing patterns", nav: "ELB patterns", id: "cmp-elb", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "lambda-serverless", title: "Lambda & serverless compute", nav: "Lambda", id: "cmp-lambda", widgets: ["mermaid-init.js"] },
    { slug: "containers-ecs-eks", title: "Containers: ECS vs EKS", nav: "ECS vs EKS", id: "cmp-containers", widgets: ["mermaid-init.js"] },
  ]},
  { key: "storage", label: "Storage", pages: [
    { slug: "s3-classes-and-access", title: "S3 storage classes & access", nav: "S3", id: "sto-s3", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "ebs-efs-fsx", title: "EBS, EFS & FSx", nav: "EBS · EFS · FSx", id: "sto-block", widgets: ["mermaid-init.js"] },
    { slug: "aws-backup", title: "AWS Backup & protection", nav: "AWS Backup", id: "sto-backup", widgets: ["mermaid-init.js"] },
  ]},
  { key: "databases", label: "Databases", pages: [
    { slug: "rds-aurora-ha", title: "RDS & Aurora high availability", nav: "RDS & Aurora", id: "db-rds", widgets: ["mermaid-init.js"] },
    { slug: "dynamodb-access-patterns", title: "DynamoDB access patterns", nav: "DynamoDB", id: "db-ddb", widgets: ["mermaid-init.js"] },
    { slug: "elasticache", title: "ElastiCache", nav: "ElastiCache", id: "db-cache", widgets: ["mermaid-init.js"] },
  ]},
  { key: "integration", label: "Application Integration", pages: [
    { slug: "sqs-sns-eventbridge", title: "SQS, SNS & EventBridge", nav: "SQS · SNS · EB", id: "int-msg", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "api-gateway-step-functions", title: "API Gateway & Step Functions", nav: "API GW · Step Fn", id: "int-api", widgets: ["mermaid-init.js"] },
  ]},
  { key: "resilience", label: "Resilience & DR", pages: [
    { slug: "multi-az-multi-region", title: "Multi-AZ vs multi-Region", nav: "Multi-AZ · Region", id: "res-az", widgets: ["mermaid-init.js"] },
    { slug: "dr-rpo-rto", title: "DR strategies, RPO & RTO", nav: "DR · RPO · RTO", id: "res-dr", widgets: ["mermaid-init.js", "tradeoff.js"] },
    { slug: "decoupling-and-scaling", title: "Decoupling & scaling patterns", nav: "Decouple & scale", id: "res-scale", widgets: ["mermaid-init.js", "reqflow.js"] },
  ]},
  { key: "cost-ops", label: "Cost & Operations", pages: [
    { slug: "pricing-models", title: "Pricing models", nav: "Pricing models", id: "cost-price", widgets: ["mermaid-init.js"] },
    { slug: "cost-explorer-budgets", title: "Cost Explorer, Budgets & allocation", nav: "Cost tooling", id: "cost-tools", widgets: ["mermaid-init.js"] },
    { slug: "cloudwatch-config-cloudtrail", title: "CloudWatch, Config & CloudTrail", nav: "CW · Config · Trail", id: "cost-ops", widgets: ["mermaid-init.js"] },
  ]},
];

const EXAM_PREP = [
  { dir: "exam", slug: "domain-map", title: "SAA-C03 domain map", nav: "Domain map", id: "ex-map", widgets: ["mermaid-init.js"] },
  { dir: "exam", slug: "scenario-bank", title: "Architecture scenario bank", nav: "Scenario bank", id: "ex-scenarios", widgets: ["mermaid-init.js"] },
  { dir: "exam", slug: "mock-exam", title: "Timed mock exam", nav: "Timed mock", id: "ex-mock", widgets: ["mock-exam.js"] },
];

const REFERENCE = [
  { dir: "exam", slug: "cheat-sheet", title: "SAA cheat-sheet", nav: "Cheat-sheet", tool: "exam", widgets: [] },
  { dir: "exam", slug: "flashcards", title: "SAA flashcards", nav: "Flashcards", tool: "exam", widgets: ["flashcards.js"] },
  { dir: "reference", slug: "glossary", title: "Glossary", nav: "Glossary", tool: "", widgets: [] },
];

function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "AWS SAA Field Guide", tool: "", lesson: null, module: null, widgets: [] });
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  EXAM_PREP.forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: "exam", lesson: p.id || null, module: p.id ? "exam" : null, widgets: p.widgets || [] });
  });
  REFERENCE.forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: p.tool || "", lesson: null, module: null, widgets: p.widgets || [] });
  });
  return out;
}

function sidebarGroups() {
  const groups = [];
  groups.push({ label: "Start here", cls: "", links: [{ file: "index.html", label: "Home · the roadmap" }] });
  MODULES.forEach(function (m) {
    groups.push({ label: m.label, cls: "is-" + m.key,
      links: m.pages.map(function (p) { return { file: file(m.key, p.slug), label: p.nav }; }) });
  });
  groups.push({ label: "Exam prep", cls: "is-exam",
    links: EXAM_PREP.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; })
      .concat(REFERENCE.filter(function (p) { return p.dir === "exam"; }).map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; })) });
  groups.push({ label: "Reference", cls: "",
    links: REFERENCE.filter(function (p) { return p.dir === "reference"; }).map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  return groups;
}

function lessons() {
  const out = [];
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      if (p.id) out.push({ id: p.id, title: p.title, url: file(m.key, p.slug), module: m.key, tool: m.key });
    });
  });
  EXAM_PREP.forEach(function (p) {
    if (p.id) out.push({ id: p.id, title: p.title, url: file(p.dir, p.slug), module: "exam", tool: "exam" });
  });
  return out;
}

const LESSON_MODULES = MODULES.map(function (m) { return { key: m.key, label: m.label }; })
  .concat([{ key: "exam", label: "Exam prep" }]);

module.exports = { MODULES, INTERVIEW_PREP: EXAM_PREP, EXAM_PREP, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
