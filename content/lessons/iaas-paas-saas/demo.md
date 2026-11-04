## Two ways to get a database: IaaS versus serverless

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-04. DynamoDB works fully in Floci. EC2 is simulated: instances get IDs, AZs and states, but no real OS boots, so step 2 is about **what you'd have to do**, not doing it.

**Scenario:** your online shop needs somewhere to store orders. You'll start down the IaaS road, then do the same job with a serverless database, and compare the work.

> **Important habit:** every command includes `--endpoint-url http://localhost:4566`.

### Part 1: The IaaS road (Amazon EC2)

#### Step 1: Launch a server for the database

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 run-instances \
  --image-id ami-0abcdef1234567891 --instance-type t3.micro \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ama-l1-iaas-db-server}]' \
  --query 'Instances[0].{Id:InstanceId,Image:ImageId,Type:InstanceType,AZ:Placement.AvailabilityZone,State:State.Name}' \
  --output table
~~~

Expected output (your ID and AZ may differ):

~~~text
------------------------------------
|           RunInstances           |
+--------+-------------------------+
|  AZ    |  ap-south-1b            |
|  Id    |  i-76992a555d3df7766    |
|  Image |  ami-0abcdef1234567891  |
|  State |  pending                |
|  Type  |  t3.micro               |
+--------+-------------------------+
~~~

You had to choose an **operating system image**, a **size**, and (implicitly) an **AZ**. You now have a bare Linux server.

#### Step 2: The to-do list you've just signed up for
Nothing to type here. On real AWS, before storing a single order you would still have to:

1. Connect to the instance and **install** a database (e.g. PostgreSQL).
2. Configure it, create users, and lock down network access.
3. Set up **backups** and test restoring them.
4. Schedule **OS and database patching**, forever.
5. Watch **disk space** and resize as data grows.
6. Build a **replica in another AZ** if the shop must survive a data-centre failure.

That's IaaS: full control, full responsibility. Keep a note of your instance ID for clean-up.

### Part 2: The serverless road (Amazon DynamoDB)

#### Step 3: Create a table
On-demand mode means no capacity to plan: you pay per request.

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb create-table \
  --table-name ama-l1-orders \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --query 'TableDescription.[TableName,TableStatus,BillingModeSummary.BillingMode]' --output text
~~~

Expected output:

~~~text
ama-l1-orders	ACTIVE	PAY_PER_REQUEST
~~~

You chose a **name** and a **key**. No OS, no size, no AZ, no software to install. (In real AWS the status is `CREATING` for a few seconds first; Floci goes straight to `ACTIVE`. In scripts, `aws dynamodb wait table-exists --table-name ama-l1-orders` waits correctly on both.)

#### Step 4: Store an order

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb put-item \
  --table-name ama-l1-orders \
  --item '{"orderId":{"S":"ORD-1001"},"customer":{"S":"Asha"},"total":{"N":"499"}}'
~~~

No output means success. Each attribute has a type: `S` for string, `N` for number.

#### Step 5: Read it back

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb get-item \
  --table-name ama-l1-orders --key '{"orderId":{"S":"ORD-1001"}}' --output json
~~~

Expected output:

~~~text
{
    "Item": {
        "orderId": {
            "S": "ORD-1001"
        },
        "customer": {
            "S": "Asha"
        },
        "total": {
            "N": "499"
        }
    }
}
~~~

#### Step 6: What does AWS show you about this database?

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb describe-table --table-name ama-l1-orders \
  --query 'Table.{Name:TableName,Status:TableStatus,Billing:BillingModeSummary.BillingMode,Items:ItemCount,Key:KeySchema[0].AttributeName}' \
  --output table
~~~

Expected output:

~~~text
--------------------------------------------------------------------
|                           DescribeTable                          |
+------------------+--------+----------+-----------------+---------+
|      Billing     | Items  |   Key    |      Name       | Status  |
+------------------+--------+----------+-----------------+---------+
|  PAY_PER_REQUEST |  1     |  orderId |  ama-l1-orders  |  ACTIVE |
+------------------+--------+----------+-----------------+---------+
~~~

Notice what **isn't** there: no server, no OS version, no disk size, no patch level. Those are AWS's problem now.

### Step 7: Clean up both

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 terminate-instances \
  --instance-ids i-76992a555d3df7766 --query 'TerminatingInstances[0].CurrentState.Name' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-table \
  --table-name ama-l1-orders --query 'TableDescription.[TableName,TableStatus]' --output text
~~~

Use **your** instance ID. Expected output:

~~~text
shutting-down
ama-l1-orders	ACTIVE
~~~

### The comparison
| | EC2 (IaaS) | DynamoDB (serverless) |
|---|---|---|
| Decisions before storing data | OS image, size, AZ, DB software, storage, backups, HA | Table name, key |
| Ongoing work | Patching, backups, scaling, monitoring disks | Mostly designing your data access |
| Pay when idle | Yes, per second while running | Storage only, requests are pay-per-use |
| Control | Total | Limited to what the API offers |

### Floci vs. real AWS
- **EC2** is simulated: no OS boots, so you can't install PostgreSQL in this lab.
- **Table status:** real AWS shows `CREATING` before `ACTIVE`, and `DELETING` after `delete-table`. Floci shows `ACTIVE` in both responses.
- **ItemCount:** real DynamoDB updates `ItemCount` only about every six hours, so a new table usually shows `0` right after a write. Floci counts instantly. Never use `ItemCount` as a live counter.
