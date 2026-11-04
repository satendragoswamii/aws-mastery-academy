## A traditional three-tier setup, on-premises

This is how most business applications were built for twenty years, and many still are.

~~~text
                      Internet
                         |
                 +---------------+
                 |  Edge router  |   (your ISP link; often two for redundancy)
                 +---------------+
                         |
                 +---------------+
                 |   Firewall    |   (hardware appliance you bought)
                 +---------------+
                         |
                 +---------------+
                 | Load balancer |   (another appliance)
                 +---------------+
                   |           |
           +-----------+ +-----------+
           |  Web 1    | |  Web 2    |   Presentation tier
           +-----------+ +-----------+
                   |           |
           +-----------+ +-----------+
           |  App 1    | |  App 2    |   Application (logic) tier
           +-----------+ +-----------+
                   |           |
           +-----------------------+
           |  Database (primary)   |   Data tier
           |  + standby replica    |
           +-----------------------+
                         |
           +-----------------------+
           |  Storage array (SAN)  |   shared disks + nightly tape/disk backup
           +-----------------------+

  All of the above lives in ONE building, powered by UPS + generator, cooled by CRAC units.
~~~

### Reading the diagram
- **Every box is hardware you bought**: routers, firewall, load balancer, servers, storage. Each has a purchase price, a support contract and a refresh date.
- **Pairs (Web 1/Web 2, App 1/App 2)** give redundancy: if one server fails, the other carries on. But you paid for both, and each must be sized for the full load if the other fails.
- **The single building** is the biggest risk. Fire, flood or a long power cut takes everything down. A second data centre doubles the cost.

### The same design in AWS (preview)
You'll build this properly in later lessons. For now, notice that every box has a managed equivalent you **rent** instead of buy:

| On-prem box | AWS equivalent | What changes |
|---|---|---|
| Edge router and ISP link | AWS global network, Internet Gateway | No hardware to buy |
| Firewall appliance | Security groups, network ACLs, AWS WAF | Configuration, not boxes |
| Load balancer appliance | Elastic Load Balancing | Scales automatically |
| Web/App servers | Amazon EC2 (or containers, or Lambda) | Seconds to add, pay per second |
| Database + standby | Amazon RDS Multi-AZ | AWS handles replication and failover |
| SAN storage + tapes | Amazon EBS, Amazon S3, AWS Backup | Pay per GB used |
| One building | Multiple Availability Zones | Resilience built in |

The application architecture can look very similar. What changes is **who owns, operates and pays for each box, and how quickly you can add more**.
