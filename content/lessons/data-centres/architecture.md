## From one data centre to a resilient design

### Level 0: a single server room
~~~text
+------------------------------+
| Office server room           |
|  [web] [db]   1 power feed   |
|               1 ISP link     |
+------------------------------+
Any single failure = outage
~~~

### Level 1: one good data centre
~~~text
+------------------------------------------+
| Data centre (redundant power, cooling,   |
| network, security)                       |
|   [web1] [web2]     [db primary]         |
|                     [db standby]         |
+------------------------------------------+
Survives a failed server, UPS or link. Does NOT survive losing the building.
~~~

### Level 2: two Availability Zones (the AWS default for production)
~~~text
                   Region ap-south-1 (Mumbai)
+-------------------------+        +-------------------------+
| AZ ap-south-1a          |        | AZ ap-south-1b          |
|   [web1]                |        |   [web2]                |
|   [db primary]  ------------------>  [db standby]          |
+-------------------------+        +-------------------------+
       synchronous replication over AWS private low-latency fibre
              ^                               ^
              +---------- load balancer ------+
Survives losing a whole data centre (an AZ).
~~~

### Level 3: two Regions (disaster recovery)
~~~text
Region ap-south-1 (Mumbai)  ----- asynchronous copy ----->  Region ap-south-2 (Hyderabad)
  2+ AZs, live traffic                                         standby or reduced copy
Survives losing a whole Region. Costs more and adds complexity.
~~~

### Choosing the level
| Need | Typical choice |
|---|---|
| Learning, dev and test | One AZ is fine |
| Production business app | Two or more AZs |
| Must survive a regional disaster, or regulators require it | Two Regions, covered in *Disaster recovery* |
| Data must stay in India | Mumbai and/or Hyderabad Regions only |

The jump from Level 1 to Level 2 is the big one. On-prem it means building or renting a second data centre. In AWS it's a deployment choice: put your second server in a different AZ.
