## Run a customer-side security baseline

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-06. Floci supports all the settings used here. It stores AWS Config rules but doesn't evaluate them, and it doesn't have AWS Artifact.

> **Account-wide settings:** steps 2–4 change settings for the whole (Floci) account. Step 6 puts every one of them back, because other labs expect the defaults. Don't skip it.

### Step 1: Audit: who left SSH open to the internet?
Finding risky configuration is your job. Search for security groups that allow port 22 from anywhere:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-security-groups \
  --filters Name=ip-permission.cidr,Values=0.0.0.0/0 Name=ip-permission.from-port,Values=22 \
  --query 'SecurityGroups[].{Group:GroupId,Name:GroupName,VPC:VpcId}' --output table
~~~

~~~text
----------------------------------------------------------------
|                    DescribeSecurityGroups                    |
+------------------------+----------+--------------------------+
|          Group         |  Name    |           VPC            |
+------------------------+----------+--------------------------+
|  sg-default-ap-south-1 |  default |  vpc-default-ap-south-1  |
+------------------------+----------+--------------------------+
~~~

Floci's own **default** security group allows SSH from anywhere. **Leave it alone**: it belongs to Floci, and other labs use it. In a real account, this finding would be yours to fix, and AWS would never fix it for you. (Real AWS default groups don't allow inbound traffic from the internet; see the end.)

### Step 2: A strong password policy for IAM users
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-account-password-policy
~~~

~~~text
aws: [ERROR]: An error occurred (NoSuchEntity) when calling the GetAccountPasswordPolicy operation: The account policy with name PasswordPolicy cannot be found.
~~~

No custom policy has been set. Set one:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam update-account-password-policy --minimum-password-length 14 \
  --require-uppercase-characters --require-lowercase-characters --require-numbers --require-symbols \
  --password-reuse-prevention 5 --max-password-age 90
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-account-password-policy \
  --query 'PasswordPolicy.{MinLength:MinimumPasswordLength,Symbols:RequireSymbols,Numbers:RequireNumbers,ReusePrevention:PasswordReusePrevention,MaxAgeDays:MaxPasswordAge}' --output table
~~~

~~~text
----------------------------------------------------------------------
|                      GetAccountPasswordPolicy                      |
+------------+------------+----------+-------------------+-----------+
| MaxAgeDays | MinLength  | Numbers  |  ReusePrevention  |  Symbols  |
+------------+------------+----------+-------------------+-----------+
|  90        |  14        |  True    |  5                |  True     |
+------------+------------+----------+-------------------+-----------+
~~~

### Step 3: Encrypt every new EBS volume
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 get-ebs-encryption-by-default --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 enable-ebs-encryption-by-default --output text
~~~

~~~text
False
True
~~~

Off by default; now on for this Region. Create a volume **without** asking for encryption:

~~~bash
VOL=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-volume --availability-zone ap-south-1a --size 1 \
  --tag-specifications 'ResourceType=volume,Tags=[{Key=Name,Value=ama-l1-srm-vol}]' --query VolumeId --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-volumes --volume-ids $VOL \
  --query 'Volumes[0].{Volume:VolumeId,Encrypted:Encrypted,Key:KmsKeyId}' --output table
~~~

~~~text
---------------------------------------------------------
|                    DescribeVolumes                    |
+-----------+-----------------+-------------------------+
| Encrypted |       Key       |         Volume          |
+-----------+-----------------+-------------------------+
|  True     |  alias/aws/ebs  |  vol-f85cabc6adf5ab53c  |
+-----------+-----------------+-------------------------+
~~~

Encrypted automatically with the AWS managed key `aws/ebs`. **AWS does the encrypting; you decided to require it.** That's the model in one example.

### Step 4: Block public S3 access for the whole account
Lesson 13 did this for one bucket. This does it for **every** bucket, current and future:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3control put-public-access-block --account-id 000000000000 \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3control get-public-access-block --account-id 000000000000 \
  --query PublicAccessBlockConfiguration --output table
~~~

~~~text
-----------------------------------
|      GetPublicAccessBlock       |
+-------------------------+-------+
|  BlockPublicAcls        |  True |
|  BlockPublicPolicy      |  True |
|  IgnorePublicAcls       |  True |
|  RestrictPublicBuckets  |  True |
+-------------------------+-------+
~~~

### Step 5: Let AWS Config watch for open SSH
Manual audits (step 1) get forgotten. An **AWS Config managed rule** checks continuously:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 configservice put-config-rule --config-rule \
  '{"ConfigRuleName":"ama-l1-no-open-ssh","Source":{"Owner":"AWS","SourceIdentifier":"INCOMING_SSH_DISABLED"},"Scope":{"ComplianceResourceTypes":["AWS::EC2::SecurityGroup"]}}'
aws --endpoint-url http://localhost:4566 --region ap-south-1 configservice describe-config-rules --config-rule-names ama-l1-no-open-ssh \
  --query 'ConfigRules[].{Rule:ConfigRuleName,Check:Source.SourceIdentifier,State:ConfigRuleState}' --output table
~~~

~~~text
-----------------------------------------------------------
|                   DescribeConfigRules                   |
+------------------------+----------------------+---------+
|          Check         |        Rule          |  State  |
+------------------------+----------------------+---------+
|  INCOMING_SSH_DISABLED |  ama-l1-no-open-ssh  |  ACTIVE |
+------------------------+----------------------+---------+
~~~

In real AWS (with a Config recorder running), this rule would mark the open security group from step 1 as **NON_COMPLIANT**. AWS provides the rule; turning it on and acting on it is yours.

### Step 6: Put the account back to its defaults
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 configservice delete-config-rule --config-rule-name ama-l1-no-open-ssh
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3control delete-public-access-block --account-id 000000000000
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-volume --volume-id $VOL
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 disable-ebs-encryption-by-default --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-account-password-policy
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-account-password-policy
~~~

~~~text
False

aws: [ERROR]: An error occurred (NoSuchEntity) when calling the GetAccountPasswordPolicy operation: The account policy with name PasswordPolicy cannot be found.
~~~

The final error proves the password policy is gone. **In a real account you would keep all of these settings on**; we only remove them because Floci is a shared practice environment.

### Floci vs. real AWS
- **Default security group:** Floci's default group allows SSH from `0.0.0.0/0`. A real AWS default security group allows inbound traffic only from itself (same group) and all outbound traffic.
- **Password policy:** real accounts without a custom policy also return `NoSuchEntity`, but AWS applies a basic default policy to IAM user passwords anyway.
- **Config rules aren't evaluated** on Floci (`get-compliance-details-by-config-rule` returned an empty list in our test). Real AWS Config also needs a configuration recorder, and charges per rule evaluation.
- **AWS Artifact** isn't available on Floci (`UnknownOperationException`). In real AWS, you open it in the console to download AWS's audit reports.
- **Matched real AWS:** EBS encryption-by-default behaviour (including the `aws/ebs` key), account-level Block Public Access and the password-policy fields.
