## Why cloud networking matters

### Not everything should be on the internet
A web server must be reachable by customers. A database holding customer data must **not** be. Networking lets you put each resource exactly where it belongs:
- Web servers and load balancers: reachable from the internet, only on the ports they need.
- Application servers: reachable only from the web tier.
- Databases: reachable only from the application tier, never from the internet.

This layered design means an attacker who finds one weakness still faces more walls.

### Isolation between customers and environments
Every VPC is isolated from every other VPC, including other customers' VPCs on the same AWS hardware. Companies also use separate VPCs (often separate accounts) for development, testing and production, so a mistake in testing can't touch production.

### High availability needs subnets in several AZs
A subnet lives in **one** AZ. To survive an AZ failure, you create subnets in at least two AZs and spread resources across them, exactly what load balancers and Auto Scaling groups need.

### Connecting to the rest of the world
Real systems connect to:
- the **internet** (through an internet gateway, or a **NAT gateway** for outbound-only access from private subnets),
- **other VPCs** (peering, Transit Gateway),
- **on-premises** data centres (Site-to-Site VPN, Direct Connect, from the hybrid cloud lesson),
- **AWS services** privately (VPC endpoints).

All of this depends on routes, and routes depend on non-overlapping address ranges.

### Why CIDR planning matters early
Two networks with the same address range can't be connected directly: routers can't tell `10.0.1.5` in one from `10.0.1.5` in the other. A VPC's primary CIDR can't be changed later. A few minutes of planning on day one saves rebuilds later.

### Why the cloud makes networking easier
On-premises, networks mean buying routers, switches and firewalls, and cabling them. In AWS, a VPC, subnets, gateways and firewalls are created with API calls in seconds, as you'll do in the demo, and the internet gateway is redundant and scales automatically.

## Why this matters for you
Almost every AWS architecture question involves a VPC. CLF-C02 expects you to recognise VPCs, subnets, internet gateways, security groups and NACLs; associate exams expect you to design them.
