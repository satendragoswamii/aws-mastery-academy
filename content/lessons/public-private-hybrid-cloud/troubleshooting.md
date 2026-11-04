## Troubleshooting

### Lab problems
| Symptom | Likely cause | Fix |
|---|---|---|
| `The user-provided path ama-office does not exist.` | You're not in your home folder | `cd ~` first, or use the full path `~/ama-office` |
| `sync` uploads nothing | Everything is already up to date (normal), or your `--exclude` matched too much | Run with `--dryrun` and check your patterns |
| `sync` uploads everything every time | Timestamps changed (e.g. files were re-copied) | Normal after a copy. `--size-only` can help, carefully |
| Backup lost a file that was deleted locally | `--delete` was used | Never use `--delete` for backups; enable S3 Versioning in real AWS (later lesson) |
| `BucketNotEmpty` on `s3 rb` | Bucket still has objects | `s3 rb --force` for lab buckets, or `s3 rm --recursive` first |
| `IllegalLocationConstraintException` on create | No `LocationConstraint` outside us-east-1 | Add `--create-bucket-configuration LocationConstraint=ap-south-1` |
| `Could not connect to the endpoint URL` | Floci isn't running | `docker ps --filter name=floci`; `docker start floci` |

### Real hybrid problems
| Symptom | Common cause | Where to look |
|---|---|---|
| On-prem servers can't reach AWS resources | VPN tunnel down, routes missing, overlapping IP ranges | VPN tunnel status, route tables, IP address plans |
| Hybrid traffic is slow or unpredictable | Traffic crossing the public internet | Consider Direct Connect for steady, heavy traffic |
| Users have two passwords | Identity not federated | IAM Identity Center with the corporate directory |
| Backups "succeed" but restore fails | Restores never tested | Schedule regular restore tests |
| Cloud bill jumped after hybrid go-live | Data transfer **out** of AWS charges | Check data-transfer costs; data coming **in** to AWS is generally free |

The first network problem has a classic root cause: **both sides use the same private IP range** (for example 10.0.0.0/16 on-prem and in the VPC). Routers can't tell them apart. Plan IP ranges before you connect, as you'll learn in the networking lessons.
