## IAM from absolute zero: a new account, its first user, MFA and the allow/deny rules

**Lab tier: 🟢 Fully supported in Floci** for every command below. These exact commands were run with AWS CLI 2.35.9 and Node.js 24 against Floci 2.4.0 on 2026-11-07. Two things Floci does differently from real AWS are listed at the end; they don't change any output shown here.

> **Important about Floci:** Floci stores IAM users and policies but **does not enforce them** on other API calls. That is why this lesson checks permissions with the **IAM policy simulator**, which runs AWS's real evaluation rules. On real AWS, the same decisions are enforced on every request.

Work in one Terminal window: step 4 saves the MFA device's serial number in `$SERIAL`, and step 7 uses it.

### Step 1: What a brand-new account contains

~~~bash
mkdir -p ~/ama-iam && cd ~/ama-iam
aws --endpoint-url http://localhost:4566 --region ap-south-1 sts get-caller-identity --query Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-account-summary --query 'SummaryMap.{Users:Users,Groups:Groups,Roles:Roles,MFADevices:MFADevices,RootMFA:AccountMFAEnabled}' --output table
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam list-users --query 'Users[].UserName' --output text
~~~

~~~text
arn:aws:iam::000000000000:root
-------------------------------------------------------
|                  GetAccountSummary                  |
+--------+--------------+--------+----------+---------+
| Groups | MFADevices   | Roles  | RootMFA  |  Users  |
+--------+--------------+--------+----------+---------+
|  0     |  0           |  0     |  0       |  0      |
+--------+--------------+--------+----------+---------+
~~~

You are signed in as `…:root`, the **root user**: the identity created with the account, which can do everything and can't be limited by IAM policies. The summary shows **zero** users, groups, roles and MFA devices, and `list-users` prints nothing. IAM starts empty: until you create identities and grant permissions, only root can do anything. `RootMFA 0` means the root user has no MFA yet; on a real account, fixing that is job number one.

### Step 2: Name the account and set a password policy

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-account-alias --account-alias ama-lab-academy
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam list-account-aliases --query 'AccountAliases[0]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-account-password-policy
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam update-account-password-policy --minimum-password-length 14 --require-uppercase-characters --require-lowercase-characters --require-numbers --require-symbols --max-password-age 90 --password-reuse-prevention 5
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-account-password-policy --query 'PasswordPolicy.{MinLength:MinimumPasswordLength,MaxAgeDays:MaxPasswordAge,Remember:PasswordReusePrevention,Symbols:RequireSymbols}' --output table
~~~

~~~text
ama-lab-academy

aws: [ERROR]: An error occurred (NoSuchEntity) when calling the GetAccountPasswordPolicy operation: The account policy with name PasswordPolicy cannot be found.
----------------------------------------------------
|             GetAccountPasswordPolicy             |
+-------------+-------------+-----------+----------+
| MaxAgeDays  |  MinLength  | Remember  | Symbols  |
+-------------+-------------+-----------+----------+
|  90         |  14         |  5        |  True    |
+-------------+-------------+-----------+----------+
~~~

- An **account alias** gives the console sign-in page a friendly address (`https://ama-lab-academy.signin.aws.amazon.com/console` on real AWS) instead of the 12-digit account ID. Aliases are unique worldwide.
- A new account has **no password policy** (`NoSuchEntity`), so AWS's minimal default applies. The policy we set requires 14+ characters with all four character types, expires passwords after 90 days, and remembers the last 5 so they can't be reused.

### Step 3: The first IAM user, with a console password

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-user --user-name ama-l3-iam-priya --query User.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-login-profile --user-name ama-l3-iam-priya --password 'priya123'
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-login-profile --user-name ama-l3-iam-priya --password 'Lab-Only-Pass-2026!' --password-reset-required --query 'LoginProfile.[UserName,PasswordResetRequired]' --output text
~~~

~~~text
arn:aws:iam::000000000000:user/ama-l3-iam-priya

aws: [ERROR]: An error occurred (PasswordPolicyViolation) when calling the CreateLoginProfile operation: Password does not conform to the account password policy. It must contain: a minimum length of 14, at least one uppercase letter, at least one non-alphanumeric character.
ama-l3-iam-priya	True
~~~

Creating a user only creates an **identity**: no password, no keys, no permissions. `create-login-profile` gives it a **console password**. The weak password was rejected by the policy from step 2 (Floci enforces it exactly as AWS does). The strong one was accepted with `--password-reset-required`, so Priya must choose her own password at first sign-in, and the admin never knows it.

### Step 4: Multi-factor authentication (MFA)

A password can be stolen. MFA adds a second proof: a 6-digit code from a device only Priya has. Here a short Node.js script plays the part of the authenticator app on her phone. It uses only Node's built-in `crypto` module (standard TOTP, RFC 6238), so nothing is installed:

~~~bash
SERIAL=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-virtual-mfa-device --virtual-mfa-device-name ama-l3-iam-priya --outfile mfa-seed.txt --bootstrap-method Base32StringSeed --query VirtualMFADevice.SerialNumber --output text); echo "$SERIAL"
chmod 600 mfa-seed.txt && echo "seed saved: $(wc -c < mfa-seed.txt | tr -d ' ') characters (not printed)"
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam enable-mfa-device --user-name ama-l3-iam-priya --serial-number "$SERIAL" --authentication-code1 123456 --authentication-code2 654321
cat > totp.mjs <<'JS'
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
const b32 = readFileSync(process.argv[2], 'utf8').trim().replace(/=+$/, '');
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = '';
for (const c of b32) bits += A.indexOf(c).toString(2).padStart(5, '0');
const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
const code = (step) => {
  const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', key).update(msg).digest(); const o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, '0');
};
const now = Math.floor(Date.now() / 1000 / 30);
console.log(code(now - 1), code(now));
JS
read C1 C2 <<< "$(node totp.mjs mfa-seed.txt)"; echo "two consecutive codes: $C1 $C2"
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam enable-mfa-device --user-name ama-l3-iam-priya --serial-number "$SERIAL" --authentication-code1 "$C1" --authentication-code2 "$C2"
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam list-mfa-devices --user-name ama-l3-iam-priya --query 'MFADevices[].SerialNumber' --output text
~~~

~~~text
arn:aws:iam::000000000000:mfa/ama-l3-iam-priya
seed saved: 32 characters (not printed)

aws: [ERROR]: An error occurred (InvalidAuthenticationCode) when calling the EnableMFADevice operation: Invalid MFA one time pass code.
two consecutive codes: 532976 659605
arn:aws:iam::000000000000:mfa/ama-l3-iam-priya
~~~

1. `create-virtual-mfa-device` created the device and saved its **secret seed** to `mfa-seed.txt`. The seed is as sensitive as a password: we restricted the file (`chmod 600`) and never printed it. A phone app would receive the same seed by scanning a QR code.
2. Made-up codes were rejected with `InvalidAuthenticationCode`: Floci really checks them.
3. Two **consecutive** codes computed from the seed were accepted, proving the device and AWS share the same secret and clock. Your codes will differ; they change every 30 seconds.
4. The device is now listed for the user. From now on, Priya's console sign-in needs her password **and** a code.

### Step 5: Authentication is not authorization

Priya can now **prove who she is** (authentication). What she may **do** (authorization) is a separate question, decided by policies. The simulator evaluates three requests as her:

~~~bash
can() { aws --endpoint-url http://localhost:4566 --region ap-south-1 iam simulate-principal-policy --policy-source-arn arn:aws:iam::000000000000:user/ama-l3-iam-priya --action-names s3:ListAllMyBuckets dynamodb:Scan sqs:DeleteQueue --query 'EvaluationResults[].[EvalActionName,EvalDecision]' --output text; }
echo '--- 1. no policies'; can
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam attach-user-policy --user-name ama-l3-iam-priya --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
echo '--- 2. ReadOnlyAccess attached'; can
cat > no-dynamodb-scan.json <<'JSON'
{"Version":"2012-10-17","Statement":[{"Effect":"Deny","Action":"dynamodb:Scan","Resource":"*"}]}
JSON
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam put-user-policy --user-name ama-l3-iam-priya --policy-name no-dynamodb-scan --policy-document file://no-dynamodb-scan.json
echo '--- 3. plus an explicit Deny'; can
~~~

~~~text
--- 1. no policies
s3:ListAllMyBuckets	implicitDeny
dynamodb:Scan	implicitDeny
sqs:DeleteQueue	implicitDeny
--- 2. ReadOnlyAccess attached
s3:ListAllMyBuckets	allowed
dynamodb:Scan	allowed
sqs:DeleteQueue	implicitDeny
--- 3. plus an explicit Deny
s3:ListAllMyBuckets	allowed
dynamodb:Scan	explicitDeny
sqs:DeleteQueue	implicitDeny
~~~

This is the core IAM rule, in three stages:
1. **Default deny.** With no policies, every request is `implicitDeny`. A new user can sign in but can do nothing.
2. **Explicit allow.** Attaching the AWS managed policy `ReadOnlyAccess` allowed listing buckets and scanning tables, but deleting a queue is still denied because nothing allows it.
3. **Explicit deny wins.** An inline policy denying `dynamodb:Scan` overrides the allow: `explicitDeny`. No allow anywhere can undo an explicit deny.

~~~text
request --> any explicit Deny?  --yes--> DENIED (explicitDeny)
               | no
               v
            any Allow?          --no---> DENIED (implicitDeny, the default)
               | yes
               v
            ALLOWED
~~~

### Step 6: Require MFA for dangerous actions

Policies can look at **how** someone signed in. The condition key `aws:MultiFactorAuthPresent` is `true` only when the session was created with MFA:

~~~bash
cat > mfa-for-terminate.json <<'JSON'
{"Version":"2012-10-17","Statement":[
 {"Effect":"Allow","Action":"ec2:*","Resource":"*"},
 {"Effect":"Deny","Action":"ec2:TerminateInstances","Resource":"*",
  "Condition":{"BoolIfExists":{"aws:MultiFactorAuthPresent":"false"}}}]}
JSON
for mfa in false true; do
  echo "signed in with MFA=$mfa: $(aws --endpoint-url http://localhost:4566 --region ap-south-1 iam simulate-custom-policy --policy-input-list "$(cat mfa-for-terminate.json)" --action-names ec2:DescribeInstances ec2:TerminateInstances --context-entries ContextKeyName=aws:MultiFactorAuthPresent,ContextKeyValues=$mfa,ContextKeyType=boolean --query 'EvaluationResults[].[EvalActionName,EvalDecision]' --output text | tr '\n' ' ')"
done
~~~

~~~text
signed in with MFA=false: ec2:DescribeInstances	allowed ec2:TerminateInstances	explicitDeny 
signed in with MFA=true: ec2:DescribeInstances	allowed ec2:TerminateInstances	allowed 
~~~

Reading instances is allowed either way, but **terminating** them is denied unless the person used MFA. `BoolIfExists` also denies when the key is missing (as with long-term access keys), which is the safe choice. This pattern protects destructive actions even if a password or key leaks.

### Step 7: Clean up, in the right order

IAM refuses to delete a user who still has things attached:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-user --user-name ama-l3-iam-priya
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam deactivate-mfa-device --user-name ama-l3-iam-priya --serial-number "$SERIAL"
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-virtual-mfa-device --serial-number "$SERIAL"
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-login-profile --user-name ama-l3-iam-priya
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam detach-user-policy --user-name ama-l3-iam-priya --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-user-policy --user-name ama-l3-iam-priya --policy-name no-dynamodb-scan
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-user --user-name ama-l3-iam-priya
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-account-password-policy
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-account-alias --account-alias ama-lab-academy
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-account-summary --query 'SummaryMap.[Users,MFADevices]' --output text
cd ~ && rm -r ~/ama-iam
~~~

~~~text
aws: [ERROR]: An error occurred (DeleteConflict) when calling the DeleteUser operation: Cannot delete entity, must detach all policies first.
0	0
~~~

The first `delete-user` failed with `DeleteConflict`. A user must first lose its MFA devices, login profile, access keys, attached and inline policies, and group memberships. After that, the account is back to zero users and MFA devices, the password policy and alias are gone, and the lab folder, including the MFA seed, is deleted.

### Floci vs. real AWS
- **IAM is not enforced in Floci.** Users, policies and MFA are stored and validated, but other API calls succeed whatever the policies say. The simulator gives the real decisions.
- **MFA in sessions:** Floci accepts a wrong MFA code in `sts get-session-token`; real AWS rejects it. Enabling a device (step 4) does check codes in both.
- **QR codes:** `create-virtual-mfa-device --bootstrap-method QRCodePNG` writes no file in Floci, so this lesson uses the Base32 seed. On real AWS, the console shows a QR code to scan with an authenticator app.
- **Root user:** Floci's caller is always the root identity of account `000000000000`. On a real account, you would use root only for the few tasks that need it.
