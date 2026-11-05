## Why disaster recovery matters

### Multi-AZ doesn't protect you from everything
| Disaster | Does Multi-AZ help? | Why |
|---|---|---|
| One data centre loses power | ✅ Yes | Other AZs keep running |
| A Region-wide service problem | ❌ No | All AZs are in that Region |
| Someone runs `DELETE FROM orders` | ❌ No | Replication copies the delete to the standby instantly |
| Ransomware encrypts files | ❌ No | Encrypted files replicate too |
| A bad deployment corrupts data | ❌ No | Corruption replicates |
| Account credentials stolen, resources deleted | ❌ No | Same account, same attacker |

Replication protects against **losing a copy**. Only **backups with history** (older versions) protect against **bad changes**. That's why every serious DR plan includes both.

### Most "disasters" are human
Accidental deletion, wrong scripts, expired credentials, bad migrations, ransomware: these happen far more often than a Region failing. A DR plan that only thinks about earthquakes misses the most likely disasters.

### Why RPO and RTO are business decisions
Engineers can build any RPO or RTO; the question is what it's **worth**:
- A **payments** system losing 5 minutes of transactions is a serious problem → RPO near zero.
- A **reporting** database can be rebuilt from source data → RPO of a day is fine.
- An **online shop** down for 4 hours on a sale day loses a lot of money → low RTO.
- An internal **training portal** down for a day is annoying → RTO of a day may be fine.

Ask the business: *"What does an hour of downtime cost? What does losing an hour of data cost?"* Then pick the cheapest strategy that meets the answer.

### Why the cloud makes DR affordable
On-premises DR means a **second data centre** with duplicate hardware, mostly idle, just in case. In AWS:
- A second Region already exists. You pay only for what you put there.
- **Backups** to another Region cost only storage.
- **Infrastructure as Code** can recreate the environment in minutes instead of rebuilding by hand.
- **Pilot light** and **warm standby** let you pay for a small footprint and scale up only during a disaster.

### Regulators and customers ask
Banks, insurers, healthcare and government systems are often required to have **tested** DR plans with defined RPO/RTO. Customers increasingly ask suppliers the same in security questionnaires.

## Why this matters for you
RPO/RTO and the four strategies are core exam material, and in real jobs you'll be asked to design, document and **test** DR, often for the first time in a company's history.
