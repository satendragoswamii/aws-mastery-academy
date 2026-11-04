## The simple version

**There are three main ways to "do cloud", depending on who owns the computers and who can use them.**

Think about where you can live:

- **Public cloud is like a hotel.** The building belongs to someone else, many guests share it, each has a private, locked room, and you pay per night. That's AWS.
- **Private cloud is like owning your own house.** Only your family uses it. You control everything, and you pay for everything, including repairs.
- **Hybrid cloud is like owning a house and booking hotel rooms when relatives visit.** You use both, depending on the need.

| Model | Who owns the hardware | Who uses it | Simple example |
|---|---|---|---|
| **Public** | A cloud provider (AWS) | Many customers, isolated from each other | A startup running everything on AWS |
| **Private** | The organisation itself | Only that organisation | A bank's internal VM self-service portal |
| **Hybrid** | Both | The organisation, across both | A bank's mobile app on AWS, its core ledger in its own data centre |

## The professional version

The US standards body **NIST** (in SP 800-145) defines four **deployment models**:

1. **Public cloud**: provisioned for open use by the general public; owned and operated by a provider.
2. **Private cloud**: provisioned for exclusive use by a single organisation; may be on- or off-premises and operated by the organisation or a third party.
3. **Community cloud**: shared by organisations with common concerns (e.g. government agencies with the same compliance rules).
4. **Hybrid cloud**: a composition of two or more of the above, bound together so data and applications can move between them.

**AWS's own exam wording** uses three deployment models:

| AWS term | Means |
|---|---|
| **Cloud** (cloud-native, "all-in") | Everything runs in the public cloud |
| **Hybrid** | Cloud resources connected to on-premises infrastructure |
| **On-premises** (also called private cloud) | Resources in your own data centre, using virtualisation and resource-management tools |

You'll also meet **multi-cloud**: using more than one public cloud provider. It's not one of the NIST models, and it isn't the same as hybrid.

> **Key idea:** the deployment model is about **where the infrastructure lives and who it serves**. It's a separate question from the **service model** (IaaS, PaaS, SaaS) in the next lesson.
