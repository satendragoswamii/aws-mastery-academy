## How cloud networking works

### Reading CIDR
An IPv4 address is 32 bits. The number after `/` says how many leading bits are **fixed**; the rest can vary.

| CIDR | Fixed bits | Addresses | Range |
|---|---|---|---|
| `10.20.0.0/16` | 16 | 2^16 = 65,536 | 10.20.0.0 – 10.20.255.255 |
| `10.20.1.0/24` | 24 | 2^8 = 256 | 10.20.1.0 – 10.20.1.255 |
| `10.20.1.0/25` | 25 | 128 | 10.20.1.0 – 10.20.1.127 |
| `10.20.1.128/25` | 25 | 128 | 10.20.1.128 – 10.20.1.255 |
| `0.0.0.0/0` | 0 | all | every IPv4 address ("anywhere") |

Smaller number after the slash = bigger range. AWS VPCs can be between `/16` and `/28`.

### Reserved addresses
In every subnet, AWS reserves **5** addresses. For `10.20.1.0/24`:
| Address | Reserved for |
|---|---|
| 10.20.1.0 | Network address |
| 10.20.1.1 | VPC router |
| 10.20.1.2 | DNS server (VPC base + 2) |
| 10.20.1.3 | Reserved for future use |
| 10.20.1.255 | Broadcast address |
So a /24 gives **251** usable addresses. The demo's `AvailableIpAddressCount` shows exactly that.

### Routing
Each subnet is associated with one route table. Traffic leaving the subnet is matched against the routes; the **most specific** match wins.

~~~text
Route table for the public subnet
Destination      Target
10.20.0.0/16     local          <- always present: anything inside the VPC
0.0.0.0/0        igw-953cfc0a   <- everything else goes to the internet gateway

Main route table (used by any subnet without its own association)
10.20.0.0/16     local          <- no internet route = private
~~~

A packet from the web server to `10.20.2.40` (the database) matches `10.20.0.0/16` → stays inside the VPC. A packet to `142.250.x.x` matches only `0.0.0.0/0` → internet gateway.

### Getting to the internet
| Need | Component |
|---|---|
| Resource must be reachable **from** the internet | Public subnet + internet gateway + public IP (or put it behind a load balancer) |
| Private resource needs to reach **out** (e.g. download updates) | **NAT gateway** in a public subnet; private route table sends 0.0.0.0/0 to it |
| Reach S3 or DynamoDB privately, without the internet | **VPC gateway endpoint** |

### Firewalls: two layers
| | Security group | Network ACL |
|---|---|---|
| Applies to | Network interfaces (instances, load balancers, databases) | Whole subnets |
| State | **Stateful**: replies are allowed automatically | **Stateless**: replies need their own rule |
| Rules | Allow only | Allow and deny, evaluated by rule number |
| Default (new custom one) | All inbound denied, all outbound allowed | Custom NACL: deny all; default NACL: allow all |

The demo's security group allows TCP **443** (HTTPS) inbound from anywhere. Its outbound rule (`-1` = all protocols, to `0.0.0.0/0`) was created automatically.

Security groups can also refer to **other security groups**: "allow 5432 from the app tier's security group" is much safer than listing IP addresses.
