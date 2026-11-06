## Console actions and their CLI equivalents

| Console action | CLI equivalent |
|---|---|
| Storage → Create bucket | `aws s3api create-bucket --bucket NAME` (outside us-east-1 add `--create-bucket-configuration LocationConstraint=REGION`) |
| Storage → list buckets | `aws s3api list-buckets` |
| Click a bucket → Objects | `aws s3 ls s3://NAME/` |
| Upload | `aws s3 cp FILE s3://NAME/KEY` |
| Trash icon → Confirm (empty bucket) | `aws s3api delete-bucket --bucket NAME` |
| Delete a bucket with objects | `aws s3 rb s3://NAME --force` |
| Account menu → account ID | `aws sts get-caller-identity` |
| Region selector | `--region REGION` or `aws configure set region REGION` |
| IAM → Account settings → Account alias | `aws iam create-account-alias --account-alias NAME` |

### Find the console URL for an IAM user
Get the account ID (here from Floci, whose account is `000000000000`):

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 sts get-caller-identity --query Account --output text
~~~

In a real account with ID `123456789012`, IAM users sign in at `https://123456789012.signin.aws.amazon.com/console`.

### Try it yourself
1. In the Floci UI, open **SQS** and find the `smoke` queue (it was there before the academy; **don't delete it**). Find the same queue with the CLI:
   ~~~bash
   aws --endpoint-url http://localhost:4566 --region us-east-1 sqs list-queues
   ~~~
2. Create a bucket `ama-l1-console-try` with the CLI, upload two files into a folder `notes/`, and browse into the folder in the Floci UI. Then delete it with `s3 rb --force`.
3. Write down three things you did in this lesson that would be painful to repeat by clicking 100 times.
