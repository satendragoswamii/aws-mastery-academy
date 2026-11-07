## Independent assignment: ARNs for a clinic app

A clinic in Jaipur stores prescriptions in S3, appointment data in DynamoDB and sends reminders through SNS to an SQS queue.

### Part A: Read ARNs (no AWS needed)
For each ARN, name the partition, service, Region, account and resource, and say why any field is empty:
1. `arn:aws:s3:::clinic-rx/patients/p-104/rx.pdf`
2. `arn:aws:iam::123456789012:role/apps/clinic-api`
3. `arn:aws:sts::123456789012:assumed-role/clinic-api/req-77`
4. `arn:aws-cn:dynamodb:cn-north-1:123456789012:table/appointments`
5. `arn:aws:lambda:ap-south-1:123456789012:function:send-reminder:7`

### Part B: Build it on Floci
Use `--endpoint-url http://localhost:4566 --region ap-south-1` on every command.
1. Create bucket `ama-l2-clinic-rx`, table `ama-l2-clinic-appts` (key `apptId`), topic `ama-l2-clinic-reminders` and queue `ama-l2-clinic-sms`. Print each ARN.
2. Subscribe the queue to the topic using ARNs only, publish one message, and receive it from the queue.
3. Tag all four resources `app=clinic` in **one** command and list them by tag.
4. Write `clinic-policy.json` that allows: ListBucket on the bucket; GetObject only under `patients/`; PutItem on the table; Publish to the topic. Prove with the simulator: GetObject on `patients/p-104/rx.pdf` is allowed, on `billing/inv.pdf` is denied, and Publish to a topic in `eu-west-1` is denied.
5. Write a shell function `arnregion` that prints the Region of an ARN, or `global` if empty, and test it on three ARNs.
6. Untag, then delete everything.

### Part C: Explain (100–150 words)
Explain to a new developer why `"Resource": "*"` is dangerous, and how ARN patterns let you be precise without writing hundreds of policies.

### Self-assessment
- [ ] Every command had the endpoint and Region.
- [ ] The subscription used the queue ARN, not the URL.
- [ ] The simulator showed allowed, implicitDeny and implicitDeny.
- [ ] `arnregion` printed `global` for an S3 or IAM ARN.
- [ ] Nothing tagged `app=clinic` remained.
