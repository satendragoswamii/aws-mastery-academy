## How containers work

### Isolation with namespaces
Linux **namespaces** give a process its own view of the system:
| Namespace | What the container sees |
|---|---|
| PID | Only its own processes. Its first process is PID 1 (you'll see this in the demo) |
| Mount | Its own filesystem, from the image |
| Network | Its own network interfaces and ports |
| UTS | Its own hostname |
| User | Its own user IDs (root inside can be unprivileged outside) |

### Limits with cgroups
**Control groups (cgroups)** cap what a container can use. `docker run --memory 64m --cpus 0.5` writes limits that the kernel enforces: the demo reads them back from `/sys/fs/cgroup`.

### Images are layers
~~~text
image: shop-api:1.4
 +-------------------------------+
 | layer 4: your app code        |  changes often, small
 | layer 3: pip install -r ...   |
 | layer 2: Python runtime       |
 | layer 1: base OS files (Alpine)|  shared by many images
 +-------------------------------+
~~~
Layers are cached and shared. Changing your code only rebuilds and re-uploads the top layer. Images are built from a **Dockerfile**:

~~~dockerfile
FROM python:3.12-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
~~~

### The lifecycle
~~~text
 Dockerfile --docker build--> image --docker push--> registry (ECR)
                                                        |
                                    ECS/EKS pulls image |
                                                        v
                                         container runs on EC2 or Fargate
~~~

### Running containers on AWS
| Layer | Options |
|---|---|
| **Registry** (store images) | Amazon ECR (private, integrated with IAM; image scanning) |
| **Orchestrator** (decide what runs where) | Amazon ECS, or Amazon EKS (Kubernetes) |
| **Compute** (where containers run) | EC2 instances you manage, or AWS Fargate (serverless) |

ECS concepts:
- **Task definition**: the blueprint (images, CPU, memory, ports, environment, logging).
- **Task**: one running instance of a task definition (one or more containers).
- **Service**: keeps N tasks running, replaces failed ones, connects them to a load balancer, and scales them.
- **Cluster**: a logical group where tasks and services run.

Fargate CPU is measured in **CPU units**: 1024 units = 1 vCPU. The demo's task uses 256 units (0.25 vCPU) and 512 MiB.

### Containers and VMs together
In the cloud, containers almost always run **inside VMs**:
- ECS/EKS on EC2: containers run on EC2 instances, which are VMs.
- Fargate: each task gets its own isolated micro-VM.
- Your Mac: Docker runs inside the Colima Linux VM.

Containers give packaging and speed; VMs give the hard isolation boundary between customers.
