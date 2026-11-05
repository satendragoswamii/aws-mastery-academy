## Why virtualization exists

### The waste problem
Remember utilisation from *Traditional IT*: a dedicated server often averages 10–20% CPU. Before virtualization, every application got its own physical server, because running two applications on one OS caused conflicts (different library versions, one crashing the other, security concerns). A company with 100 applications had 100 mostly idle servers.

### What virtualization fixed
| Problem | With virtualization |
|---|---|
| One app per server, mostly idle | Many VMs per server, hardware busy |
| Weeks to get a new server | Minutes to create a VM |
| Hardware failure = app down until repaired | VM restarted or moved to another host |
| Testing needs spare hardware | Clone a VM, test, delete it |
| Different OS needs different machines | Linux and Windows VMs side by side |

### Why it made the cloud possible
The NIST cloud characteristics depend on it:
- **Resource pooling**: many customers' VMs share hosts. That's multi-tenancy.
- **On-demand self-service**: creating a VM is an API call, not a delivery truck.
- **Rapid elasticity**: VMs can be created and destroyed in seconds.
- **Measured service**: the hypervisor knows exactly what each VM uses.

Without virtualization, a cloud provider would have to rack a new physical server for every customer request.

### Why isolation matters so much
Your EC2 instance may share a physical host with a company you've never heard of. The hypervisor must guarantee that neither can read the other's memory, see its disk or slow it down unreasonably. AWS designed Nitro specifically to strengthen this isolation, including removing interactive operator access to hosts.

### Why you should care about the details
- **Instance types** are just different VM shapes: how much vCPU, memory, network and storage a VM gets.
- **The shared responsibility model** splits exactly at the hypervisor: AWS secures the host and hypervisor; you secure the guest OS.
- **Licensing and compliance** sometimes require dedicated hardware, and AWS offers it (Dedicated Hosts, Dedicated Instances, bare metal).
- **Containers** (next lesson) are a lighter form of isolation, and understanding VMs first makes the difference clear.
