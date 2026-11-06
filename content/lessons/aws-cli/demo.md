## A lab profile, output formats, queries, dry runs, skeletons and sync

**Lab tier: 🟢 Fully supported in Floci.** These exact commands were run with AWS CLI 2.35.9 against Floci 2.4.0 on 2026-11-06. Everything in this lesson is the CLI's own behaviour, which works the same against Floci and real AWS.

> **Your real AWS settings are never touched.** Step 1 points the CLI at two files **inside your lab folder** using `AWS_CONFIG_FILE` and `AWS_SHARED_CREDENTIALS_FILE`. They only apply in this Terminal window, and step 8 removes them. Work in **one window**: `mkdir -p ~/ama-cli && cd ~/ama-cli`.

### Step 1: Create a lab-only profile
~~~bash
aws --version
export AWS_CONFIG_FILE="$PWD/aws-config" AWS_SHARED_CREDENTIALS_FILE="$PWD/aws-credentials"
aws configure set aws_access_key_id test --profile ama-floci
aws configure set aws_secret_access_key test --profile ama-floci
aws configure set region ap-south-1 --profile ama-floci
aws configure set output json --profile ama-floci
cat aws-config aws-credentials
aws configure list --profile ama-floci
~~~

~~~text
aws-cli/2.35.9 Python/3.14.5 Darwin/27.0.0 exe/arm64
[profile ama-floci]
region = ap-south-1
output = json
[ama-floci]
aws_access_key_id = test
aws_secret_access_key = test
NAME       : VALUE                    : TYPE             : LOCATION
profile    : ama-floci                : manual           : --profile
access_key : ****************test     : shared-credentials-file : 
secret_key : ****************test     : shared-credentials-file : 
region     : ap-south-1               : config-file      : /Users/you/ama-cli/aws-config
~~~

`aws configure set` wrote two files: settings in `aws-config` (section `[profile ama-floci]`) and keys in `aws-credentials` (section `[ama-floci]`). `configure list` shows each value **and where it came from**. Your CLI version and path will differ.

### Step 2: Four ways to print the same answer
Select the profile for this window, then ask "who am I?" in each format:

~~~bash
export AWS_PROFILE=ama-floci
aws --endpoint-url http://localhost:4566 sts get-caller-identity --output json
aws --endpoint-url http://localhost:4566 sts get-caller-identity --output text
aws --endpoint-url http://localhost:4566 sts get-caller-identity --output yaml
aws --endpoint-url http://localhost:4566 sts get-caller-identity --output table
~~~

~~~text
{
    "UserId": "000000000000",
    "Account": "000000000000",
    "Arn": "arn:aws:iam::000000000000:root"
}
000000000000	arn:aws:iam::000000000000:root	000000000000
Account: '000000000000'
Arn: arn:aws:iam::000000000000:root
UserId: '000000000000'
--------------------------------------------------------------------
|                         GetCallerIdentity                        |
+--------------+----------------------------------+----------------+
|    Account   |               Arn                |    UserId      |
+--------------+----------------------------------+----------------+
|  000000000000|  arn:aws:iam::000000000000:root  |  000000000000  |
+--------------+----------------------------------+----------------+
~~~

No `--region` needed any more: it comes from the profile. **Make `sts get-caller-identity` a habit before any risky command.**

### Step 3: Ask precise questions with `--query`
Which Regions start with `ap-south-`, and are they opt-in?

~~~bash
aws --endpoint-url http://localhost:4566 ec2 describe-regions --all-regions \
  --query 'Regions[?starts_with(RegionName,`ap-south-`)].{Region:RegionName,OptIn:OptInStatus}' --output table
~~~

~~~text
---------------------------------------
|           DescribeRegions           |
+----------------------+--------------+
|         OptIn        |   Region     |
+----------------------+--------------+
|  opt-in-not-required |  ap-south-1  |
|  not-opted-in        |  ap-south-2  |
+----------------------+--------------+
~~~

> **Watch the hyphen.** With `` `ap-south` `` (no hyphen) the filter also matches `ap-southeast-1`… because those names *start with* "ap-south" too. We got 9 rows that way when testing this lesson.

Count the European Regions, and find Mumbai's AZ with the highest zone ID:

~~~bash
aws --endpoint-url http://localhost:4566 ec2 describe-regions --all-regions --query 'length(Regions[?starts_with(RegionName,`eu-`)])'
aws --endpoint-url http://localhost:4566 ec2 describe-availability-zones --query 'sort_by(AvailabilityZones,&ZoneId)[-1].[ZoneName,ZoneId]' --output text
~~~

~~~text
8
ap-south-1c	aps1-az3
~~~

Filter (`[?…]`), function (`length`, `sort_by`), index (`[-1]` = last) and multi-select (`{…}`) cover most real needs.

### Step 4: Test before you act with `--dry-run`
~~~bash
aws --endpoint-url http://localhost:4566 ec2 run-instances --image-id ami-0abcdef1234567890 --instance-type t3.micro --dry-run
~~~

~~~text
aws: [ERROR]: An error occurred (DryRunOperation) when calling the RunInstances operation: Request would have succeeded, but DryRun flag is set.
~~~

An "error" that means **yes**: the request was valid and allowed, and nothing was launched. (If you lacked permission, real AWS would answer `UnauthorizedOperation` instead.)

### Step 5: Which Region wins?
The profile says `ap-south-1`. Add an environment variable, then a command-line option:

~~~bash
aws configure get region
AWS_REGION=eu-west-1 aws --endpoint-url http://localhost:4566 ec2 describe-availability-zones --query 'AvailabilityZones[0].RegionName' --output text
AWS_REGION=eu-west-1 aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 describe-availability-zones --query 'AvailabilityZones[0].RegionName' --output text
~~~

~~~text
ap-south-1
eu-west-1
us-east-1
~~~

**Command-line option > environment variable > profile.** (Writing `AWS_REGION=… aws …` on one line sets the variable for that command only.)

### Step 6: Build a command from a JSON skeleton
For commands with many parameters, generate a template:

~~~bash
aws --endpoint-url http://localhost:4566 sqs create-queue --generate-cli-skeleton > queue.json
cat queue.json
~~~

~~~text
{
    "QueueName": "",
    "Attributes": {
        "KeyName": ""
    },
    "tags": {
        "KeyName": ""
    }
}
~~~

Edit `queue.json` to this (any text editor, e.g. `nano queue.json`):

~~~json
{
    "QueueName": "ama-l1-cli-orders",
    "Attributes": {
        "VisibilityTimeout": "60",
        "MessageRetentionPeriod": "86400"
    },
    "tags": {
        "Owner": "shop-team"
    }
}
~~~

~~~bash
aws --endpoint-url http://localhost:4566 sqs create-queue --cli-input-json file://queue.json
aws --endpoint-url http://localhost:4566 sqs get-queue-attributes --queue-url http://localhost:4566/000000000000/ama-l1-cli-orders \
  --attribute-names VisibilityTimeout MessageRetentionPeriod --query Attributes
~~~

~~~text
{
    "QueueUrl": "http://localhost:4566/000000000000/ama-l1-cli-orders"
}
{
    "VisibilityTimeout": "60",
    "MessageRetentionPeriod": "86400"
}
~~~

The input file can be reviewed, version-controlled and reused: a first step towards infrastructure as code.

### Step 7: Sync a website folder to S3
~~~bash
aws --endpoint-url http://localhost:4566 s3 mb s3://ama-l1-cli-site
mkdir -p site && printf '<h1>Shop</h1>\n' > site/index.html && printf 'body{}\n' > site/style.css && printf 'About us\n' > site/about.html
aws --endpoint-url http://localhost:4566 s3 sync site s3://ama-l1-cli-site --no-progress
~~~

~~~text
make_bucket: ama-l1-cli-site
upload: site/index.html to s3://ama-l1-cli-site/index.html
upload: site/about.html to s3://ama-l1-cli-site/about.html
upload: site/style.css to s3://ama-l1-cli-site/style.css
~~~

Now change **one** file and sync again:

~~~bash
printf '<h1>Shop - sale!</h1>\n' > site/index.html
aws --endpoint-url http://localhost:4566 s3 sync site s3://ama-l1-cli-site --no-progress
aws --endpoint-url http://localhost:4566 s3 ls s3://ama-l1-cli-site
~~~

~~~text
upload: site/index.html to s3://ama-l1-cli-site/index.html
2026-11-06 21:27:54          9 about.html
2026-11-06 21:27:57         22 index.html
2026-11-06 21:27:54          7 style.css
~~~

Only the changed file was uploaded. Run the sync a third time: it prints **nothing**, because nothing changed. (The order of the upload lines can vary.)

### Step 8: Clean up, including the lab profile
~~~bash
aws --endpoint-url http://localhost:4566 sqs delete-queue --queue-url http://localhost:4566/000000000000/ama-l1-cli-orders
aws --endpoint-url http://localhost:4566 s3 rb s3://ama-l1-cli-site --force
unset AWS_PROFILE AWS_CONFIG_FILE AWS_SHARED_CREDENTIALS_FILE
rm aws-config aws-credentials queue.json
~~~

~~~text
delete: s3://ama-l1-cli-site/about.html
delete: s3://ama-l1-cli-site/index.html
delete: s3://ama-l1-cli-site/style.css
remove_bucket: ama-l1-cli-site
~~~

The `unset` line returns your Terminal to its normal settings.

### Floci vs. real AWS
- **Same CLI behaviour.** Profiles, precedence, output formats, `--query`, skeletons and `s3 sync` are all features of the CLI itself and behave identically against real AWS.
- **Endpoint:** with real AWS you wouldn't pass `--endpoint-url`. (The CLI also supports an `endpoint_url` setting in a profile; this academy always passes the endpoint explicitly so a command can never reach real AWS by accident.)
- **Dry run:** Floci always answers `DryRunOperation` because it doesn't check permissions. Real AWS answers `UnauthorizedOperation` if you lack them.
- **Sync timing:** if you create files and sync them within the same second (for example in a script), a second sync may re-upload unchanged files, because S3 timestamps are whole seconds. We saw this when scripting the lesson; typing the commands by hand avoids it.
