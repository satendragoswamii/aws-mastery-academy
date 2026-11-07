## CLI reference for this lesson

### Groups
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam create-group --group-name G --path /eng/` | New group |
| `aws --endpoint-url http://localhost:4566 iam attach-group-policy --group-name G --policy-arn ARN` | Give the group a managed policy |
| `aws --endpoint-url http://localhost:4566 iam add-user-to-group --group-name G --user-name U` | Join |
| `aws --endpoint-url http://localhost:4566 iam remove-user-from-group --group-name G --user-name U` | Leave |
| `aws --endpoint-url http://localhost:4566 iam get-group --group-name G` | Members |
| `aws --endpoint-url http://localhost:4566 iam list-groups-for-user --user-name U` | A user's groups |

### Organising
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam list-users --path-prefix /eng/` | Users under a path |
| `aws --endpoint-url http://localhost:4566 iam create-user --user-name U --tags Key=team,Value=payments` | Tagged user |
| `aws --endpoint-url http://localhost:4566 iam list-user-tags --user-name U` | A user's tags |

### Roles and instance profiles
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam create-role --role-name R --assume-role-policy-document file://trust.json` | New role with its trust policy |
| `aws --endpoint-url http://localhost:4566 iam attach-role-policy --role-name R --policy-arn ARN` | Its permissions |
| `aws --endpoint-url http://localhost:4566 iam get-role --role-name R --query Role.AssumeRolePolicyDocument` | Read the trust policy |
| `aws --endpoint-url http://localhost:4566 iam update-assume-role-policy --role-name R --policy-document file://trust.json` | Change who may assume it |
| `aws --endpoint-url http://localhost:4566 iam create-instance-profile --instance-profile-name P` | Container for EC2 |
| `aws --endpoint-url http://localhost:4566 iam add-role-to-instance-profile --instance-profile-name P --role-name R` | Put the role in |
| `aws --endpoint-url http://localhost:4566 ec2 run-instances … --iam-instance-profile Name=P` | Launch with the role |
| `aws --endpoint-url http://localhost:4566 ec2 describe-iam-instance-profile-associations` | Which instance has which profile |

### Service-linked roles
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam create-service-linked-role --aws-service-name autoscaling.amazonaws.com` | Create |
| `aws --endpoint-url http://localhost:4566 iam delete-service-linked-role --role-name NAME` | Start deletion (returns a task ID) |
| `aws --endpoint-url http://localhost:4566 iam get-service-linked-role-deletion-status --deletion-task-id ID` | Check it |
