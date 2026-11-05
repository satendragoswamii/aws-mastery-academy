## Where virtualization sits in AWS, and on your Mac

### One EC2 host
~~~text
 physical host in an AZ (e.g. ap-south-1a)
+-----------------------------------------------------------------+
|  [ customer A: m5.large ]  [ customer B: m5.xlarge ]  [ you:    |
|   2 vCPU / 8 GiB             4 vCPU / 16 GiB            m5.large]|
|-----------------------------------------------------------------|
|  Nitro Hypervisor                                               |
|-----------------------------------------------------------------|
|  physical CPUs + RAM                 Nitro Cards (VPC, EBS)     |
+-----------------------------------------------------------------+
     ^ AWS's responsibility: the box, the hypervisor, the cards
     ^ your responsibility: everything inside "you: m5.large"
~~~

Instance sizes inside a family are slices of the same kind of host: in the M5 family each step up (large → xlarge → 2xlarge) doubles vCPUs and memory.

### Your lab, layer by layer
~~~text
+-----------------------------------------------------------+
| macOS on Apple silicon (host): 10 CPUs, 16 GiB            |
|   Terminal, AWS CLI, the academy app (Next.js)            |
|                                                           |
|   +---------------------------------------------------+   |
|   | Colima VM (guest): Ubuntu Linux, 2 vCPU, 4 GiB     |   |
|   |   Docker engine                                    |   |
|   |     container: floci        (port 4566)            |   |
|   |     container: ama-postgres (port 5433)            |   |
|   +---------------------------------------------------+   |
+-----------------------------------------------------------+
~~~

When you run `aws --endpoint-url http://localhost:4566 …`, the request goes from macOS into the VM, into the Floci container, and back. Two layers of isolation, on one laptop.

### VM vs. container (preview of the next lesson)
| | Virtual machine | Container |
|---|---|---|
| Includes | Whole guest OS with its own kernel | App + libraries; shares the host's kernel |
| Starts in | Tens of seconds | About a second |
| Size | Gigabytes | Megabytes to hundreds of MB |
| Isolation | Strong (hardware-assisted) | Good, but weaker (shared kernel) |
| AWS examples | EC2 | ECS, EKS, Fargate (which runs each task in its own micro-VM) |
