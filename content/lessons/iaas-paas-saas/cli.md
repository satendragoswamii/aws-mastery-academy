## AWS CLI commands in this lesson

### IaaS (EC2)
| Command | What it does |
|---|---|
| `aws ec2 describe-images --owners amazon --filters 'Name=name,Values=al2023-ami-*-x86_64'` | Finds operating system images by name |
| `aws ec2 run-instances --image-id … --instance-type …` | Launches a server you then manage |
| `aws ec2 terminate-instances --instance-ids …` | Deletes the server |

### Serverless (DynamoDB)
| Command | What it does |
|---|---|
| `aws dynamodb create-table --table-name … --attribute-definitions … --key-schema … --billing-mode PAY_PER_REQUEST` | Creates an on-demand table |
| `aws dynamodb wait table-exists --table-name …` | Waits until the table is ready (use in scripts) |
| `aws dynamodb put-item --table-name … --item '{…}'` | Writes (or replaces) one item |
| `aws dynamodb get-item --table-name … --key '{…}'` | Reads one item by its key |
| `aws dynamodb describe-table --table-name …` | Shows the table's settings and status |
| `aws dynamodb list-tables` | Lists tables in the Region |
| `aws dynamodb delete-table --table-name …` | Deletes the table and all its data |

### DynamoDB JSON
The low-level API labels every value with its type:

~~~json
{"orderId": {"S": "ORD-1001"}, "total": {"N": "499"}, "paid": {"BOOL": true}}
~~~

- `S` string, `N` number (always sent as a string), `BOOL` true/false, `L` list, `M` map.
- The **key** you pass to `get-item` must match the table's key schema exactly, including the type.

### Try it yourself
Recreate the table, write two orders, then check the size of the table:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb scan \
  --table-name ama-l1-orders --select COUNT
~~~

`scan` reads **every item** in the table. It's fine for a lab table, but it's slow and costly on big tables. You'll learn better patterns in the DynamoDB lessons. Delete the table afterwards.

### Looking up an image ID properly
Hard-coded AMI IDs (like the one in the demo) only work in Floci. On real AWS, look them up:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-images --owners amazon \
  --filters 'Name=name,Values=al2023-ami-*-x86_64' --query 'Images[].[ImageId,Name]' --output text
~~~

Output on Floci:

~~~text
ami-0abcdef1234567891	al2023-ami-2023.0.20230315.0-kernel-6.1-x86_64
~~~
