## How ARNs connect an application

A small order system in Mumbai. Each arrow is a configuration that stores an ARN:

~~~text
                 IAM role  arn:aws:iam::123456789012:role/app/orders-api
                   | policy "Resource":
                   |   arn:aws:dynamodb:ap-south-1:123456789012:table/orders
                   |   arn:aws:sns:ap-south-1:123456789012:order-events
                   |   arn:aws:secretsmanager:ap-south-1:123456789012:secret:orders/db-*
                   v
  orders API  --PutItem-->  DynamoDB table "orders"
       |
       +--Publish--> SNS topic "order-events" --subscription--> SQS queue "invoices"
                                                (Endpoint = queue ARN)
                                                 queue policy: allow sns.amazonaws.com
                                                 if aws:SourceArn = topic ARN
~~~

### Design rules shown here
- **Scope every permission to exact ARNs.** The role can reach one table, one topic and one secret, not `*`.
- **Secrets use a trailing `-*`** in policies because of the random six-character suffix: `secret:orders/db-*`.
- **Resource-based policies name the caller by ARN.** The queue policy accepts messages only when `aws:SourceArn` is the topic's ARN, so another topic can't write to it.
- **Group ARNs with naming and paths.** Roles under `/app/` and resources named `orders-…` let one pattern cover a whole application without covering others.

### Cross-account ARNs
~~~text
Account A 111111111111                    Account B 222222222222
bucket policy on arn:aws:s3:::a-logs  <-- role arn:aws:iam::222222222222:role/log-reader
  "Principal": {"AWS": "arn:aws:iam::222222222222:role/log-reader"}
~~~
The account ID inside the ARN is what makes cross-account access precise.
