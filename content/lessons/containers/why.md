## Why containers took over

### "It works on my machine"
A developer's app runs perfectly on their laptop and fails on the server, because the server has a different Python version, a missing library or a different setting. Containers package **the exact environment** with the app, so what was tested is what runs.

### Faster and lighter than VMs
| | VM | Container |
|---|---|---|
| Start time | Tens of seconds to minutes | Under a second (0.18 s in the demo) |
| Size | Gigabytes | Megabytes (Alpine is ~13 MB) |
| Per host | Dozens | Hundreds |
| Includes an OS kernel | Yes | No (shares the host's) |

Faster starts mean faster scaling and faster deployments. Smaller images mean less storage and quicker downloads.

### Consistent from laptop to cloud
The same image moves through every stage:
~~~text
developer laptop  ->  build server (CI)  ->  test  ->  production (ECS / EKS)
       same image, same behaviour, at every step
~~~

### Microservices
Large applications are split into small services (orders, payments, search) that teams build and deploy independently. Each service is a container image, with its own version and its own scaling. Containers made this style practical.

### Why orchestration is needed
One container is easy. A thousand, across many machines, needs a manager that:
- places containers on machines with enough CPU and memory,
- restarts them when they crash,
- keeps the desired number running,
- connects them to load balancers,
- rolls out new versions gradually.

That's what **ECS** and **Kubernetes (EKS)** do, much like an Auto Scaling group does for EC2 instances.

### Why Fargate exists
With ECS or EKS on EC2, someone still has to choose, patch and scale the EC2 instances underneath. **Fargate** removes that: you say "run this task with 0.25 vCPU and 512 MiB", and AWS provides isolated compute for exactly that, billed per second.

## Why this matters for you
Most new applications on AWS are deployed as containers or serverless functions. CLF-C02 tests that you can match ECS, EKS, Fargate and ECR to their roles; associate-level exams go much deeper.
