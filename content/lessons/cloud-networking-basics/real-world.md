## In the real world

### The database that was on the internet
A recurring incident: a team "temporarily" puts a database in a public subnet with a security group open to `0.0.0.0/0` to debug something, and forgets. Automated scanners find open database ports within hours. The fix and the lesson: databases go in **private** subnets, with security groups that allow only the application tier.

### The overlapping networks
Two companies merge. Both used `10.0.0.0/16` for their main VPCs. Connecting them requires renumbering one network or complex NAT, months of work. Large organisations now use central **IP address management** (Amazon VPC IPAM can help) to hand out non-overlapping ranges.

### The surprise NAT bill
A team's private instances download large datasets from the internet through a NAT gateway, which charges per GB processed. Moving the downloads to S3 and using a free **gateway VPC endpoint** cut the bill sharply. Network design affects cost too.

### Default VPC vs. custom VPC
Every Region in a new account has a **default VPC** (`172.31.0.0/16`, a public subnet in each AZ). It's convenient for learning, but production teams create **custom VPCs** with deliberate public/private subnets and IP plans. Floci has a default VPC too (`vpc-default-ap-south-1`), which you used in earlier lessons.

### On the job
You'll design VPC layouts and IP plans, write security group rules by reference, troubleshoot "can't connect" problems by walking the path (route table → NACL → security group → OS firewall → application), and connect VPCs to each other and to on-premises networks.
