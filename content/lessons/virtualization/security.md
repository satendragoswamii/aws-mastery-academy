## Security and best practices

### Where the line is drawn
~~~text
 YOU      guest OS, patches, users, firewall in the OS, apps, data, security groups, IAM
--------------------------------------------------------------- (the shared responsibility line)
 AWS      hypervisor, host OS and firmware, Nitro cards, physical hosts, data centres
~~~
The hypervisor is **AWS's** responsibility. The **guest operating system** inside your instance is **yours**: patching, hardening, user accounts, logs.

### Why hypervisor isolation can be trusted
- Hardware-assisted virtualization separates each VM's memory and CPU state.
- The Nitro System offloads I/O to dedicated cards and has **no mechanism for operators to log in** to hosts and access customer memory.
- When CPU-level flaws are discovered, AWS patches hosts and hypervisors centrally.

### When sharing hardware isn't allowed
Some regulations or contracts require that your workloads never share a physical machine with other organisations. Use **Dedicated Instances** or **Dedicated Hosts**. This is a compliance choice; for most workloads, standard tenancy is secure.

### Best practices for VMs
1. **Patch the guest OS** regularly (AWS Systems Manager Patch Manager automates it).
2. **Use hardened, up-to-date images**, and rebuild rather than hand-fix running instances.
3. **Use IMDSv2** for the instance metadata service (it protects instance credentials from certain attacks).
4. **Encrypt EBS volumes**, so data is protected even outside your VM.
5. **Least privilege inside the VM**: no shared admin accounts, no SSH open to the world (use Session Manager).

### Your lab VM
The Colima VM is part of your Mac's setup. In this course we only **read** from it (`colima list`, `docker info`, `uname`). Don't change its CPU, memory or disk settings without a reason: Floci and your learning database live inside it.
