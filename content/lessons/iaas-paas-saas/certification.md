## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
- **Domain 1:** benefits of **managed services**; reducing operational overhead.
- **Domain 2, task 2.1:** how the customer's responsibilities **change with the service** (EC2 versus RDS versus Lambda).
- **Domain 3:** identifying compute, database and serverless services by what they manage for you.

### What the exam expects
| Question wording | Answer pattern |
|---|---|
| "Least operational overhead", "without managing servers" | Serverless or fully managed (Lambda, DynamoDB, Fargate, S3) |
| "Full control over the operating system" | EC2 (IaaS) |
| "Who patches the guest OS on EC2?" | The customer |
| "Who patches the database engine on Amazon RDS?" | AWS |
| "Who manages data and access in any service?" | The customer |
| "Deploy code without worrying about the underlying infrastructure" | Elastic Beanstalk (PaaS) or Lambda (serverless) |
| "Use a complete application delivered over the internet" | SaaS |

### Classify these AWS services
| Service | Model |
|---|---|
| Amazon EC2 | IaaS |
| Amazon EBS, Amazon VPC | IaaS building blocks |
| AWS Elastic Beanstalk | PaaS |
| Amazon RDS, Amazon Aurora, Amazon ElastiCache | Managed (PaaS-like) databases |
| AWS Lambda, AWS Fargate | Serverless compute |
| Amazon DynamoDB, Amazon S3, Amazon SQS, Amazon SNS | Serverless / fully managed |
| Amazon WorkMail, Amazon Connect, Amazon QuickSight | SaaS-style applications |

### Exam traps
- **"Elastic Beanstalk = serverless"** is wrong. It manages the platform for you, but it creates EC2 instances.
- **"RDS means AWS manages my data"** is wrong. AWS operates the engine; you own the schema, queries, users and data.
- **"Serverless means no servers exist"** is wrong. Servers exist; you just never manage them.

### Later certifications
**Developer – Associate** and **Solutions Architect – Associate** lean heavily on choosing between EC2, containers and Lambda, and between RDS, Aurora and DynamoDB, based on requirements and operational overhead.
