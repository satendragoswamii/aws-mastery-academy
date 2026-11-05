## The simple version

**Cloud networking is how your cloud resources find and talk to each other, and to the internet, safely.**

Imagine a **gated housing society**:
- The whole society, with its boundary wall, is your **VPC**: your private area inside the big city that is AWS.
- Inside are **blocks**: Block A near the main road, Block B at the back. These are **subnets**.
- Every flat has an **address** (Block A, flat 15). Computers have **IP addresses** like `10.20.1.15`.
- The **main gate** connects the society to the public road. That's the **internet gateway**.
- **Signboards** at each junction ("to the main gate →") are the **route table**.
- A **security guard at each flat's door** checks who may enter. That's a **security group**.

Shops and visitors' parking go near the gate (a **public subnet**). Bank lockers go at the back, with no path from the gate (a **private subnet**).

## The professional version

| Concept | What it is |
|---|---|
| **IP address** | An identifier for a network interface (IPv4: four numbers 0–255, e.g. `10.20.1.15`) |
| **CIDR block** | A range of addresses, e.g. `10.20.0.0/16` (65,536 addresses) or `10.20.1.0/24` (256) |
| **VPC** | A logically isolated network in one Region, with CIDR ranges you choose |
| **Subnet** | A CIDR range inside the VPC, in **one** Availability Zone |
| **Route table** | Rules mapping destination CIDRs to targets; each subnet uses one |
| **Internet gateway** | The VPC's connection to the internet; a route target |
| **Security group** | Stateful allow-only firewall on each network interface |
| **Network ACL** | Stateless allow/deny firewall on each subnet |

~~~text
Region ap-south-1
+--------------------------------------------------------------+
| VPC 10.20.0.0/16                                             |
|                                                              |
|   AZ ap-south-1a                                             |
|   +---------------------------+   +------------------------+ |
|   | public subnet 10.20.1.0/24|   | private subnet         | |
|   | route: 0.0.0.0/0 -> IGW   |   | 10.20.2.0/24           | |
|   |  [web server, SG: 443]    |   | route: local only      | |
|   +---------------------------+   |  [database]            | |
|                                   +------------------------+ |
+-----------------------+--------------------------------------+
                        |
                 internet gateway  <---->  internet
~~~

> **Key idea:** a subnet isn't public or private by name. It's public **only** because its route table sends internet traffic to an internet gateway.
