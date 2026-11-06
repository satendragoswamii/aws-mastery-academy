## Spread servers across AZs and meet the EBS AZ rule

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-06. Floci runs each EC2 instance as a small container on your Mac, places it in the subnet's AZ, and enforces that EBS volumes attach only within their own AZ. It doesn't support EBS snapshots (see the end).

> Run every step in **one Terminal window**: later steps reuse `$WEB_A`, `$WEB_B` and `$VOL`. Each Floci instance uses some memory on your Mac, so always finish with the clean-up.

### Step 1: One default subnet per AZ
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-subnets --filters Name=default-for-az,Values=true \
  --query 'sort_by(Subnets,&AvailabilityZone)[].{AZ:AvailabilityZone,AZId:AvailabilityZoneId,Subnet:SubnetId,CIDR:CidrBlock}' --output table
~~~

~~~text
------------------------------------------------------------------------------
|                               DescribeSubnets                              |
+-------------+-----------+-----------------+--------------------------------+
|     AZ      |   AZId    |      CIDR       |            Subnet              |
+-------------+-----------+-----------------+--------------------------------+
|  ap-south-1a|  aps1-az1 |  172.31.0.0/20  |  subnet-default-ap-south-1-a   |
|  ap-south-1b|  aps1-az2 |  172.31.16.0/20 |  subnet-default-ap-south-1-b   |
|  ap-south-1c|  aps1-az3 |  172.31.32.0/20 |  subnet-default-ap-south-1-c   |
+-------------+-----------+-----------------+--------------------------------+
~~~

Three AZs, three subnets. Launching into a subnet decides the AZ.

### Step 2: Launch one web server in each of two AZs
~~~bash
WEB_A=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 run-instances --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro --subnet-id subnet-default-ap-south-1-a \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ama-l1-web-a}]' --query 'Instances[0].InstanceId' --output text)
WEB_B=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 run-instances --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro --subnet-id subnet-default-ap-south-1-b \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ama-l1-web-b}]' --query 'Instances[0].InstanceId' --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 wait instance-running --instance-ids $WEB_A $WEB_B
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-instances \
  --filters Name=tag:Name,Values=ama-l1-web-a,ama-l1-web-b Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].{Name:Tags[?Key==`Name`]|[0].Value,AZ:Placement.AvailabilityZone,IP:PrivateIpAddress,State:State.Name}' --output table
~~~

~~~text
------------------------------------------------------------
|                     DescribeInstances                    |
+-------------+----------------+----------------+----------+
|     AZ      |      IP        |     Name       |  State   |
+-------------+----------------+----------------+----------+
|  ap-south-1b|  10.240.16.19  |  ama-l1-web-b  |  running |
|  ap-south-1a|  10.240.0.20   |  ama-l1-web-a  |  running |
+-------------+----------------+----------------+----------+
~~~

`ec2 wait instance-running` pauses until both are running (it can take 20–30 seconds on Floci). If ap-south-1a failed now, `ama-l1-web-b` would keep serving. The `instance-state-name` filter hides terminated instances from earlier labs.

### Step 3: Create a data volume in ap-south-1b and attach it to the server in ap-south-1a
~~~bash
VOL=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-volume --availability-zone ap-south-1b \
  --size 8 --volume-type gp3 --tag-specifications 'ResourceType=volume,Tags=[{Key=Name,Value=ama-l1-data-b}]' \
  --query VolumeId --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 wait volume-available --volume-ids $VOL
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 attach-volume --volume-id $VOL --instance-id $WEB_A --device /dev/sdf
~~~

~~~text
aws: [ERROR]: An error occurred (InvalidParameterValue) when calling the AttachVolume operation: The volume 'vol-731280b23d11b3513' and instance 'i-1836fce0bdb7f330f' must be in the same Availability Zone
~~~

Refused: the volume is in **ap-south-1b**, the instance in **ap-south-1a**. An EBS volume is an AZ resource.

### Step 4: Attach it to the server in the same AZ
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 attach-volume --volume-id $VOL --instance-id $WEB_B --device /dev/sdf \
  --query '{Volume:VolumeId,Instance:InstanceId,State:State}' --output table
~~~

~~~text
---------------------------------------------------------------
|                        AttachVolume                         |
+----------------------+------------+-------------------------+
|       Instance       |   State    |         Volume          |
+----------------------+------------+-------------------------+
|  i-c1f19b8f99ba5c590 |  attaching |  vol-731280b23d11b3513  |
+----------------------+------------+-------------------------+
~~~

Same AZ, so it works.

### Step 5: Look for them in other Regions
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-2 ec2 describe-instances \
  --filters Name=tag:Name,Values=ama-l1-web-a,ama-l1-web-b Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].InstanceId' --output text
aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 describe-volumes --volume-ids $VOL
~~~

~~~text

aws: [ERROR]: An error occurred (InvalidVolume.NotFound) when calling the DescribeVolumes operation: The volume 'vol-731280b23d11b3513' does not exist.
~~~

Hyderabad finds no instances, and N. Virginia says the volume "does not exist". It does exist, in **ap-south-1**. Each Region is a separate world.

### Step 6: Clean up
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 detach-volume --volume-id $VOL --query State --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 wait volume-available --volume-ids $VOL
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-volume --volume-id $VOL
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 terminate-instances --instance-ids $WEB_A $WEB_B \
  --query 'TerminatingInstances[].[InstanceId,CurrentState.Name]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 wait instance-terminated --instance-ids $WEB_A $WEB_B && echo all-terminated
~~~

~~~text
detaching
i-1836fce0bdb7f330f	shutting-down
i-c1f19b8f99ba5c590	shutting-down
all-terminated
~~~

Terminated instances stay visible (as `terminated`) for a while, in real AWS too. That's why step 2 filters by state.

### Floci vs. real AWS
- **Error code:** real AWS refuses the cross-AZ attach with `InvalidVolume.ZoneMismatch`; Floci uses `InvalidParameterValue`. The rule is the same.
- **Snapshots:** `create-snapshot` returns `UnsupportedOperation` on Floci, so you can't practise the snapshot-and-restore move here. In real AWS: `create-snapshot`, then `create-volume --snapshot-id … --availability-zone ap-south-1a`.
- **IP addresses:** Floci gives instances addresses like `10.240.0.20` that aren't inside the subnet's `172.31.0.0/20` range. Real AWS always assigns an address from the subnet's CIDR.
- **Placement without a subnet:** Floci ignored `--placement AvailabilityZone=ap-south-1a` in our test and placed the instance in ap-south-1b. Real AWS honours it. Use `--subnet-id` as shown.
- **Real instances** take longer to boot and cost money per second while running.
