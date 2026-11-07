## What is an ARN?

### The simple version
Every AWS resource has a full postal address called an **ARN** (Amazon Resource Name). Just as an address says country, city, street and house, an ARN says which copy of AWS, which service, which Region, which account and which exact thing.

~~~text
arn : aws       : sqs     : ap-south-1 : 000000000000 : ama-l2-arn-orders
 |     |           |         |            |              |
 |     partition   service   Region       account ID     resource
 always "arn"
~~~

Names like `ama-l2-arn-orders` can repeat in other Regions and other accounts. The ARN never repeats.

### The professional version
The format is `arn:PARTITION:SERVICE:REGION:ACCOUNT-ID:RESOURCE`.

| Field | Values | Notes |
|---|---|---|
| partition | `aws`, `aws-cn` (China), `aws-us-gov` (GovCloud) | Separate copies of AWS |
| service | `s3`, `iam`, `sqs`, `ec2`, `lambda`… | The service namespace, the same as in policy actions |
| region | `ap-south-1`… or **empty** | Empty for global services (IAM, Route 53, CloudFront) and S3 buckets |
| account-id | 12 digits, **empty**, or `aws` | Empty for S3 buckets; `aws` for AWS managed policies |
| resource | depends on the service | May contain `/` and `:` |

### The resource part, service by service
| Service | Example resource part | Shape |
|---|---|---|
| SQS, SNS | `ama-l2-arn-orders` | name |
| DynamoDB | `table/ama-l2-arn-stock` | type/name |
| IAM | `user/team/backend/ama-l2-arn-dev` | type/path/name |
| KMS | `key/c3638a6e-…` or `alias/ama-l2-arn-app` | type/id |
| Secrets Manager | `secret:ama-l2-arn/db-password-RGV758` | type:name plus random suffix |
| CloudWatch Logs | `log-group:/ama/l2/arn-app:*` | type:name:streams |
| S3 | `ama-l2-arn-files` or `ama-l2-arn-files/reports/jan.csv` | bucket, or bucket/key |
| Lambda | `function:my-fn` or `function:my-fn:3` | type:name:version |
| EC2 | `instance/i-0abc123…` | type/id |

You don't memorise these. You **copy the ARN AWS gives you**, and look up the format in the service's documentation ("Actions, resources and condition keys") when writing policies.
