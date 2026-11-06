## Build a small organization: OUs, accounts and a Region guardrail

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-06. Floci models Organizations, OUs, member accounts and SCPs, including AWS's rules about deletion order. It **doesn't enforce SCPs** (Floci doesn't enforce IAM permissions at all; see lesson 13), and new accounts are only records, not separate environments.

> Organizations is a **global** service, so every command uses `--region us-east-1`. Work in **one Terminal window** inside an empty folder (`mkdir -p ~/ama-org && cd ~/ama-org`): later steps reuse `$ROOT`, `$WORK`, `$SANDBOX`, `$PROD`, `$DEV` and `$SCP`. Step 7 removes the organization completely; other labs expect Floci to have none.

### Step 1: Which account am I in?
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 sts get-caller-identity --query '{Account:Account,Arn:Arn}' --output table
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations describe-organization
~~~

~~~text
----------------------------------------------------
|                 GetCallerIdentity                |
+---------------+----------------------------------+
|    Account    |               Arn                |
+---------------+----------------------------------+
|  000000000000 |  arn:aws:iam::000000000000:root  |
+---------------+----------------------------------+

aws: [ERROR]: An error occurred (AWSOrganizationsNotInUseException) when calling the DescribeOrganization operation: Your account is not a member of an organization.
~~~

You're the **root** identity of a standalone account. (On Floci the `test` credentials act as root. In a real account you should **never** work as root.)

### Step 2: Create the organization
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations create-organization --feature-set ALL \
  --query 'Organization.{Id:Id,Features:FeatureSet,Management:MasterAccountId}' --output table
ROOT=$(aws --endpoint-url http://localhost:4566 --region us-east-1 organizations list-roots --query 'Roots[0].Id' --output text)
echo $ROOT
~~~

~~~text
----------------------------------------------
|             CreateOrganization             |
+----------+----------------+----------------+
| Features |      Id        |  Management    |
+----------+----------------+----------------+
|  ALL     |  o-0364ja2cp1  |  000000000000  |
+----------+----------------+----------------+
r-r657
~~~

Your account is now the **management account**. `ALL` features enables SCPs and other policies (the alternative, consolidated billing only, doesn't). Your IDs will differ.

### Step 3: Create two OUs
~~~bash
WORK=$(aws --endpoint-url http://localhost:4566 --region us-east-1 organizations create-organizational-unit --parent-id $ROOT \
  --name ama-l1-workloads --query OrganizationalUnit.Id --output text)
SANDBOX=$(aws --endpoint-url http://localhost:4566 --region us-east-1 organizations create-organizational-unit --parent-id $ROOT \
  --name ama-l1-sandbox --query OrganizationalUnit.Id --output text)
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations list-organizational-units-for-parent --parent-id $ROOT \
  --query 'OrganizationalUnits[].{Name:Name,Id:Id}' --output table
~~~

~~~text
------------------------------------------
|    ListOrganizationalUnitsForParent    |
+-------------------+--------------------+
|        Id         |       Name         |
+-------------------+--------------------+
|  ou-r657-pknxlsr5 |  ama-l1-workloads  |
|  ou-r657-vi924t4d |  ama-l1-sandbox    |
+-------------------+--------------------+
~~~

### Step 4: Create two member accounts
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations create-account --email shop-prod@example.com \
  --account-name ama-l1-shop-prod --query 'CreateAccountStatus.[AccountName,State]' --output text
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations create-account --email shop-dev@example.com \
  --account-name ama-l1-shop-dev --query 'CreateAccountStatus.[AccountName,State]' --output text
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations list-accounts \
  --query 'Accounts[].{Name:Name,Id:Id,Status:Status}' --output table
PROD=$(aws --endpoint-url http://localhost:4566 --region us-east-1 organizations list-accounts --query 'Accounts[?Name==`ama-l1-shop-prod`].Id' --output text)
DEV=$(aws --endpoint-url http://localhost:4566 --region us-east-1 organizations list-accounts --query 'Accounts[?Name==`ama-l1-shop-dev`].Id' --output text)
~~~

~~~text
ama-l1-shop-prod	SUCCEEDED
ama-l1-shop-dev	SUCCEEDED
--------------------------------------------------
|                  ListAccounts                  |
+---------------+----------------------+---------+
|      Id       |        Name          | Status  |
+---------------+----------------------+---------+
|  000000000000 |  management-account  |  ACTIVE |
|  452733742654 |  ama-l1-shop-prod    |  ACTIVE |
|  784443087885 |  ama-l1-shop-dev     |  ACTIVE |
+---------------+----------------------+---------+
~~~

Each account has its own 12-digit ID and needs a **unique email address** (that becomes its root user). In real AWS, Organizations also creates a role called `OrganizationAccountAccessRole` in each new account so administrators can manage it.

### Step 5: Put each account in its OU
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations move-account --account-id $PROD --source-parent-id $ROOT --destination-parent-id $WORK
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations move-account --account-id $DEV --source-parent-id $ROOT --destination-parent-id $SANDBOX
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations list-accounts-for-parent --parent-id $WORK --query 'Accounts[].Name' --output text
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations list-accounts-for-parent --parent-id $SANDBOX --query 'Accounts[].Name' --output text
~~~

~~~text
ama-l1-shop-prod
ama-l1-shop-dev
~~~

### Step 6: A guardrail: production stays in India
Create `deny-outside-india.json`:

~~~json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyOutsideIndia",
    "Effect": "Deny",
    "NotAction": ["iam:*", "organizations:*", "sts:*", "support:*", "budgets:*", "cloudfront:*", "route53:*"],
    "Resource": "*",
    "Condition": {"StringNotEquals": {"aws:RequestedRegion": ["ap-south-1", "ap-south-2"]}}
  }]
}
~~~

Enable SCPs, create the policy, and attach it to the workloads OU:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations enable-policy-type --root-id $ROOT \
  --policy-type SERVICE_CONTROL_POLICY --query 'Root.PolicyTypes[].[Type,Status]' --output text
SCP=$(aws --endpoint-url http://localhost:4566 --region us-east-1 organizations create-policy --name ama-l1-india-only \
  --type SERVICE_CONTROL_POLICY --description "Only Mumbai and Hyderabad" --content file://deny-outside-india.json \
  --query Policy.PolicySummary.Id --output text)
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations attach-policy --policy-id $SCP --target-id $WORK
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations list-policies-for-target --target-id $WORK \
  --filter SERVICE_CONTROL_POLICY --query 'Policies[].Name' --output text
~~~

~~~text
SERVICE_CONTROL_POLICY	ENABLED
FullAWSAccess	ama-l1-india-only
~~~

The OU now has two SCPs: AWS's default `FullAWSAccess` (allow everything) and yours (deny outside India). Because **deny wins**, anyone in `ama-l1-shop-prod`, even its root user and administrators, could only use Mumbai and Hyderabad (in real AWS). `ama-l1-shop-dev` is in the sandbox OU and isn't affected.

### Step 7: Take it apart, in the right order
Try the shortcut first:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations delete-organization
~~~

~~~text
aws: [ERROR]: An error occurred (OrganizationNotEmptyException) when calling the DeleteOrganization operation: The organization still contains accounts other than the management account. Remove them before deleting the organization.
~~~

Refused. Dismantle it step by step:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations detach-policy --policy-id $SCP --target-id $WORK
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations delete-policy --policy-id $SCP
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations move-account --account-id $PROD --source-parent-id $WORK --destination-parent-id $ROOT
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations move-account --account-id $DEV --source-parent-id $SANDBOX --destination-parent-id $ROOT
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations delete-organizational-unit --organizational-unit-id $WORK
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations delete-organizational-unit --organizational-unit-id $SANDBOX
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations remove-account-from-organization --account-id $PROD
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations remove-account-from-organization --account-id $DEV
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations delete-organization
aws --endpoint-url http://localhost:4566 --region us-east-1 organizations describe-organization
~~~

~~~text
aws: [ERROR]: An error occurred (AWSOrganizationsNotInUseException) when calling the DescribeOrganization operation: Your account is not a member of an organization.
~~~

All commands before the last print nothing on success. The final error proves the organization is gone and Floci is back to a standalone account.

### Floci vs. real AWS
- **SCPs aren't enforced.** Floci stores and attaches them, but (like all IAM on Floci) doesn't block requests. In real AWS the SCP would deny any non-global action outside ap-south-1/ap-south-2 in shop-prod.
- **Account creation** is instant on Floci (`SUCCEEDED`). Real `create-account` is asynchronous: it returns `IN_PROGRESS`, and you poll `describe-create-account-status`. Real accounts are full, separate AWS accounts with their own root user.
- **Removing accounts:** Floci removed the accounts immediately. In real AWS, an account can only leave if it can stand alone (payment method, contact details, signed agreement), so accounts created by Organizations are usually **closed** with `close-account` instead.
- **Account names:** Floci calls the management account `management-account`; in real AWS it has the name you gave it at sign-up.
- **Matched real AWS:** `AWSOrganizationsNotInUseException`, `OrganizationNotEmptyException`, the root/OU/account hierarchy, `FullAWSAccess` attached by default, and the dismantling order.
