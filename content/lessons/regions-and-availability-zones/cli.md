## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws ec2 describe-subnets --filters Name=default-for-az,Values=true` | Lists the default subnet in each AZ |
| `aws ec2 run-instances --subnet-id … --tag-specifications …` | Launches an instance into a subnet (and so an AZ) |
| `aws ec2 wait instance-running --instance-ids …` | Waits until instances are running |
| `aws ec2 describe-instances --filters Name=instance-state-name,Values=running` | Lists only running instances |
| `aws ec2 create-volume --availability-zone … --size 8 --volume-type gp3` | Creates an EBS volume in an AZ |
| `aws ec2 wait volume-available --volume-ids …` | Waits until a volume is ready |
| `aws ec2 attach-volume --volume-id … --instance-id … --device /dev/sdf` | Attaches a volume (same AZ only) |
| `aws ec2 detach-volume --volume-id …` | Detaches it |
| `aws ec2 delete-volume --volume-id …` | Deletes it |
| `aws ec2 terminate-instances --instance-ids …` | Terminates instances |
| `aws ec2 create-snapshot --volume-id …` | Snapshots a volume (real AWS; not on Floci) |
| `aws ec2 create-volume --snapshot-id … --availability-zone …` | Restores a snapshot into any AZ (real AWS) |

### `wait` commands
`aws ec2 wait …` polls until a state is reached (or times out after a few minutes). They make scripts reliable: no guessing with `sleep`.

### Try it yourself
1. Launch `ama-l1-web-c` into `subnet-default-ap-south-1-c`, then list all three running servers with their AZs. Terminate all of them.
2. Create a volume in ap-south-1a and attach it to an instance in ap-south-1a. Then detach it and try attaching it to an instance in ap-south-1c. Read the error. Clean up.
3. Which Region does `aws ec2 describe-instances` use if you leave out `--region`? Check with `aws configure get region`.
