## The simple version

**Virtualization lets one real computer pretend to be many separate computers.**

Think of a big apartment building. One building, one plot of land, one water connection, but it's divided into many flats. Each family has its own locked door, its own kitchen, its own furniture, and doesn't see into the others' homes. The building manager decides how big each flat is and keeps everyone separate.

In computing:
- The **building** is a powerful physical server (the **host**).
- Each **flat** is a **virtual machine (VM)**: it has its own operating system and programs and believes it's a whole computer.
- The **building manager** is the **hypervisor**: software that shares out CPU, memory, disk and network, and keeps VMs apart.

When you launch an EC2 instance, you're renting one of those flats.

## The professional version

**Virtualization** abstracts physical hardware so that multiple isolated **virtual machines** can run on it concurrently, each with its own **guest operating system**.

~~~text
+-----------+ +-----------+ +-----------+
|   VM 1    | |   VM 2    | |   VM 3    |   guests: each has its own OS,
|  Linux    | |  Windows  | |  Linux    |   apps, and virtual CPU/memory/disk/NIC
+-----------+ +-----------+ +-----------+
+---------------------------------------+
|              HYPERVISOR               |   allocates, schedules, isolates
+---------------------------------------+
+---------------------------------------+
|  PHYSICAL HOST: CPUs, RAM, disks, NIC |
+---------------------------------------+
~~~

Two kinds of hypervisor:

| | Type 1 ("bare metal") | Type 2 ("hosted") |
|---|---|---|
| Runs on | Directly on the hardware | On top of a normal OS (macOS, Windows) |
| Used for | Data centres and clouds | Laptops and desktops |
| Examples | AWS Nitro Hypervisor (KVM-based), VMware ESXi, Microsoft Hyper-V | VirtualBox, VMware Fusion, the VM Colima starts on your Mac |

AWS runs EC2 on the **Nitro System**: custom hardware cards that handle networking, storage and management, plus a very thin hypervisor. That leaves almost all of the host's power for customer VMs and keeps AWS operators away from customer memory.

> **Key idea:** virtualization turns hardware into **software-defined, shareable, disposable** resources. Every cloud characteristic you've learned (pooling, self-service, elasticity) is built on it.
