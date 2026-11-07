## Access keys, rotation, temporary credentials and role profiles

**Lab tier: 🟢 Fully supported in Floci.** These exact commands were run with AWS CLI 2.35.9 against Floci 2.4.0 on 2026-11-07. Floci is more forgiving than real AWS in three places (see "Floci vs. real AWS" at the end); the commands are the same.

> **Your real AWS settings are never touched.** Step 1 points the CLI at two files **inside your lab folder**, clears any credential variables in this window, and every profile you create contains `endpoint_url = http://localhost:4566`. Step 7 also runs with `HOME="$PWD"` so the CLI's credential cache stays in the lab folder. Work in **one Terminal window**.

### Step 1: An isolated lab folder
~~~bash
mkdir -p ~/ama-creds && cd ~/ama-creds
export AWS_CONFIG_FILE="$PWD/aws-config" AWS_SHARED_CREDENTIALS_FILE="$PWD/aws-credentials"
unset AWS_PROFILE AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
aws configure set aws_access_key_id test --profile ama-admin
aws configure set aws_secret_access_key test --profile ama-admin
aws configure set region ap-south-1 --profile ama-admin
aws configure set endpoint_url http://localhost:4566 --profile ama-admin
export AWS_PROFILE=ama-admin
aws --endpoint-url http://localhost:4566 sts get-caller-identity --query Arn --output text
~~~

~~~text
arn:aws:iam::000000000000:root
~~~

`ama-admin` uses Floci's dummy `test` keys, which act as the account's root user. In a real account you would **never** use root keys; here it plays the administrator who creates a user for a developer.

### Step 2: Create a user and its first access key, without printing the secret
~~~bash
aws --endpoint-url http://localhost:4566 iam create-user --user-name ama-l2-cred-dev --query User.Arn --output text
read -r KEY1 SECRET1 <<< "$(aws --endpoint-url http://localhost:4566 iam create-access-key --user-name ama-l2-cred-dev --query 'AccessKey.[AccessKeyId,SecretAccessKey]' --output text)"
echo "New key: $KEY1 (secret is ${#SECRET1} characters, not shown)"
aws configure set aws_access_key_id "$KEY1" --profile ama-dev
aws configure set aws_secret_access_key "$SECRET1" --profile ama-dev
aws configure set region ap-south-1 --profile ama-dev
aws configure set endpoint_url http://localhost:4566 --profile ama-dev
unset SECRET1
aws --endpoint-url http://localhost:4566 --profile ama-dev sts get-caller-identity --query Arn --output text
aws configure list --profile ama-dev
~~~

~~~text
arn:aws:iam::000000000000:user/ama-l2-cred-dev
New key: AKIAHL9PPKOKZIS4E607 (secret is 40 characters, not shown)
arn:aws:iam::000000000000:user/ama-l2-cred-dev
NAME       : VALUE                    : TYPE             : LOCATION
profile    : ama-dev                  : manual           : --profile
access_key : ****************E607     : shared-credentials-file : 
secret_key : ****************Ijkl     : shared-credentials-file : 
region     : ap-south-1               : config-file      : /tmp/ama24/v/aws-config
~~~

An access key has two parts: the **access key ID** (`AKIA…`, like a username, safe to show) and the **secret access key** (40 characters, like a password). AWS shows the secret **only once**, at creation, so the command saved it straight into the profile instead of printing it. `get-caller-identity` with the new profile answered as the **user**, not root. `configure list` masks both values. (Your key IDs will differ.)

### Step 3: Look at a key's metadata
~~~bash
aws --endpoint-url http://localhost:4566 iam list-access-keys --user-name ama-l2-cred-dev --query 'AccessKeyMetadata[].[AccessKeyId,Status,CreateDate]' --output text
aws --endpoint-url http://localhost:4566 iam get-access-key-last-used --access-key-id "$KEY1" --query AccessKeyLastUsed --output json
~~~

~~~text
AKIAHL9PPKOKZIS4E607	Active	2026-11-07T04:01:19.447000+00:00
{
    "ServiceName": "N/A",
    "Region": "N/A"
}
~~~

You can always see a key's ID, status and age, but never its secret again. Real AWS fills in `LastUsedDate`, `ServiceName` and `Region`, which is how you find keys nobody uses any more; Floci leaves them as `N/A`.

### Step 4: Rotate the key without downtime
Rotation means: create a **second** key, switch to it, check it works, **deactivate** the old one, and finally **delete** it.

~~~bash
read -r KEY2 SECRET2 <<< "$(aws --endpoint-url http://localhost:4566 iam create-access-key --user-name ama-l2-cred-dev --query 'AccessKey.[AccessKeyId,SecretAccessKey]' --output text)"
aws --endpoint-url http://localhost:4566 iam create-access-key --user-name ama-l2-cred-dev --query AccessKey.AccessKeyId --output text
aws configure set aws_access_key_id "$KEY2" --profile ama-dev
aws configure set aws_secret_access_key "$SECRET2" --profile ama-dev
unset SECRET2
aws --endpoint-url http://localhost:4566 --profile ama-dev sts get-caller-identity --query Arn --output text
aws --endpoint-url http://localhost:4566 iam update-access-key --user-name ama-l2-cred-dev --access-key-id "$KEY1" --status Inactive
aws --endpoint-url http://localhost:4566 iam list-access-keys --user-name ama-l2-cred-dev --query 'AccessKeyMetadata[].[AccessKeyId,Status]' --output text
aws --endpoint-url http://localhost:4566 iam delete-access-key --user-name ama-l2-cred-dev --access-key-id "$KEY1"
aws --endpoint-url http://localhost:4566 iam list-access-keys --user-name ama-l2-cred-dev --query 'AccessKeyMetadata[].[AccessKeyId,Status]' --output text
~~~

~~~text
aws: [ERROR]: An error occurred (LimitExceeded) when calling the CreateAccessKey operation: Cannot exceed quota for AccessKeysPerUser: 2
arn:aws:iam::000000000000:user/ama-l2-cred-dev
AKIAGXABGXX7HY3Z1NH8	Active
AKIAHL9PPKOKZIS4E607	Inactive
AKIAGXABGXX7HY3Z1NH8	Active
~~~

The attempt at a **third** key failed: a user can have at most **2** access keys, exactly so you can rotate. Deactivating before deleting gives you an easy way back if something still used the old key. (The order of the two keys in the list can vary.)

### Step 5: The account's credential report
~~~bash
aws --endpoint-url http://localhost:4566 iam generate-credential-report --query State --output text
aws --endpoint-url http://localhost:4566 iam get-credential-report --query Content --output text | base64 --decode | cut -d, -f1,4,8,9,14
~~~

~~~text
COMPLETE
user,password_enabled,mfa_active,access_key_1_active,access_key_2_active
<root_account>,FALSE,FALSE,FALSE,FALSE
ama-l2-cred-dev,FALSE,FALSE,TRUE,FALSE
~~~

The report is a CSV with one row per user (plus the root account), decoded here from base64. The columns shown are user, `password_enabled`, `mfa_active`, `access_key_1_active` and `access_key_2_active`. Auditors use it to find users without MFA, old passwords and active keys. (On real AWS, run the generate command again if the report says it is still `STARTED`.)

### Step 6: Temporary credentials with AssumeRole
Create a read-only role that the developer is allowed to assume, then assume it **as the developer**:

~~~bash
printf '%s' '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::000000000000:user/ama-l2-cred-dev"},"Action":"sts:AssumeRole"}]}' > trust.json
aws --endpoint-url http://localhost:4566 iam create-role --role-name ama-l2-cred-readonly --assume-role-policy-document file://trust.json --max-session-duration 3600 --query Role.Arn --output text
aws --endpoint-url http://localhost:4566 iam attach-role-policy --role-name ama-l2-cred-readonly --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
read -r TMP_KEY TMP_SECRET TMP_TOKEN TMP_EXP <<< "$(aws --endpoint-url http://localhost:4566 --profile ama-dev sts assume-role --role-arn arn:aws:iam::000000000000:role/ama-l2-cred-readonly --role-session-name asha --duration-seconds 900 --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken,Expiration]' --output text)"
echo "Temporary key: $TMP_KEY  token: ${#TMP_TOKEN} characters  expires: $TMP_EXP"
env -u AWS_PROFILE AWS_ACCESS_KEY_ID="$TMP_KEY" AWS_SECRET_ACCESS_KEY="$TMP_SECRET" AWS_SESSION_TOKEN="$TMP_TOKEN" aws --endpoint-url http://localhost:4566 --region ap-south-1 sts get-caller-identity --query Arn --output text
unset TMP_KEY TMP_SECRET TMP_TOKEN TMP_EXP
aws --endpoint-url http://localhost:4566 --profile ama-dev sts assume-role --role-arn arn:aws:iam::000000000000:role/ama-l2-cred-readonly --role-session-name asha --duration-seconds 600
~~~

~~~text
arn:aws:iam::000000000000:role/ama-l2-cred-readonly
Temporary key: ASIAC9YDEYD7VAJOV8TK  token: 200 characters  expires: 2026-11-07T04:16:30.099000+00:00
arn:aws:sts::000000000000:assumed-role/ama-l2-cred-readonly/asha

aws: [ERROR]: An error occurred (ParamValidation): Parameter validation failed:
Invalid value for parameter DurationSeconds, value: 600, valid min value: 900
~~~

Temporary credentials have **three** parts: an access key ID starting with **`ASIA`** (long-term keys start with `AKIA`), a secret, and a **session token**, and they **expire** (here after 15 minutes, the minimum; times are in UTC). The caller is now `assumed-role/ama-l2-cred-readonly/asha`: the session name shows up in logs, so you can see who used the role. The last command shows the CLI refusing a duration below 900 seconds before anything is sent.

### Step 7: A role profile: the CLI assumes the role for you
~~~bash
aws configure set role_arn arn:aws:iam::000000000000:role/ama-l2-cred-readonly --profile ama-readonly
aws configure set source_profile ama-dev --profile ama-readonly
aws configure set role_session_name asha --profile ama-readonly
aws configure set duration_seconds 900 --profile ama-readonly
aws configure set region ap-south-1 --profile ama-readonly
aws configure set endpoint_url http://localhost:4566 --profile ama-readonly
grep -A6 'profile ama-readonly' aws-config
HOME="$PWD" aws --endpoint-url http://localhost:4566 --profile ama-readonly sts get-caller-identity --query Arn --output text
grep -o '"Expiration": "[^"]*"' .aws/cli/cache/*.json
~~~

~~~text
[profile ama-readonly]
role_arn = arn:aws:iam::000000000000:role/ama-l2-cred-readonly
source_profile = ama-dev
role_session_name = asha
duration_seconds = 900
region = ap-south-1
endpoint_url = http://localhost:4566
arn:aws:sts::000000000000:assumed-role/ama-l2-cred-readonly/asha
"Expiration": "2026-11-07T04:16:34.152000+00:00"
~~~

The `ama-readonly` profile holds **no keys**: it says "use `ama-dev`'s keys to assume this role". The CLI called AssumeRole itself, then **cached** the temporary credentials (in `.aws/cli/cache/`, here inside the lab folder because of `HOME="$PWD"`) and will reuse them until they expire. This is exactly how engineers switch into other accounts and roles every day.

> **Why `endpoint_url` is in every lab profile:** the AssumeRole call that a role profile makes **does not use the `--endpoint-url` option**. While writing this lesson, a role profile without `endpoint_url` sent its AssumeRole request to **real AWS STS**, which rejected the dummy Floci key with `InvalidClientTokenId`. The `endpoint_url` profile setting keeps that call on Floci.

### Step 8: Clean up
~~~bash
aws --endpoint-url http://localhost:4566 iam delete-access-key --user-name ama-l2-cred-dev --access-key-id "$KEY2"
aws --endpoint-url http://localhost:4566 iam delete-user --user-name ama-l2-cred-dev
aws --endpoint-url http://localhost:4566 iam detach-role-policy --role-name ama-l2-cred-readonly --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
aws --endpoint-url http://localhost:4566 iam delete-role --role-name ama-l2-cred-readonly
aws --endpoint-url http://localhost:4566 iam list-users --query 'length(Users[?starts_with(UserName,`ama-l2-cred`)])'
unset AWS_PROFILE AWS_CONFIG_FILE AWS_SHARED_CREDENTIALS_FILE KEY1 KEY2
cd ~ && rm -r ~/ama-creds
~~~

~~~text
0
~~~

A user's access keys must be deleted before the user, and a role's policies detached before the role. `rm -r` removed the lab profiles, the cached temporary credentials and `trust.json`.

### Floci vs. real AWS
- **Secrets and status aren't checked.** Floci recognises the user from the access key ID alone; it accepts a wrong secret and a key marked `Inactive`. Real AWS rejects them (`SignatureDoesNotMatch`, `InvalidClientTokenId`). That is why this lab never relies on a deactivated key failing.
- **Session duration:** the role's `--max-session-duration 3600` is not enforced by Floci (a 7,200-second request succeeded). Real AWS refuses longer sessions with a `ValidationError`. The 900-second minimum is checked by the CLI itself, so it is real.
- **Key last used:** real AWS records when, where and with which service a key was last used; Floci shows `N/A`.
- **Same CLI behaviour:** profiles, role profiles, `source_profile`, the credential cache and the 2-keys-per-user limit behave as on real AWS.
