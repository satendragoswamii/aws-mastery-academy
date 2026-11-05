## Commands in this lesson

### Docker (on your Mac)
| Command | What it does |
|---|---|
| `docker run --rm <image> <command>` | Creates a container, runs the command, deletes the container when it exits |
| `docker run --rm --memory 64m --cpus 0.5 …` | Same, with memory and CPU limits |
| `docker images` | Lists images stored locally |
| `docker ps` / `docker ps -a` | Lists running / all containers |
| `docker logs <name>` | Shows a container's output |
| `docker build -t <name>:<tag> .` | Builds an image from a Dockerfile |

> **Avoid surprise downloads.** `docker run` downloads any image you don't already have. Your Mac is short on disk space, so in this course stick to images you already have (`docker images`), such as `alpine:3.21`.

> **Don't touch the course containers.** `floci`, `floci-aws-ui`, `ama-postgres` and the `floci-aws-*` helpers are part of your lab. Never stop or remove them.

### Amazon ECS (AWS CLI)
| Command | What it does |
|---|---|
| `aws ecs create-cluster --cluster-name …` | Creates a cluster |
| `aws ecs register-task-definition --family … --container-definitions '[…]'` | Registers a new task definition revision |
| `aws ecs run-task --cluster … --task-definition … --launch-type FARGATE --network-configuration …` | Runs a task once |
| `aws ecs describe-tasks --cluster … --tasks …` | Shows status, exit code and stop reason |
| `aws ecs list-tasks --cluster …` | Lists tasks |
| `aws ecs create-service …` | Keeps N tasks running (with an optional load balancer) |
| `aws ecs deregister-task-definition --task-definition family:revision` | Marks a revision INACTIVE |
| `aws ecs delete-cluster --cluster …` | Deletes an empty cluster |

### Amazon ECR (real AWS)
| Command | What it does |
|---|---|
| `aws ecr create-repository --repository-name …` | Creates a private image repository |
| `aws ecr get-login-password \| docker login --username AWS --password-stdin <registry>` | Logs Docker in to ECR |
| `docker tag` / `docker push <account>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>` | Uploads an image |

These ECR steps don't work against Floci in this setup (see the demo), so they're listed for reference only.

### Fargate CPU and memory
CPU is in units (1024 = 1 vCPU), and only certain combinations are allowed. For example 256 CPU units (0.25 vCPU) allows 512 MB, 1 GB or 2 GB of memory.
