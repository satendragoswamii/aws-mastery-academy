## Troubleshooting

These errors were all reproduced on Floci 2.4.0 with lab tables.

| Error | Cause | Fix |
|---|---|---|
| `ResourceInUseException … Table already exists: ama-l1-orders` | A table with that name already exists in this Region | Use it, choose another name, or delete the old lab table first |
| `ResourceNotFoundException … Requested resource not found` | Wrong table name **or wrong Region** | Check `--region`; run `dynamodb list-tables` |
| `ValidationException … The provided key element does not match the schema` | The key's name or **type** doesn't match the table (e.g. `{"N":"1001"}` when the key is a string) | Use the exact key name and type from `describe-table` |
| `ValidationException … One of the required keys was not given a value` | `put-item` without the key attribute | Every item must include the full primary key |
| `get-item` prints **nothing** and succeeds | No item with that key exists. This is not an error | Check the key value; empty output means "not found" |
| `InvalidAMIID.NotFound` on `run-instances` | Image ID from another Region or from real AWS | Look up the image with `describe-images` in the same Region |
| `Could not connect to the endpoint URL` | Floci isn't running | `docker ps --filter name=floci`; `docker start floci` |

The silent "not found" deserves attention. In a script, check whether the output contains `Item`:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb get-item \
  --table-name ama-l1-orders --key '{"orderId":{"S":"ORD-404"}}' --query 'Item' --output text
~~~

This prints `None` when the order doesn't exist.

### Choosing the wrong service model
| Symptom | Likely mismatch | Better choice |
|---|---|---|
| Team spends days a month patching DB servers | Database on IaaS without a good reason | Amazon RDS or another managed database |
| Paying for servers that idle most of the day | Always-on IaaS for spiky traffic | Serverless (Lambda, DynamoDB on-demand) or Auto Scaling |
| A managed service is missing a needed feature or version | Too high up the stack for this workload | IaaS for that component, with automation |
| Building your own email or chat system | Rebuilding commodity software | SaaS |
