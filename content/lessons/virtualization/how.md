## How virtualization works

### Sharing the CPU
The hypervisor gives each VM **virtual CPUs (vCPUs)** and schedules them onto real CPU cores, many times per second. Modern processors have hardware support (Intel VT-x, AMD-V, Arm virtualization extensions) so guest code runs directly on the CPU at nearly full speed; the hypervisor steps in only for privileged operations.

On most x86 EC2 instances, **1 vCPU = 1 hardware thread** (half of a physical core with hyper-threading). On AWS Graviton (Arm) instances, **1 vCPU = 1 physical core**.

### Sharing memory
Each VM sees its own private address space. The hypervisor maps it to real memory and prevents one VM from reading another's. On EC2, the memory you're given is reserved for your instance.

### Sharing disks and network
VMs see virtual disks and virtual network cards. On AWS:
- **EBS volumes** appear as disks but live on a separate storage network.
- **Elastic network interfaces** connect the VM to your VPC.

On the Nitro System, dedicated **Nitro Cards** do this work in hardware, instead of the hypervisor doing it in software on the same CPUs your VM uses. That's a big reason Nitro instances perform close to bare metal.

### The AWS Nitro System
~~~text
+----------------------------------------------------------+
| Your EC2 instance (guest OS + apps)   | other customers' |
+----------------------------------------------------------+
| Nitro Hypervisor (thin, KVM-based): CPU and memory only   |
+----------------------------------------------------------+
| Host CPUs and RAM                                         |
+----------------------------------------------------------+
   | Nitro Card: VPC networking | Nitro Card: EBS storage |
   | Nitro Card: management     | Nitro Security Chip     |
~~~
- **Performance:** networking, storage and monitoring run on dedicated cards, not on your CPUs.
- **Security:** the Nitro Security Chip protects the host's firmware, and there's no mechanism for AWS staff to log in to a host and read customer memory.
- **Variety:** the same design supports VMs and bare-metal instances.

### Isolation options on EC2
| Option | Hardware shared with other AWS customers? | Use when |
|---|---|---|
| **Default (shared tenancy)** | Yes, with hypervisor isolation | Almost everything |
| **Dedicated Instances** | No, your instances run on hardware dedicated to your account | Compliance requires no shared hardware |
| **Dedicated Hosts** | No, a whole physical server you control placement on | Per-socket or per-core licences, host-level visibility |
| **Bare metal** (`*.metal`) | No hypervisor between you and the hardware | Run your own hypervisor, special hardware features |

### Your Mac does it too
Docker containers need a Linux kernel, and macOS isn't Linux. **Colima** solves that by starting a small Linux **virtual machine** using Apple's virtualization support. Your Mac is the host; the Ubuntu VM is the guest; Docker (and Floci) run inside the guest. You'll inspect it in the demo.
