## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws ec2 create-vpc --cidr-block 10.20.0.0/16` | Creates a VPC |
| `aws ec2 describe-vpcs` | Lists VPCs (including the default one) |
| `aws ec2 create-subnet --vpc-id … --cidr-block … --availability-zone …` | Creates a subnet in one AZ |
| `aws ec2 describe-subnets --filters Name=vpc-id,Values=…` | Lists a VPC's subnets with free addresses |
| `aws ec2 create-internet-gateway` / `attach-internet-gateway` | Creates and attaches the VPC's door to the internet |
| `aws ec2 create-route-table --vpc-id …` | Creates a route table |
| `aws ec2 create-route --route-table-id … --destination-cidr-block 0.0.0.0/0 --gateway-id igw-…` | Adds a route |
| `aws ec2 associate-route-table --route-table-id … --subnet-id …` | Makes a subnet use that route table |
| `aws ec2 create-security-group --group-name … --description … --vpc-id …` | Creates a security group |
| `aws ec2 authorize-security-group-ingress --group-id … --protocol tcp --port 443 --cidr …` | Adds an inbound allow rule |
| `aws ec2 authorize-security-group-ingress … --source-group sg-…` | Allows traffic from another security group |
| `aws ec2 revoke-security-group-ingress …` | Removes a rule |
| `aws ec2 describe-network-acls --filters Name=vpc-id,Values=…` | Shows the subnet-level ACLs |

### Common ports
| Port | Protocol | Used by |
|---|---|---|
| 22 | SSH | Linux remote login |
| 80 / 443 | HTTP / HTTPS | Websites and APIs |
| 3389 | RDP | Windows remote desktop |
| 3306 / 5432 | MySQL / PostgreSQL | Databases |
| 6379 | Redis | Caches |

### Try it yourself
Allow the database port **only from the web servers' security group**, not from addresses. Create a second group `ama-l1-db-sg` in the same VPC first (same pattern as step 7), then:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 authorize-security-group-ingress \
  --group-id $DB_SG --protocol tcp --port 5432 --source-group $SG
~~~

Describe the DB group and find the `UserIdGroupPairs` entry pointing at the web group. Clean up both groups before deleting the VPC.

### Quick CIDR maths
Addresses in a block = 2^(32 − prefix). /16 → 65,536; /20 → 4,096; /24 → 256; /28 → 16 (the smallest AWS subnet, 11 usable).
