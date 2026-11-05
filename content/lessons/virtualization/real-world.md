## In the real world

### Data-centre consolidation
In the 2000s and 2010s, companies virtualised their server rooms with tools like VMware: 200 physical servers became 20 hosts running 200 VMs. Power, space and hardware costs dropped dramatically. Many on-premises "private clouds" today are exactly this.

### Moving those VMs to AWS
Because applications already run in VMs, migrating to EC2 is often **lift-and-shift**: tools such as AWS Application Migration Service replicate the VM's disks and launch it as an EC2 instance. Some companies run VMware itself on AWS-hosted dedicated infrastructure to move faster.

### Choosing instance shapes
A team running a database chooses a **memory-optimised** family (R); a video-encoding team chooses **compute-optimised** (C); a web app uses **general purpose** (M or T). They're all VMs; only the share of CPU, memory and other resources differs. AWS **Graviton** (Arm-based) instances often give better price-performance, if the software runs on Arm. Your Mac's Apple silicon is Arm too, which is why the Colima VM reports `aarch64`.

### Licensing surprises
A company moved a commercial database to small EC2 instances, then learned its licence counted **physical** cores on the host. It moved to **Dedicated Hosts**, where it could see and control sockets and cores, and stayed compliant.

### Security research
Researchers occasionally find CPU-level flaws (such as Spectre and Meltdown in 2018) that could, in theory, let one VM read another's data on the same host. Cloud providers patch hypervisors and hosts quickly, often without customer action. This is the provider's side of the shared responsibility model working as intended. Customers still had to patch their **guest** operating systems.

### On the job
You'll choose instance families and sizes, interpret vCPU and memory figures, decide when dedicated tenancy is required, and explain to auditors why hypervisor security is AWS's responsibility.
