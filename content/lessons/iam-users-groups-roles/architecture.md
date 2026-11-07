## Identities for a food-delivery company

~~~text
PEOPLE (Identity Center or IAM users)          WORKLOADS (roles)
groups:                                        role "web" (trust EC2)
  developers -> PowerUserAccess                   -> read menu bucket, write orders table
  oncall     -> CloudWatch + EC2 reboot           via instance profile on each web server
  auditors   -> SecurityAudit                  role "invoice-fn" (trust Lambda)
  admins     -> AdministratorAccess + MFA         -> read orders, write invoices bucket
                                               role "deploy" (trust GitHub OIDC)
                                                  -> update the app, nothing else
PARTNERS
  role "partner-audit" (trust account 1111..., external ID) -> SecurityAudit, 1 h sessions

AWS SERVICES
  AWSServiceRoleForAutoScaling, AWSServiceRoleForElasticLoadBalancing (service-linked)
~~~

### Rules this design follows
| Rule | How |
|---|---|
| No long-term keys in workloads | EC2, Lambda and CI all use roles |
| People get access by team | Groups (or Identity Center permission sets) |
| One role per workload | `web` and `invoice-fn` can't touch each other's data |
| Third parties are fenced | Account + external ID + short sessions + read-only |
| Service roles left alone | Service-linked roles managed by AWS |

### Across many accounts
~~~text
security account  --assume--> "audit" role in every account
shared-services   --assume--> "deploy" role in dev, test, prod
Identity Center   --creates--> permission-set roles in each account for people
~~~
