## Troubleshooting

### Lab errors (seen on Floci 2.4.0)
| Error | Cause | Fix |
|---|---|---|
| `InvalidSubnet.Conflict … conflicts with another subnet` | The new subnet overlaps an existing one | Choose a range that doesn't overlap (e.g. 10.20.3.0/24) |
| `InvalidSubnet.Range … is invalid` | The subnet isn't inside the VPC's CIDR | Use a range inside 10.20.0.0/16 |
| `DependencyViolation … has dependencies and cannot be deleted` | Something still exists inside the VPC | Delete in reverse order: associations, route tables, security groups, subnets, gateway, then the VPC |
| `$VPC` (or another variable) is empty | You opened a new Terminal window | Re-run the steps in one window, or set the variable from `describe-vpcs` |
| `associate-route-table` succeeds but nothing changes | You associated the wrong subnet | Check with `describe-route-tables` which subnets each table has |

### "I can't connect" in real AWS: walk the path
When an instance or database can't be reached, check each hop in order:

~~~text
1. Route table   - does the subnet have a route to the destination (IGW, NAT, peering, VPN)?
2. Public IP     - does the instance have one (for internet access)?
3. Network ACL   - does the subnet allow the traffic IN and the reply OUT (stateless!)?
4. Security group- does it allow the port from that source?
5. OS firewall   - is the instance's own firewall blocking it?
6. Application   - is the app actually listening on that port and address?
~~~

| Symptom | Common cause |
|---|---|
| Instance in a "public" subnet unreachable | No public IP, or no 0.0.0.0/0 → IGW route |
| Private instance can't download updates | No NAT gateway route in its route table |
| Connection times out | Security group or NACL blocking (timeouts usually mean a firewall; "connection refused" usually means nothing is listening) |
| Works one way, fails on replies | NACL missing the outbound ephemeral port range (1024–65535) for replies |
| Can't connect two VPCs | Overlapping CIDRs, or routes missing on one side |
| Database reachable from the internet | Public subnet + open security group: fix immediately |

**VPC Reachability Analyzer** (real AWS) can check the path between two resources for you and tell you which component blocks it.
