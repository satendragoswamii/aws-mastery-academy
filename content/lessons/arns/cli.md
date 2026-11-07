## CLI reference for this lesson

### Getting ARNs
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 sts get-caller-identity --query Arn --output text` | Your own ARN |
| `aws --endpoint-url http://localhost:4566 sqs get-queue-attributes --queue-url URL --attribute-names QueueArn` | A queue's ARN (not returned by create-queue) |
| `aws --endpoint-url http://localhost:4566 dynamodb describe-table --table-name T --query Table.TableArn` | A table's ARN |
| `aws --endpoint-url http://localhost:4566 logs describe-log-groups --query 'logGroups[].arn'` | Log group ARNs (ending `:*`) |
| `aws --endpoint-url http://localhost:4566 kms list-aliases --query 'Aliases[].AliasArn'` | Alias ARNs |

### Using ARNs as inputs
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 sns subscribe --topic-arn TOPIC-ARN --protocol sqs --notification-endpoint QUEUE-ARN` | Connect services by ARN |
| `aws --endpoint-url http://localhost:4566 dynamodb describe-table --table-name TABLE-ARN` | Table ARN accepted as a name |
| `aws --endpoint-url http://localhost:4566 secretsmanager describe-secret --secret-id PARTIAL-ARN` | Works without the random suffix |
| `aws --endpoint-url http://localhost:4566 resourcegroupstaggingapi tag-resources --resource-arn-list A B C --tags k=v` | Tag resources of different services in one call |
| `aws --endpoint-url http://localhost:4566 resourcegroupstaggingapi get-resources --tag-filters Key=k,Values=v` | Find ARNs by tag |

### Testing ARN patterns
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam simulate-custom-policy --policy-input-list "$(cat p.json)" --action-names s3:GetObject --resource-arns arn:aws:s3:::b/k` | Does the policy match this ARN? |
| `... --context-entries ContextKeyName=aws:username,ContextKeyValues=NAME,ContextKeyType=string` | Fill in a policy variable |

### Shell helpers
| Command | What it does |
|---|---|
| `echo "$ARN" \| cut -d: -f4` | Region |
| `echo "$ARN" \| cut -d: -f5` | Account ID |
| `echo "$ARN" \| cut -d: -f6-` | Whole resource part (note the `-`) |
