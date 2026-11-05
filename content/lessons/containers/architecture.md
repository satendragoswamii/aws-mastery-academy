## A containerised web application on AWS

~~~text
 Developer -> git push -> CI pipeline (e.g. CodeBuild)
                              | docker build, docker push
                              v
                     Amazon ECR: shop-api:1.4 (scanned for vulnerabilities)
                              |
                              v  ECS service "shop-api" (desired 4 tasks)
          Application Load Balancer
             /                     \
 +----------------------+   +----------------------+
 | AZ ap-south-1a       |   | AZ ap-south-1b       |
 | [task] [task]        |   | [task] [task]        |   on AWS Fargate:
 |  shop-api container  |   |  shop-api container  |   no EC2 instances to manage
 +----------------------+   +----------------------+
             \                     /
          Amazon RDS / DynamoDB (state lives outside the containers)
          CloudWatch Logs (container output)
~~~

Notice the familiar patterns: multiple AZs, a load balancer, a desired count that the service maintains, and state kept outside the disposable units. An ECS service is to tasks what an Auto Scaling group is to instances.

### Choosing the compute for containers
| Need | Choice |
|---|---|
| No servers to manage, pay per task | **ECS on Fargate** |
| Already use Kubernetes, or need its ecosystem | **EKS** (on Fargate or EC2) |
| GPUs, special instance types, or very high steady usage | ECS/EKS on **EC2** |
| One container, simple web app, minimal setup | **AWS App Runner** (fully managed) |
| Short event-driven functions instead of always-on services | **AWS Lambda** (which also accepts container images) |

### Your lab's containers
~~~text
macOS
 +-- Colima VM (Ubuntu, kernel 6.8)
      +-- Docker engine
           +-- floci                       (the AWS emulator)
           +-- floci-aws-ui                (Floci web console)
           +-- ama-postgres                (the academy's database)
           +-- floci-aws-ec2-volume-helper (started by Floci for EC2 labs)
           +-- floci-aws-ecr-registry      (started by Floci for ECR)
           +-- short-lived containers you run in the demo (alpine:3.21)
~~~
Everything you've used so far in this course runs as containers.
