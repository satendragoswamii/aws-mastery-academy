## The shop, reviewed pillar by pillar

~~~text
                    Route 53 --> CloudFront + WAF
                                     |
          +---------------- Region ap-south-1 -----------------+
          |   ALB (multi-AZ)                                   |
          |    |            |             |                    |
          |  [app 1a]    [app 1b]     [app 1c]   Auto Scaling  |
          |    \____________|_____________/                    |
          |          DynamoDB orders (on-demand, PITR)         |
          |          S3 receipts/logs (versioned, lifecycle)   |
          |          CloudWatch alarms -> SNS -> on-call       |
          +----------------------------------------------------+
                     backups copied to ap-south-2
~~~

| Pillar | What the design does | Risk it removes |
|---|---|---|
| Operational excellence | Infrastructure as code, tags (`Owner`, `Environment`), alarms to on-call, runbooks | "Nobody knew it was broken / whose it was" |
| Security | WAF, private subnets, IAM roles, KMS encryption, Block Public Access, CloudTrail | Data leaks, unauthorised access |
| Reliability | Three AZs, Auto Scaling, PITR, versioning, cross-Region backups | Outages, data loss |
| Performance efficiency | CloudFront cache, on-demand DynamoDB, right-sized instances | Slow pages, throttling on sale days |
| Cost optimization | Savings Plan for baseline, Spot for batch, lifecycle to Standard-IA, budgets | Overspending |
| Sustainability | Auto Scaling (no idle servers), Graviton instances, delete old logs, managed services | Wasted energy and storage |

### Where the risks were in the first draft
~~~text
first draft:  [bucket: no owner, no versioning, no lifecycle]  [table: fixed 5 RCU/WCU, no PITR]  [no alarms]
              -> 7 findings across 5 pillars, fixed in 5 steps
~~~
