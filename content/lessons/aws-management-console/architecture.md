## Where the console fits

~~~text
                 people                                    automation
                   |                                           |
     +-------------+--------------+                 +----------+-----------+
     |             |              |                 |          |           |
  Console     CloudShell      AWS CLI            SDKs     CloudFormation  CI/CD
 (browser)   (browser shell)  (terminal)      (your app)  / CDK / Terraform pipeline
     |             |              |                 |          |           |
     +-------------+--------------+--------+--------+----------+-----------+
                                           |
                        signed HTTPS API requests (SigV4)
                                           |
                    +----------------------+-----------------------+
                    |   IAM authorisation (same rules for everyone) |
                    +----------------------+-----------------------+
                                           |
                     AWS service APIs (S3, EC2, DynamoDB, …)  -> CloudTrail logs every call
~~~

### A healthy team pattern
| Environment | Console access | Changes made by |
|---|---|---|
| Sandbox / personal dev | Full | Anyone, by hand or code |
| Shared dev / staging | Read + limited write | Mostly pipelines |
| Production | **Read-only** (plus break-glass role) | **Only** pipelines (infrastructure as code) |

### Console features that help operations
- **Dashboards:** CloudWatch dashboards, Cost Explorer, Trusted Advisor.
- **myApplications** groups an application's resources, cost and health in one view.
- **AWS Health Dashboard** shows events affecting *your* resources.
- **Resource Groups & Tag Editor** find resources by tag across Regions.
- The **AWS Console Mobile Application** lets you view resources and alarms on a phone.
