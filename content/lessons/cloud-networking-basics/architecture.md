## The standard production VPC

~~~text
VPC 10.20.0.0/16  (ap-south-1)
+-----------------------------------------------------------------------------------+
|           AZ ap-south-1a                         AZ ap-south-1b                   |
|  +-------------------------------+     +-------------------------------+          |
|  | public  10.20.1.0/24          |     | public  10.20.11.0/24         |  route:  |
|  |  [ALB node] [NAT gateway]     |     |  [ALB node] [NAT gateway]     |  0/0->IGW|
|  +-------------------------------+     +-------------------------------+          |
|  +-------------------------------+     +-------------------------------+          |
|  | private app 10.20.2.0/24      |     | private app 10.20.12.0/24     |  route:  |
|  |  [app servers / containers]   |     |  [app servers / containers]   |  0/0->NAT|
|  +-------------------------------+     +-------------------------------+          |
|  +-------------------------------+     +-------------------------------+          |
|  | private data 10.20.3.0/24     |     | private data 10.20.13.0/24    |  route:  |
|  |  [RDS primary]                |     |  [RDS standby]                |  local   |
|  +-------------------------------+     +-------------------------------+  only    |
+--------------------------------------+--------------------------------------------+
                                       |
                                internet gateway
~~~

### Security groups chained by reference
~~~text
alb-sg   : inbound 443 from 0.0.0.0/0
app-sg   : inbound 8080 from alb-sg       (not from the internet)
db-sg    : inbound 5432 from app-sg       (only the app tier can reach the database)
~~~
Even if an app server's IP changes, or new servers are added by Auto Scaling, the rules stay correct, because they reference groups, not addresses.

### What the demo built (one AZ, simplified)
~~~text
VPC 10.20.0.0/16
  ama-l1-public-a  10.20.1.0/24  -> route table rtb-...: local + 0.0.0.0/0 -> igw
  ama-l1-private-a 10.20.2.0/24  -> main route table:   local only
  ama-l1-web-sg    inbound tcp 443 from 0.0.0.0/0, outbound all
~~~

### IP address plan example
| Environment | Region | VPC CIDR |
|---|---|---|
| Production | ap-south-1 | 10.20.0.0/16 |
| Production DR | ap-south-2 | 10.21.0.0/16 |
| Staging | ap-south-1 | 10.30.0.0/16 |
| Development | ap-south-1 | 10.40.0.0/16 |
| Office network (on-premises) | — | 192.168.0.0/16 |
No overlaps, so any of them can be connected later.
