## In the real world

### Startups: public cloud from day one
A food-delivery startup has no data centre and no wish to build one. Everything runs on AWS: app servers, databases, maps, notifications. It can launch in a new city by deploying the same templates again.

### Banks and insurers: hybrid by necessity
A large private bank keeps its core banking system on-prem (decades old, heavily regulated, hard to move). New digital channels, the mobile app, fraud analytics and customer chat run on AWS, connected by Direct Connect. Over the years more moves to the cloud, one system at a time. **Hybrid is a journey, not a final state.**

### Manufacturing: edge plus cloud
A car-parts factory runs machine-control software on servers on the factory floor, because a millisecond delay matters and the factory must work even if the internet fails. Sensor data is sent to AWS for analytics and predictive maintenance. Some factories use AWS Outposts for the local part.

### Government: community and sovereign clouds
Government agencies often need clouds that meet specific national standards. In the US, AWS GovCloud (US) is an isolated set of Regions for sensitive government workloads. In India, providers go through government empanelment processes before agencies can use them.

### The most common first step: backup
Before migrating any application, many companies start by **backing up on-prem data to the cloud**. It's low-risk, immediately useful (off-site protection against fire, theft and ransomware), and builds the team's skills. That's what you'll build in the demo with `aws s3 sync`. Real deployments often use AWS Backup, AWS Storage Gateway or AWS DataSync for the same job at scale.

### What you'll do on the job
- Map which workloads can move, which must stay, and why.
- Set up and troubleshoot VPN and Direct Connect connectivity.
- Federate identity, so staff use one login for on-prem and AWS.
- Design backup and DR for on-prem systems into AWS.
