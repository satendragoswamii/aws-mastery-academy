## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
- **Domain 1, task 1.1:** economies of scale and resource pooling, both made possible by virtualization.
- **Domain 2, task 2.1:** shared responsibility: AWS manages the **hypervisor and host**; the customer manages the **guest OS** on EC2.
- **Domain 3, task 3.3:** EC2 instance families (general purpose, compute optimised, memory optimised, storage optimised, accelerated computing) and tenancy options.

### What the exam expects
| Question wording | Answer |
|---|---|
| "Who is responsible for patching the guest operating system on EC2?" | The customer |
| "Who is responsible for the virtualization layer?" | AWS |
| "Run instances on hardware dedicated to a single customer" | Dedicated Instances or Dedicated Hosts |
| "Use existing per-socket or per-core software licences (BYOL)" | **Dedicated Hosts** |
| "High compute for batch processing, video encoding" | Compute optimised (C family) |
| "Large in-memory databases" | Memory optimised (R, X families) |
| "Variable workloads with occasional bursts at low cost" | Burstable (T family) |

### Exam traps
- **Dedicated Instance vs. Dedicated Host:** both give dedicated hardware; only **Dedicated Hosts** give visibility and control of the physical server (sockets, cores, placement) for licensing.
- **The hypervisor is never the customer's responsibility** on EC2.
- **Bare metal ≠ Dedicated Host.** Bare metal removes the hypervisor; a Dedicated Host is a whole server for your instances.

### Later certifications
SAA-C03 and SysOps Administrator expect you to choose instance families and sizes, use Graviton for price-performance, understand burstable credits, and place instances with placement groups (cluster, spread, partition).
