## Users, groups and roles: giving the right identity the right permissions

**Lab tier: 🟡 Partially supported in Floci.** Groups, permission inheritance, paths, tags, roles, instance profiles, EC2 instances with roles and service-linked roles all work, and every command below was run with AWS CLI 2.35.9 against Floci 2.4.0 on 2026-11-07. **Floci doesn't check trust policies:** any caller can assume any role. Step 5 shows that openly, and the lesson explains what real AWS does instead.

> As in lesson 27, permissions are checked with the **IAM policy simulator**, because Floci doesn't enforce IAM on other calls. Work in one Terminal window: step 4 saves the instance ID in `$INSTANCE` for step 7.

### Step 1: Groups for teams, users in groups

~~~bash
mkdir -p ~/ama-ugr && cd ~/ama-ugr
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-group --group-name ama-l3-ugr-developers --path /eng/ --query Group.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-group --group-name ama-l3-ugr-oncall --path /eng/ --query Group.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam attach-group-policy --group-name ama-l3-ugr-developers --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam attach-group-policy --group-name ama-l3-ugr-oncall --policy-arn arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess
for u in arjun sneha; do aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-user --user-name ama-l3-ugr-$u --path /eng/ --tags Key=team,Value=payments --query User.Arn --output text; done
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam add-user-to-group --group-name ama-l3-ugr-developers --user-name ama-l3-ugr-arjun
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam add-user-to-group --group-name ama-l3-ugr-developers --user-name ama-l3-ugr-sneha
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam add-user-to-group --group-name ama-l3-ugr-oncall --user-name ama-l3-ugr-arjun
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-group --group-name ama-l3-ugr-developers --query 'Users[].UserName' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam list-groups-for-user --user-name ama-l3-ugr-arjun --query 'Groups[].GroupName' --output text
~~~

~~~text
arn:aws:iam::000000000000:group/eng/ama-l3-ugr-developers
arn:aws:iam::000000000000:group/eng/ama-l3-ugr-oncall
arn:aws:iam::000000000000:user/eng/ama-l3-ugr-arjun
arn:aws:iam::000000000000:user/eng/ama-l3-ugr-sneha
ama-l3-ugr-arjun	ama-l3-ugr-sneha
ama-l3-ugr-developers	ama-l3-ugr-oncall
~~~

Two groups, each with one AWS managed policy: **developers** can read S3, **oncall** can read CloudWatch metrics. Both users joined *developers*; only Arjun joined *oncall*. The policies are attached to the **groups**, not to the people. Groups are not identities: you can't sign in as a group or use one in a trust policy.

### Step 2: Permissions add up, and leave with the group

~~~bash
can() { read -r d1 d2 d3 <<< "$(aws --endpoint-url http://localhost:4566 --region ap-south-1 iam simulate-principal-policy --policy-source-arn arn:aws:iam::000000000000:user/eng/ama-l3-ugr-$1 --action-names s3:GetObject cloudwatch:GetMetricData ec2:RunInstances --query 'EvaluationResults[].EvalDecision' --output text)"; printf '%-6s %-13s %-25s %s\n' "$1" "$d1" "$d2" "$d3"; }
printf '%-6s %-13s %-25s %s\n' user s3:GetObject cloudwatch:GetMetricData ec2:RunInstances
can arjun; can sneha
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam remove-user-from-group --group-name ama-l3-ugr-oncall --user-name ama-l3-ugr-arjun
echo '--- arjun leaves the on-call rota'
can arjun
~~~

~~~text
user   s3:GetObject  cloudwatch:GetMetricData  ec2:RunInstances
arjun  allowed       allowed                   implicitDeny
sneha  allowed       implicitDeny              implicitDeny
--- arjun leaves the on-call rota
arjun  allowed       implicitDeny              implicitDeny
~~~

- A user's permissions are the **union** of their own policies and every group's policies. Arjun gets S3 (developers) **plus** CloudWatch (oncall); Sneha gets only S3.
- Nobody has `ec2:RunInstances`: no group allows it, so the default deny applies.
- Removing Arjun from *oncall* removed the CloudWatch permission instantly, without touching a single policy. That is why permissions go on groups: joining or leaving a team is one command.

### Step 3: Paths and tags organise identities

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam list-users --path-prefix /eng/ --query 'Users[].[UserName,Path]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam list-groups --path-prefix /eng/ --query 'Groups[].GroupName' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam list-user-tags --user-name ama-l3-ugr-sneha --query 'Tags[].[Key,Value]' --output text
~~~

~~~text
ama-l3-ugr-arjun	/eng/
ama-l3-ugr-sneha	/eng/
ama-l3-ugr-developers	ama-l3-ugr-oncall
team	payments
~~~

The `/eng/` **path** lets you list (and write policies for) a whole department, for example `arn:aws:iam::ACCOUNT:user/eng/*`. **Tags** add attributes such as team or cost centre; lesson 29 and "IAM in depth" use tags in policy conditions (attribute-based access control).

### Step 4: A role for EC2, delivered by an instance profile

Applications shouldn't use a person's access keys. An EC2 instance gets permissions from a **role**, whose **trust policy** says who may assume it: here, the EC2 service.

~~~bash
cat > ec2-trust.json <<'JSON'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}
JSON
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-role --role-name ama-l3-ugr-web --description 'Web servers read the menu bucket' --assume-role-policy-document file://ec2-trust.json --query Role.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam attach-role-policy --role-name ama-l3-ugr-web --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-instance-profile --instance-profile-name ama-l3-ugr-web --query InstanceProfile.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam add-role-to-instance-profile --instance-profile-name ama-l3-ugr-web --role-name ama-l3-ugr-web
AMI=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-images --query 'Images[0].ImageId' --output text)
INSTANCE=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 run-instances --image-id "$AMI" --instance-type t3.micro --iam-instance-profile Name=ama-l3-ugr-web --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ama-l3-ugr-web-1}]' --query 'Instances[0].InstanceId' --output text); echo "$INSTANCE"
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-iam-instance-profile-associations --filters Name=instance-id,Values="$INSTANCE" --query 'IamInstanceProfileAssociations[].[State,IamInstanceProfile.Arn]' --output text
~~~

~~~text
arn:aws:iam::000000000000:role/ama-l3-ugr-web
arn:aws:iam::000000000000:instance-profile/ama-l3-ugr-web
i-16a4c5e0cb4823bd2
associated	arn:aws:iam::000000000000:instance-profile/ama-l3-ugr-web
~~~

1. The trust policy's principal is `{"Service":"ec2.amazonaws.com"}`: only EC2 may assume this role.
2. The role's **permissions policy** (`AmazonS3ReadOnlyAccess`) says what the instance may do.
3. EC2 can't use a role directly; it uses an **instance profile**, a container holding exactly one role. (The console creates one with the same name for you; the CLI makes you do it.)
4. The instance launched with the profile shows the association `associated`. On real AWS, code on that instance gets **temporary, automatically rotated credentials** from the instance metadata service, and the SDKs and CLI find them with no configuration and no keys on disk.

### Step 5: A role for another AWS account, with an external ID

A partner company (account `111122223333`) needs to audit your account. You don't create users for them; you create a role **they** can assume:

~~~bash
cat > partner-trust.json <<'JSON'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow",
 "Principal":{"AWS":"arn:aws:iam::111122223333:root"},
 "Action":"sts:AssumeRole",
 "Condition":{"StringEquals":{"sts:ExternalId":"ama-partner-7731"}}}]}
JSON
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-role --role-name ama-l3-ugr-partner-audit --max-session-duration 3600 --assume-role-policy-document file://partner-trust.json --query Role.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam attach-role-policy --role-name ama-l3-ugr-partner-audit --policy-arn arn:aws:iam::aws:policy/SecurityAudit
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-role --role-name ama-l3-ugr-partner-audit --query 'Role.AssumeRolePolicyDocument.Statement[0].{TrustedAccount:Principal.AWS,ExternalId:Condition.StringEquals."sts:ExternalId"}' --output table
echo '--- Floci only: assuming it from this account without the external ID (real AWS answers AccessDenied)'
aws --endpoint-url http://localhost:4566 --region ap-south-1 sts assume-role --role-arn arn:aws:iam::000000000000:role/ama-l3-ugr-partner-audit --role-session-name no-external-id --query AssumedRoleUser.Arn --output text
~~~

~~~text
arn:aws:iam::000000000000:role/ama-l3-ugr-partner-audit
--------------------------------------------------------
|                        GetRole                       |
+-------------------+----------------------------------+
|    ExternalId     |         TrustedAccount           |
+-------------------+----------------------------------+
|  ama-partner-7731 |  arn:aws:iam::111122223333:root  |
+-------------------+----------------------------------+
--- Floci only: assuming it from this account without the external ID (real AWS answers AccessDenied)
arn:aws:sts::000000000000:assumed-role/ama-l3-ugr-partner-audit/no-external-id
~~~

- `"Principal":{"AWS":"arn:aws:iam::111122223333:root"}` trusts the **partner account**; the partner's own admins then decide which of their people may use it.
- The **external ID** condition protects against the *confused deputy* problem: a third-party service that assumes roles for many customers must pass the secret ID you agreed, so another customer can't trick it into using your role.
- `SecurityAudit` gives read-only access to security configuration. Sessions last at most one hour (`--max-session-duration 3600`).

**The last command shows a Floci gap.** It succeeded even though the caller is not the partner account and gave no external ID. On real AWS the trust policy is checked first, and that call fails with `AccessDenied … is not authorized to perform: sts:AssumeRole`. Never treat a role that "works in Floci" as proof that its trust policy is correct.

### Step 6: Service-linked roles belong to the service

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-service-linked-role --aws-service-name autoscaling.amazonaws.com --query 'Role.[RoleName,Path]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam update-assume-role-policy --role-name AWSServiceRoleForAutoScaling --policy-document file://ec2-trust.json
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-role --role-name AWSServiceRoleForAutoScaling
~~~

~~~text
AWSServiceRoleForAutoScaling	/aws-service-role/autoscaling.amazonaws.com/

aws: [ERROR]: An error occurred (UnmodifiableEntity) when calling the UpdateAssumeRolePolicy operation: Role AWSServiceRoleForAutoScaling is a service-linked role for autoscaling.amazonaws.com; request the change through that service.

aws: [ERROR]: An error occurred (UnmodifiableEntity) when calling the DeleteRole operation: Role AWSServiceRoleForAutoScaling is a service-linked role for autoscaling.amazonaws.com; request the change through that service.
~~~

A **service-linked role** is created for (or by) an AWS service, lives under the path `/aws-service-role/SERVICE/`, and has a trust policy and permissions **defined by AWS**. You can't edit or delete it directly (`UnmodifiableEntity`); the service manages it, which prevents you from accidentally breaking that service. Many services create theirs automatically the first time you use them.

### Step 7: Clean up, in dependency order

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-group --group-name ama-l3-ugr-developers
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 terminate-instances --instance-ids "$INSTANCE" --query 'TerminatingInstances[0].CurrentState.Name' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam remove-role-from-instance-profile --instance-profile-name ama-l3-ugr-web --role-name ama-l3-ugr-web
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-instance-profile --instance-profile-name ama-l3-ugr-web
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam detach-role-policy --role-name ama-l3-ugr-web --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam detach-role-policy --role-name ama-l3-ugr-partner-audit --policy-arn arn:aws:iam::aws:policy/SecurityAudit
for r in ama-l3-ugr-web ama-l3-ugr-partner-audit; do aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-role --role-name $r; done
TASK=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-service-linked-role --role-name AWSServiceRoleForAutoScaling --query DeletionTaskId --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-service-linked-role-deletion-status --deletion-task-id "$TASK" --query Status --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam detach-group-policy --group-name ama-l3-ugr-developers --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam detach-group-policy --group-name ama-l3-ugr-oncall --policy-arn arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess
for u in arjun sneha; do aws --endpoint-url http://localhost:4566 --region ap-south-1 iam remove-user-from-group --group-name ama-l3-ugr-developers --user-name ama-l3-ugr-$u; done
for g in developers oncall; do aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-group --group-name ama-l3-ugr-$g; done
for u in arjun sneha; do aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-user --user-name ama-l3-ugr-$u; done
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-account-summary --query 'SummaryMap.{Users:Users,Groups:Groups,Roles:Roles,InstanceProfiles:InstanceProfiles}' --output text
cd ~ && rm -r ~/ama-ugr
~~~

~~~text
aws: [ERROR]: An error occurred (DeleteConflict) when calling the DeleteGroup operation: Cannot delete entity, must detach all policies first.
shutting-down
SUCCEEDED
0	0	0	0
~~~

IAM refuses to delete a group with attached policies (`DeleteConflict`). The working order is: instance, profile membership, profile, role policies, roles, the service-linked role (deleted through a **deletion task**, which reports `SUCCEEDED`), group policies, group members, groups, users. The final summary shows zero users, groups, roles and instance profiles.

### Floci vs. real AWS
- **Trust policies are not evaluated.** Any caller can assume any role, with or without an external ID (step 5). Real AWS returns `AccessDenied` unless the trust policy allows the caller. The simulator in Floci also can't evaluate trust policies.
- **Invalid principals are accepted.** Floci accepted a trust policy naming a **group** as principal; real AWS rejects it with `MalformedPolicyDocument … Invalid principal in policy`, because groups aren't principals.
- **Instance profiles:** Floci allowed adding a second role to one instance profile and deleting a role that was still in a profile; real AWS refuses both (`LimitExceeded` and `DeleteConflict`).
- **Instance credentials:** on real AWS the instance's code receives role credentials from the instance metadata service; this lesson doesn't log in to the Floci instance.
- **Groups, inheritance, paths, tags, `UnmodifiableEntity` on service-linked roles and the deletion task** behaved as on real AWS.
