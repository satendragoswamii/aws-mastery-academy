## Troubleshooting

### Lab problems
| Symptom | Cause | Fix |
|---|---|---|
| `Cannot connect to the Docker daemon` | The Colima VM (or Docker Desktop) isn't running | `colima list` to check; in this course, ask before starting it |
| `Unable to find image 'xyz' locally` followed by a download | Image not on your Mac | Press Ctrl+C if you didn't mean to download; use `alpine:3.21` |
| `ClusterNotFoundException … Cluster not found: ama-l1-cluster` | Cluster deleted, misspelled, or in another Region | `aws ecs list-clusters` in the same `--region` |
| Task stays `PROVISIONING` or `PENDING` | Floci is still starting the container | Wait and describe again |
| Task `STOPPED` with a non-zero exit code | The container's command failed | Check the command; in real AWS, read the logs in CloudWatch |
| `Backing registry unreachable` from ECR | Floci's registry container isn't reachable from Floci in this setup | Don't use ECR in this course's labs |
| `$TASK` is empty | `run-task` failed, or the variable is from another window | Run the step again in the same window |

### Real-world container problems
| Symptom | Likely cause | Fix |
|---|---|---|
| `CannotPullContainerError` | Wrong image name/tag, no permission to ECR, or no network route to the registry | Check the image URI, the task execution role, and NAT or VPC endpoints |
| Task stops with exit code 137 | Killed for exceeding its memory limit (out of memory) | Raise the task's memory, or fix the leak |
| `OutOfMemoryError: Container killed due to memory usage` | Same | Same |
| Service keeps replacing tasks | Load-balancer health checks failing | Check the health check path and the app's startup time (health check grace period) |
| Works locally, fails on Fargate | Image built for Arm on a Mac, running on x86 Fargate (or the reverse) | Build multi-architecture images, or set the task's runtime platform |
| Data lost after a deployment | Data written inside the container | Use RDS, DynamoDB, S3 or EFS |

The architecture trap is common for Mac users: Apple silicon builds **arm64** images by default. Fargate supports both x86_64 and ARM64, but the task definition must match the image.
