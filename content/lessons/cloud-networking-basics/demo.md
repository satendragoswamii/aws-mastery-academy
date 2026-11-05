## Build a shop network: VPC, public and private subnets, gateway, routes, firewall

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-05. Floci creates and validates VPCs, subnets, gateways, route tables and security groups (including real AWS errors for overlapping ranges), but no real packets flow through them. You're building the **design**; in real AWS the same design carries traffic.

> **Important habit:** every command includes `--endpoint-url http://localhost:4566`. Run every step in **the same Terminal window**: later steps reuse the variables (`$VPC`, `$PUBLIC`…) set by earlier ones.

### Step 1: Create the VPC

~~~bash
VPC=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-vpc --cidr-block 10.20.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=ama-l1-shop-vpc}]' --query Vpc.VpcId --output text)
echo $VPC
~~~

~~~text
vpc-cfc96a41
~~~

Your own private network, with 65,536 addresses from `10.20.0.0` to `10.20.255.255`.

### Step 2: Create two subnets in ap-south-1a

~~~bash
PUBLIC=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-subnet --vpc-id $VPC \
  --cidr-block 10.20.1.0/24 --availability-zone ap-south-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=ama-l1-public-a}]' --query Subnet.SubnetId --output text)
PRIVATE=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-subnet --vpc-id $VPC \
  --cidr-block 10.20.2.0/24 --availability-zone ap-south-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=ama-l1-private-a}]' --query Subnet.SubnetId --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-subnets --filters Name=vpc-id,Values=$VPC \
  --query 'Subnets[].[Tags[?Key==`Name`]|[0].Value,CidrBlock,AvailabilityZone,AvailableIpAddressCount]' --output table
~~~

~~~text
------------------------------------------------------------
|                      DescribeSubnets                     |
+------------------+----------------+---------------+------+
|  ama-l1-private-a|  10.20.2.0/24  |  ap-south-1a  |  251 |
|  ama-l1-public-a |  10.20.1.0/24  |  ap-south-1a  |  251 |
+------------------+----------------+---------------+------+
~~~

Each /24 has 256 addresses, but only **251** are available: AWS reserves 5 in every subnet. Right now **both** subnets are private. Names don't make a subnet public; routes do.

### Step 3: Try two classic mistakes
A subnet that overlaps an existing one:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-subnet --vpc-id $VPC --cidr-block 10.20.1.128/25
~~~

~~~text
aws: [ERROR]: An error occurred (InvalidSubnet.Conflict) when calling the CreateSubnet operation: The CIDR '10.20.1.128/25' conflicts with another subnet
~~~

A subnet outside the VPC's range:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-subnet --vpc-id $VPC --cidr-block 10.99.1.0/24
~~~

~~~text
aws: [ERROR]: An error occurred (InvalidSubnet.Range) when calling the CreateSubnet operation: The CIDR '10.99.1.0/24' is invalid.
~~~

Subnets must sit **inside** the VPC's range and must **not overlap** each other.

### Step 4: Add the main gate (internet gateway)

~~~bash
IGW=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-internet-gateway \
  --query InternetGateway.InternetGatewayId --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
echo $IGW
~~~

~~~text
igw-953cfc0a
~~~

The gateway is attached, but no subnet uses it yet.

### Step 5: Make the public subnet public
Create a route table, add "everything else → internet gateway", and associate it with the public subnet only:

~~~bash
RT=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-route-table --vpc-id $VPC \
  --query RouteTable.RouteTableId --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-route --route-table-id $RT \
  --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW --query Return --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 associate-route-table --route-table-id $RT \
  --subnet-id $PUBLIC --query AssociationState.State --output text
~~~

~~~text
True
associated
~~~

### Step 6: Compare the two route tables

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC \
  --query 'RouteTables[].[RouteTableId,Associations[0].Main,join(`, `,Routes[].join(` -> `,[DestinationCidrBlock,GatewayId]))]' \
  --output table
~~~

~~~text
--------------------------------------------------------------------------------------
|                                 DescribeRouteTables                                |
+------------------------+--------+--------------------------------------------------+
|  rtb-d3ba643b          |  False |  10.20.0.0/16-> local, 0.0.0.0/0-> igw-953cfc0a  |
|  rtb-6484d7ea0ac64305e |  True  |  10.20.0.0/16-> local                            |
+------------------------+--------+--------------------------------------------------+
~~~

- **Your route table** (used by the public subnet): VPC traffic stays local; everything else goes to the internet gateway. → **public**.
- **The main route table** (`True`), created automatically with the VPC and used by the private subnet: only the local route. → **private**: no path to or from the internet.

### Step 7: A firewall for web servers

~~~bash
SG=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-security-group --group-name ama-l1-web-sg \
  --description "Web servers: HTTPS from anywhere" --vpc-id $VPC --query GroupId --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 authorize-security-group-ingress --group-id $SG \
  --protocol tcp --port 443 --cidr 0.0.0.0/0 --query 'SecurityGroupRules[0].[IpProtocol,FromPort,ToPort,CidrIpv4]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-security-groups --group-ids $SG \
  --query 'SecurityGroups[0].{Inbound:IpPermissions[].[IpProtocol,FromPort,IpRanges[0].CidrIp],Outbound:IpPermissionsEgress[].[IpProtocol,IpRanges[0].CidrIp]}' \
  --output json
~~~

~~~text
tcp	443	443	0.0.0.0/0
{
    "Inbound": [
        [
            "tcp",
            443,
            "0.0.0.0/0"
        ]
    ],
    "Outbound": [
        [
            "-1",
            "0.0.0.0/0"
        ]
    ]
}
~~~

- **Inbound:** only HTTPS (TCP port 443), from anywhere. Everything else is blocked by default.
- **Outbound:** everything allowed (`-1` means all protocols). AWS adds this rule automatically.
- Because security groups are **stateful**, replies to allowed requests flow back automatically.

### Step 8: Clean up, in the right order
First, see what happens if you delete the VPC straight away:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-vpc --vpc-id $VPC
~~~

~~~text
aws: [ERROR]: An error occurred (DependencyViolation) when calling the DeleteVpc operation: The vpc 'vpc-cfc96a41' has dependencies and cannot be deleted.
~~~

Delete in **reverse order** instead:

~~~bash
ASSOC=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-route-tables --route-table-ids $RT \
  --query 'RouteTables[0].Associations[?!Main].RouteTableAssociationId' --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 disassociate-route-table --association-id $ASSOC
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-route-table --route-table-id $RT
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-security-group --group-id $SG
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-subnet --subnet-id $PUBLIC
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-subnet --subnet-id $PRIVATE
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-internet-gateway --internet-gateway-id $IGW
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-vpc --vpc-id $VPC
~~~

The only output is from `delete-security-group`:

~~~text
{
    "Return": true
}
~~~

Check that it's gone (prints nothing):

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-vpcs \
  --filters Name=tag:Name,Values=ama-l1-shop-vpc --query 'Vpcs[].VpcId' --output text
~~~

> **Never delete `vpc-default-ap-south-1` or `igw-default`.** They're Floci's default network, used by other labs.

### Floci vs. real AWS
- **No traffic:** Floci stores the network design but doesn't route packets. In real AWS, an instance in the public subnet with a public IP and this security group would be reachable on port 443.
- **IDs:** real VPC, subnet and gateway IDs are longer (e.g. `vpc-0a1b2c3d4e5f67890`).
- **Errors and reserved addresses** matched real AWS behaviour in this run.
