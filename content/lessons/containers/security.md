## Security and best practices

### Shared responsibility for containers
| | ECS/EKS on EC2 | ECS/EKS on Fargate |
|---|---|---|
| Physical hosts, hypervisor | AWS | AWS |
| Host OS of the instances, container runtime | **You** (patch the EC2 instances) | AWS |
| Container images and their contents | **You** | **You** |
| Task permissions (IAM roles), network rules | **You** | **You** |
| Your application and data | **You** | **You** |

Fargate removes host management; **image security and permissions always stay with you.**

### Image security
1. **Use small, trusted base images** (official images, Alpine, distroless). Less software means fewer vulnerabilities.
2. **Scan images.** Amazon ECR can scan images for known vulnerabilities on push or continuously (with Amazon Inspector).
3. **Pin versions.** Use explicit tags or digests, not `latest`, so you know exactly what runs.
4. **Never bake secrets into images.** Anyone who can pull the image can read them. Pass secrets at runtime from AWS Secrets Manager or SSM Parameter Store.

### Runtime security
5. **Don't run as root** inside the container when you can avoid it (`USER` in the Dockerfile).
6. **Least-privilege task roles.** Each task gets an IAM role with only the permissions it needs, and separate roles for different services.
7. **Set CPU and memory limits** so one container can't starve others, as you did with `--memory` and `--cpus`.
8. **Read-only root filesystems** where possible make it harder for an attacker to modify the container.

### Isolation
Containers share a kernel, so a kernel vulnerability could in theory let a container escape. That's why:
- In multi-tenant cloud services, AWS isolates customers with **VMs** (Fargate micro-VMs, EC2 instances).
- On your own hosts, run untrusted workloads on separate hosts or in separate VMs.

### Lab safety
`--rm` meant every container you started was deleted on exit. You never stopped or modified the course's own containers.
