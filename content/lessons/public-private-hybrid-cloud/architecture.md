## Reference architectures

### 1. Cloud-native ("all-in")
~~~text
Users --> Internet --> [ AWS Region ]
                         |-- load balancer
                         |-- app servers / containers (multiple AZs)
                         |-- managed database (Multi-AZ)
                         |-- object storage (S3)
No company data centre at all.
~~~

### 2. Private cloud
~~~text
Employees --> corporate network --> [ Company data centre ]
                                      |-- self-service portal + APIs
                                      |-- virtualisation cluster
                                      |-- SAN storage
Capacity = whatever was bought.
~~~

### 3. Hybrid (the common enterprise shape)
~~~text
          Company data centre                                 AWS Region
+-------------------------------------+               +----------------------------------+
| Core banking DB (must stay)         |  Direct       | VPC                              |
| Mainframe / legacy apps             |  Connect  ===>|  mobile-app backend (multi-AZ)   |
| Active Directory (identity)         |  (primary)    |  analytics, data lake (S3)       |
|                                     |  VPN    ----->|  backups of on-prem systems      |
|                                     |  (backup)     |                                  |
+-------------------------------------+               +----------------------------------+
        ^                                                          ^
        +---- same identity (federation), same monitoring ---------+
~~~
Notice the **two links**. Direct Connect gives consistent private bandwidth; the VPN over the internet is a cheaper backup if the Direct Connect line fails.

### 4. Multi-cloud
~~~text
[ AWS ]  main application          [ Another provider ]  a specific service
     \                                   /
      +---- company identity + network -+
Two sets of tools, skills and bills.
~~~

### Deciding, per workload
| Question | Points towards |
|---|---|
| Must the data or system physically stay in our building? | On-prem / private (or Outposts) |
| Is demand variable or unpredictable? | Public cloud |
| Is it new, or being rewritten anyway? | Public cloud |
| Is it legacy, stable and on young hardware? | Stay on-prem for now, revisit at refresh |
| Do on-prem systems need cloud services or off-site backup? | Hybrid |
