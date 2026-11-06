## How it works

### Where an instance lands
~~~text
run-instances --subnet-id subnet-default-ap-south-1-a
                             |
                             v  each subnet belongs to exactly one AZ
Region ap-south-1
  VPC (Regional, 172.31.0.0/16)
   +-- subnet 172.31.0.0/20   in ap-south-1a  <- instance lands here
   +-- subnet 172.31.16.0/20  in ap-south-1b
   +-- subnet 172.31.32.0/20  in ap-south-1c
~~~
If you don't give a subnet, AWS picks one (and so an AZ) for you. For production, you choose, usually through an Auto Scaling group listing a subnet in each AZ.

### Why EBS is stuck in its AZ
An EBS volume is replicated **inside one AZ** for durability and low latency. The instance reaches it over the AZ's storage network, so it must be in the same AZ.

~~~text
ap-south-1a                         ap-south-1b
[ama-l1-web-a]                      [ama-l1-web-b] ==== [vol ama-l1-data-b]   OK, same AZ
      \_________________ X ________________________/                          refused, other AZ

Moving data between AZs:
vol (1b) --create-snapshot--> snapshot (Regional) --create-volume --availability-zone ap-south-1a--> new vol (1a)
~~~

### Regional endpoints
Every Region has its own API endpoints (`ec2.ap-south-1.amazonaws.com`, `ec2.ap-south-2.amazonaws.com`…). The CLI's `--region` chooses the endpoint, and each endpoint only knows its own Region's resources. That's why a query against the wrong Region finds nothing.

### Capacity planning across AZs
With **N** AZs, to lose one and still serve full traffic you need about **N / (N − 1)** of your normal capacity:

| AZs | Capacity needed | Example: need 6 servers' worth |
|---|---|---|
| 2 | 2x (each AZ must carry everything) | 6 + 6 = 12 servers |
| 3 | 1.5x | 3 + 3 + 3 = 9 servers |
| 4 | 1.33x | 2 + 2 + 2 + 2 = 8 servers |

This is one reason three AZs is a popular choice.

### Moving things between Regions
Nothing moves automatically. Tools for copying: S3 Cross-Region Replication, DynamoDB global tables, `copy-snapshot` / `copy-image` for EBS snapshots and AMIs, RDS cross-Region read replicas, and AWS Backup copy rules.
