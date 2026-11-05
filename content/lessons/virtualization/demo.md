## Meet a real virtual machine, then rent some in the cloud

**Lab tier: 🟡 Partially supported in Floci.** Part A uses **your own Mac** (read-only commands, verified 2026-11-05). Part B was run against Floci 2.4.0 on 2026-11-05; Floci records instance types, architectures and tenancy, but doesn't boot real VMs.

### Part A: The virtual machine already on your Mac
Docker needs Linux, so Colima runs a Linux **virtual machine** on your Mac. Let's compare host and guest. None of these commands change anything.

#### Step 1: The host (your Mac)

~~~bash
uname -sm
sysctl -n hw.ncpu
sysctl -n hw.memsize | awk '{printf "%.0f GiB\n",$1/1073741824}'
~~~

Output on the course Mac (yours may differ):

~~~text
Darwin arm64
10
16 GiB
~~~

`Darwin` is macOS's kernel; `arm64` is Apple silicon; 10 CPUs; 16 GiB of memory.

#### Step 2: The guest (the Colima VM)

~~~bash
colima list
~~~

~~~text
PROFILE    STATUS     ARCH       CPUS    MEMORY    DISK      RUNTIME    ADDRESS
default    Running    aarch64    2       4GiB      100GiB    docker
~~~

Ask Docker which operating system it's running on:

~~~bash
docker info --format 'Server OS: {{.OperatingSystem}} | Kernel: {{.KernelVersion}} | CPUs: {{.NCPU}} | Mem: {{.MemTotal}}'
~~~

~~~text
Server OS: Ubuntu 24.04.4 LTS | Kernel: 6.8.0-117-generic | CPUs: 2 | Mem: 4095574016
~~~

And run a command **inside** the VM:

~~~bash
colima ssh -- uname -sm
~~~

~~~text
Linux aarch64
~~~

#### What you just saw
| | Host (your Mac) | Guest (Colima VM) |
|---|---|---|
| Operating system | macOS (Darwin) | Ubuntu Linux |
| CPUs | 10 | 2 |
| Memory | 16 GiB | 4 GiB (4,095,574,016 bytes) |

One physical computer is running a second, complete computer with a **different operating system**, limited to the share of CPU and memory it was given. That's virtualization. Floci and your Postgres database run inside that guest.

> If you use Docker Desktop instead of Colima, `colima` commands won't exist, but `docker info` still shows the Linux VM that Docker Desktop runs for you.

### Part B: Renting VMs in the cloud (Floci)

> **Important habit:** every AWS command includes `--endpoint-url http://localhost:4566`.

#### Step 3: Browse VM shapes

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-instance-types \
  --instance-types t3.nano t3.micro t3.small t3.medium m5.large \
  --query 'sort_by(InstanceTypes,&MemoryInfo.SizeInMiB)[].[InstanceType,VCpuInfo.DefaultVCpus,MemoryInfo.SizeInMiB,ProcessorInfo.SupportedArchitectures[0]]' \
  --output table
~~~

~~~text
--------------------------------------
|        DescribeInstanceTypes       |
+------------+----+-------+----------+
|  t3.nano   |  2 |  512  |  x86_64  |
|  t3.micro  |  2 |  1024 |  x86_64  |
|  t3.small  |  2 |  2048 |  x86_64  |
|  t3.medium |  2 |  4096 |  x86_64  |
|  m5.large  |  2 |  8192 |  x86_64  |
+------------+----+-------+----------+
~~~

Each row is a different-sized "flat" on a physical host: vCPUs, memory in MiB, and processor architecture.

#### Step 4: Launch three different VMs
An Intel/AMD (x86) VM, an Arm (Graviton) VM, and one on **dedicated** hardware:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 run-instances \
  --image-id ami-0abcdef1234567891 --instance-type t3.micro \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ama-l1-vm-x86}]' \
  --query 'Instances[0].[InstanceId,InstanceType,Architecture,Placement.Tenancy]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 run-instances \
  --image-id ami-amazonlinux2023-arm64 --instance-type t4g.micro \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ama-l1-vm-arm}]' \
  --query 'Instances[0].[InstanceId,InstanceType,Architecture,Placement.Tenancy]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 run-instances \
  --image-id ami-0abcdef1234567891 --instance-type m5.large --placement Tenancy=dedicated \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ama-l1-vm-dedicated}]' \
  --query 'Instances[0].[InstanceId,InstanceType,Architecture,Placement.Tenancy]' --output text
~~~

Expected output (your IDs will differ):

~~~text
i-6ff751dc918b20a8e	t3.micro	x86_64	default
i-d8837b1eff1d658c6	t4g.micro	arm64	default
i-a8b175c3a66f9d2a2	m5.large	x86_64	dedicated
~~~

- `default` tenancy: your VM may share a physical host with other customers' VMs, separated by the hypervisor.
- `dedicated` tenancy: the host runs only **your** account's instances (at extra cost in real AWS).

#### Step 5: See them together

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-instances \
  --filters 'Name=tag:Name,Values=ama-l1-vm-*' \
  --query 'Reservations[].Instances[].[Tags[?Key==`Name`]|[0].Value,InstanceType,Architecture,Placement.Tenancy,State.Name]' \
  --output table
~~~

~~~text
------------------------------------------------------------------------
|                           DescribeInstances                          |
+----------------------+------------+---------+------------+-----------+
|  ama-l1-vm-dedicated |  m5.large  |  x86_64 |  dedicated |  running  |
|  ama-l1-vm-x86       |  t3.micro  |  x86_64 |  default   |  running  |
|  ama-l1-vm-arm       |  t4g.micro |  arm64  |  default   |  pending  |
+----------------------+------------+---------+------------+-----------+
~~~

(Order and states may differ; describe again after a few seconds.)

#### Step 6: The image must match the processor
Try to run the **Arm** image on an **x86** instance type:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 run-instances \
  --image-id ami-amazonlinux2023-arm64 --instance-type t3.micro \
  --query 'Instances[0].InstanceId' --output text
~~~

~~~text
aws: [ERROR]: An error occurred (InvalidParameterValue) when calling the RunInstances operation: The architecture 'arm64' of the specified image does not match the architecture supported by instance type 't3.micro'.
~~~

A VM's operating system is compiled for one processor architecture. Your Mac's Colima VM is `aarch64` (Arm) for the same reason: it has to match Apple silicon.

#### Step 7: Clean up

~~~bash
IDS=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-instances \
  --filters 'Name=tag:Name,Values=ama-l1-vm-*' 'Name=instance-state-name,Values=pending,running' \
  --query 'Reservations[].Instances[].InstanceId' --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 terminate-instances --instance-ids ${=IDS} \
  --query 'TerminatingInstances[].CurrentState.Name' --output text
~~~

~~~text
shutting-down	shutting-down	shutting-down
~~~

`${=IDS}` splits the list into separate IDs in zsh (macOS's default shell). In bash, write `$IDS`.

### Floci vs. real AWS
- **Instance catalogue:** Floci knows about 24 instance types and doesn't fill in fields such as `Hypervisor`, `BareMetal`, cores or threads per core. Real AWS has hundreds of types with full details (e.g. `"Hypervisor": "nitro"`).
- **Tenancy:** Floci records `dedicated`, but there's no real hardware behind it, and no extra charge. In real AWS, dedicated tenancy costs more.
- **Booting:** Floci's VMs don't run an operating system. Part A is where you saw a real VM.
