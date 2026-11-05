## In the real world

### From monolith to containers
An Indian e-commerce company ran one large Java application on a few big servers. Every release meant deploying everything, with hours of downtime. They split it into services (catalogue, cart, payments, delivery tracking), each a container image deployed on ECS. Teams now release their service independently, several times a day, and each service scales on its own: search scales up during sales; payments stays steady.

### Consistent environments
A data-science team builds a container image with exact versions of Python, libraries and models. The same image runs on laptops, in testing and in production, which ends "works on my machine" problems.

### Batch jobs
A fintech runs nightly reconciliation as ECS tasks on Fargate. Each task starts, processes a batch, and exits with code 0, exactly like the demo task. They pay only for the minutes the tasks run.

### Common mistakes teams make
- **Huge images** (several GB) that are slow to pull and deploy. Using small base images (like Alpine or distroless) helps.
- **Storing data inside containers**: it disappears when the container is replaced. Use databases, S3 or EFS.
- **Running as root** inside the container, and using images with known vulnerabilities. ECR image scanning helps find them.
- **Using the `latest` tag** in production, so nobody knows which version is running. Use explicit versions.

### On the job
You'll write Dockerfiles, push images to ECR, write task definitions, run ECS services behind load balancers, set CPU and memory sizes, read container logs in CloudWatch, and choose between Fargate and EC2 capacity.
