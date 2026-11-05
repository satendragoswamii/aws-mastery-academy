## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.3 (compute services):** recognise container services and when to use them.

| Question wording | Answer |
|---|---|
| "Run containers without managing servers or clusters of EC2 instances" | **AWS Fargate** |
| "Managed Kubernetes" / "already using Kubernetes" | **Amazon EKS** |
| "Fully managed container orchestration from AWS" | **Amazon ECS** |
| "Store, manage and deploy container images" | **Amazon ECR** |
| "Package an application with its dependencies to run consistently" | Containers |
| "Run a container-based web app with the least setup" | **AWS App Runner** (or ECS on Fargate) |

### Comparisons you'll be asked about
| | EC2 | Containers on Fargate | Lambda |
|---|---|---|---|
| You manage | OS and up | Images and task settings | Function code |
| Runs | Always on (until stopped) | Tasks/services, as long as needed | Per event, up to 15 minutes |
| Billing | Per second per instance | Per second for vCPU and memory | Per request and duration |

### Exam traps
- **ECS vs. EKS:** both orchestrate containers; EKS = Kubernetes.
- **Fargate isn't an orchestrator.** It's the serverless **compute** that ECS or EKS run tasks on.
- **ECR isn't for running containers.** It's the image registry.
- **Containers don't need their own OS kernel**; VMs do.

### Later certifications
Developer – Associate and SAA-C03 test task roles vs. execution roles, service auto scaling, load balancer integration, Fargate vs. EC2 capacity providers, and blue/green deployments for containers.
