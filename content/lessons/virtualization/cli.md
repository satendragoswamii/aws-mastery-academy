## Commands in this lesson

### On your Mac (read-only)
| Command | What it shows |
|---|---|
| `uname -sm` | Kernel name and processor architecture of the machine you're on |
| `sysctl -n hw.ncpu` / `hw.memsize` | macOS CPU count and memory in bytes |
| `colima list` | Colima VMs with their CPUs, memory and disk |
| `docker info` | The Docker engine, including the OS and kernel of the VM it runs in |
| `colima ssh -- <command>` | Runs one command inside the Colima VM |

### AWS CLI
| Command | What it does |
|---|---|
| `aws ec2 describe-instance-types --instance-types …` | Shows VM shapes: vCPUs, memory, architecture (and in real AWS: hypervisor, network, storage) |
| `aws ec2 describe-instance-types --filters Name=processor-info.supported-architecture,Values=arm64` | Finds Arm (Graviton) types |
| `aws ec2 run-instances … --placement Tenancy=dedicated` | Launches on hardware dedicated to your account |
| `aws ec2 describe-instances --query '…Architecture, Placement.Tenancy…'` | Shows architecture and tenancy of your instances |

### Reading instance type names
~~~text
   m  5  g  d  .  2xlarge
   |  |  |  |     |
   |  |  |  |     +-- size: nano, micro, small, medium, large, xlarge, 2xlarge ... metal
   |  |  |  +-------- extra capability: d = local NVMe disk, n = more network, ...
   |  |  +----------- processor: g = AWS Graviton (Arm), a = AMD, i = Intel
   |  +-------------- generation (higher = newer)
   +----------------- family: t burstable, m general, c compute, r memory, i storage, g/p GPU
~~~

### Try it yourself
List the Arm instance types Floci knows about. Floci 2.4.0 **ignores** the `--filters` option above and returns every type, so filter on your side with `--query` instead (this works on real AWS too):

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-instance-types \
  --query 'InstanceTypes[?contains(ProcessorInfo.SupportedArchitectures, `arm64`)].InstanceType' --output text
~~~

Output on Floci:

~~~text
t4g.micro	t4g.small	t4g.medium	m6g.large	m6gd.large	m6gd.2xlarge	m7gd.large	m7gd.2xlarge	m8gd.medium	m8gd.large	m8gd.2xlarge
~~~

Compare the list with the naming guide: they all have a `g` (Graviton).

`--filters` is applied by AWS on the server; `--query` is applied by the CLI on your computer after the response arrives. On large real-world lists, server-side filters are faster, so use them on real AWS.
