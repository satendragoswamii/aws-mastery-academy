## How ARNs work

### Where you get an ARN
You rarely type an ARN from scratch. AWS returns it when you create or describe a resource:

| Resource | Where the ARN appears |
|---|---|
| SNS topic | `create-topic` returns `TopicArn` |
| DynamoDB table | `TableDescription.TableArn` / `Table.TableArn` |
| SQS queue | Not in `create-queue`; ask `get-queue-attributes --attribute-names QueueArn` |
| IAM user, role | `User.Arn`, `Role.Arn` |
| Yourself | `aws sts get-caller-identity` (with the endpoint) returns `Arn` |
| Console | Most resource detail pages show the ARN with a copy button |

### Empty fields are deliberate
- **Global services** (IAM, Route 53, CloudFront, Organizations): Region empty, as in `arn:aws:iam::123456789012:role/admin`.
- **S3 buckets**: Region and account empty, as in `arn:aws:s3:::my-bucket`, because bucket names are unique worldwide.
- **AWS managed policies**: account is `aws`, as in `arn:aws:iam::aws:policy/ReadOnlyAccess`.

### Paths and session names in IAM ARNs
An IAM user or role created with `--path /team/backend/` has the path inside its ARN: `user/team/backend/ama-l2-arn-dev`. When someone assumes a role, the temporary identity is different:

~~~text
Role ARN           arn:aws:iam::000000000000:role/ci/ama-l2-arn-deployer
Assumed-role ARN   arn:aws:sts::000000000000:assumed-role/ama-l2-arn-deployer/build-42
                         ^^^ sts, not iam        path dropped ^   session name ^
~~~

### ARN patterns in policies
| Pattern | Matches | Doesn't match |
|---|---|---|
| `arn:aws:s3:::reports` | the bucket (ListBucket) | any object |
| `arn:aws:s3:::reports/*` | every object, any depth | the bucket |
| `arn:aws:sqs:ap-south-1:123456789012:app-*` | `app-orders` in Mumbai | `app-orders` in Ireland, `APP-orders` |
| `arn:aws:sqs:*:123456789012:app-*` | `app-…` queues in every Region | other accounts |
| `arn:aws:s3:::home/${aws:username}/*` | the caller's own folder | other users' folders |

Rules: `*` matches any characters (including `/`), `?` matches one character, matching is **case-sensitive**, and a wildcard can't stand for the service or partition in a useful way, so keep those literal.

### Splitting an ARN safely
Only the **first five colons** separate fields; the resource part can contain more. Use `cut -d: -f6-`, `read` with six variables (step 3), or a library parser such as `@aws-sdk/util-arn-parser` in JavaScript.

### Partitions in templates
Infrastructure code avoids hard-coding `arn:aws`. CloudFormation uses `arn:${AWS::Partition}:s3:::${BucketName}`, and the CDK and Terraform offer partition values, so the same template works in China and GovCloud.
