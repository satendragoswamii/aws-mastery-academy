## Order a server: the old way versus the cloud way

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-04. Floci simulates EC2's API (instances get IDs, IPs and states), but it doesn't boot a real operating system you can log into. That's fine here: this demo is about **how long it takes to get a server**.

### Part 1: The old way (a thought experiment)
Write down your answers before you read on:

1. Your manager asks for one new server for a project. Who do you need approval from?
2. How long will the vendor take to deliver?
3. Who installs it in the rack, cables it and installs the OS?
4. What happens to it if the project is cancelled after a month?

Typical answers: a manager and finance; 2–6 weeks; your infrastructure team (another 1–2 weeks); it stays in the rack, already paid for. **Total: 6–12 weeks and a large purchase.**

### Part 2: The cloud way

> **Important habit:** every command includes `--endpoint-url http://localhost:4566` so it goes to **Floci on your Mac**, never real AWS.

#### Step 1: Look at the "catalogue"
On-prem you'd read a vendor brochure. In AWS you ask the API what a server type offers:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 describe-instance-types \
  --instance-types t3.micro \
  --query 'InstanceTypes[0].{Type:InstanceType,vCPUs:VCpuInfo.DefaultVCpus,MemoryMiB:MemoryInfo.SizeInMiB}' \
  --output table
~~~

Expected output:

~~~text
------------------------------------
|       DescribeInstanceTypes      |
+-----------+------------+---------+
| MemoryMiB |   Type     |  vCPUs  |
+-----------+------------+---------+
|  1024     |  t3.micro  |  2      |
+-----------+------------+---------+
~~~

A `t3.micro` is a small virtual server: 2 virtual CPUs and 1 GiB of memory.

#### Step 2: "Order" the server, and time it
`time` in front of a command tells you how long it took.

~~~bash
time aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 run-instances \
  --image-id ami-0abcdef1234567891 \
  --instance-type t3.micro \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ama-l1-my-server}]' \
  --query 'Instances[0].{Id:InstanceId,Type:InstanceType,State:State.Name,PrivateIp:PrivateIpAddress}' \
  --output table
~~~

Expected output (your ID, IP and timing will differ):

~~~text
----------------------------------------------------------------
|                         RunInstances                         |
+----------------------+----------------+----------+-----------+
|          Id          |   PrivateIp    |  State   |   Type    |
+----------------------+----------------+----------+-----------+
|  i-5ee1856a018b1a036 |  172.31.32.11  |  pending |  t3.micro |
+----------------------+----------------+----------+-----------+
aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 run-instances  0.47s user 0.12s system 97% cpu 0.606 total
~~~

**0.6 seconds**, compared with 6–12 weeks. No purchase order, no delivery, no racking. The `--image-id` chose the operating system image (here Amazon Linux 2023), and the tag gave it a name.

> **Floci note:** the very first EC2 launch on a fresh Floci can stay in `pending` for a while, because Floci starts a small helper container (`floci-aws-ec2-volume-helper`) behind the scenes. Run step 3 again after a few seconds.

#### Step 3: Check it's running

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 describe-instances \
  --filters Name=tag:Name,Values=ama-l1-my-server \
  --query 'Reservations[].Instances[].[InstanceId,State.Name]' --output text
~~~

Expected output:

~~~text
i-5ee1856a018b1a036	running
~~~

#### Step 4: Give it back
This is the step on-prem can't do. If the project is cancelled, you return the server and **stop paying**. Use your own instance ID:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 terminate-instances \
  --instance-ids i-5ee1856a018b1a036 --output table \
  --query 'TerminatingInstances[0].{Id:InstanceId,Before:PreviousState.Name,Now:CurrentState.Name}'
~~~

Expected output:

~~~text
-----------------------------------------------------
|                TerminateInstances                 |
+---------+-----------------------+-----------------+
| Before  |          Id           |       Now       |
+---------+-----------------------+-----------------+
|  running|  i-5ee1856a018b1a036  |  shutting-down  |
+---------+-----------------------+-----------------+
~~~

Run step 3 again after a few seconds and the state shows `terminated`.

### What you just felt
| | On-prem | What you did |
|---|---|---|
| Time to get a server | 6–12 weeks | 0.6 seconds |
| Up-front payment | Large | None (real AWS bills per second while it runs) |
| Cancelling | You keep the hardware | `terminate-instances`, billing stops |
| Who installs it | Your team | AWS |

### Floci vs. real AWS
- In real AWS the instance boots a real Linux machine you could connect to, and you're billed per second (t3.micro is Free Tier eligible for new accounts, within limits). Floci simulates the API and state changes only; we didn't test logging in, which belongs to the EC2 lesson.
- The image ID `ami-0abcdef1234567891` exists only in Floci. Real AMI IDs differ by Region and change over time; real lessons look them up with `describe-images` or SSM parameters.
