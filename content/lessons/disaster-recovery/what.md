## The simple version

**Disaster recovery is your plan for getting back on your feet after something really bad happens.**

High availability and fault tolerance handle everyday failures: a server crashes, a data centre loses power. A **disaster** is bigger, or sneakier:
- A whole **Region** has a serious problem.
- Someone **deletes** the production database by mistake.
- **Ransomware** encrypts your files.
- A software bug **corrupts** data, and the corruption is copied everywhere.

Think of your house. A smoke detector and a fire extinguisher handle small fires (high availability). **Home insurance and copies of your documents kept at a relative's house** are disaster recovery: they don't stop the disaster, but they let you rebuild afterwards.

Two questions define every DR plan:
1. **How much data can we afford to lose?** Five minutes' worth? A day's? That's the **RPO**.
2. **How long can we afford to be down?** One minute? Four hours? That's the **RTO**.

## The professional version

**Disaster recovery (DR)** is the set of strategies, procedures and technologies that restore critical systems and data after an event that normal resilience can't absorb.

~~~text
           last good copy                 disaster                 service restored
 ------------|-------------------------------X--------------------------|----------> time
             |<---------- RPO ------------->|<-------- RTO ----------->|
               data written here is lost      systems are unavailable
~~~

- **RPO (recovery point objective):** maximum acceptable data loss, measured in time.
- **RTO (recovery time objective):** maximum acceptable downtime.

AWS describes four strategies, trading cost for speed:

| Strategy | What runs in the recovery Region | Typical RPO / RTO | Cost |
|---|---|---|---|
| **Backup and restore** | Only backups | Hours / hours | $ |
| **Pilot light** | Data replicated; core services off or minimal | Minutes / tens of minutes | $$ |
| **Warm standby** | Smaller full copy, always running | Seconds–minutes / minutes | $$$ |
| **Multi-site active/active** | Full copy, serving traffic | Near zero / near zero | $$$$ |

> **Key idea:** HA keeps you running **through** failures. DR gets you **back** after failures that HA can't handle, including the ones you cause yourself.
