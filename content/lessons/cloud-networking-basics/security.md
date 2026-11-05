## Security and best practices

### Network security is your responsibility
AWS secures the physical network and isolates VPCs from each other. **Everything you configure inside your VPC** (subnets, routes, security groups, NACLs, what's public) is your responsibility.

### Rules to live by
1. **Private by default.** Put only load balancers (and NAT gateways) in public subnets. Application servers and databases go in private subnets.
2. **Least privilege on ports.** Open only the ports you need, from the sources that need them. `0.0.0.0/0` should appear on very few rules (usually only 443 on the load balancer).
3. **Never open admin ports to the world.** SSH (22) and RDP (3389) open to `0.0.0.0/0` are scanned and attacked within minutes. Use AWS Systems Manager Session Manager instead: no open ports at all.
4. **Reference security groups, not IP addresses**, between tiers: "database allows 5432 from app-sg".
5. **Use NACLs as a second, coarse layer**, for example to block a known bad address range for a whole subnet.
6. **Keep AWS service traffic private** with VPC endpoints (e.g. S3, DynamoDB), so it doesn't cross the internet.
7. **Log network traffic** with **VPC Flow Logs**, to investigate incidents and spot unexpected connections.

### Defence in depth
~~~text
Internet -> AWS Shield (DDoS) -> AWS WAF on the load balancer -> NACL (subnet)
         -> security group (instance) -> OS firewall -> application authentication
~~~
Each layer catches what the previous one missed.

### Common dangerous mistakes
| Mistake | Risk |
|---|---|
| Database in a public subnet with 0.0.0.0/0 on its port | Data theft, ransomware |
| SSH open to the world with password login | Brute-force takeover |
| One security group shared by every tier | One compromised server can reach everything |
| No flow logs | No evidence after an incident |

### Lab note
Your Floci VPC and security groups don't carry real traffic, so the open 443 rule in the demo exposed nothing. In real AWS, think before every `0.0.0.0/0`.
