## Console and CLI: two windows onto the same API

**Lab tier: 🟡 Partially supported in Floci.** These steps were run against Floci 2.4.0 and the Floci UI on 2026-11-06 (the clicks were reproduced with a browser-automation script, and the CLI output below is real). The **Floci UI is not the AWS console**: it looks different and has fewer features. What it shares with the AWS console is the important part: it's a client of the same API as the CLI.

> You need the Floci UI running at **http://localhost:4500** (it starts with Floci). Keep a Terminal window and a browser side by side.

### Step 1: Tour the console
Open **http://localhost:4500** in your browser. Find these parts, all of which have an equivalent in the real AWS console:

| Floci UI | Real AWS console equivalent |
|---|---|
| Left menu: COMPUTE, STORAGE, DATABASES, NETWORKING… | **Services** menu, grouped by category |
| Search box at the top ("Search services, features, docs, and more", shortcut `/`) | **Search bar** at the top |
| **Console Home** with service cards and resource counts | **Console Home** with widgets |
| "Connected" indicator (top right) | Account menu (account ID, identity) and **Region selector** |

### Step 2: Create a bucket in the console
1. In the left menu click **Storage**.
2. Click **Create bucket**.
3. Type the bucket name `ama-l1-console-made`. Leave **Region** as *Default*. Notice the hint: "3-63 characters. Lowercase letters, numbers, dots, and hyphens", the same S3 naming rules the API enforces.
4. Click the blue **Create bucket** button.

The bucket appears in the table:

~~~text
Name                  Type    Cloud  Region  Created At
ama-l1-console-made   bucket  aws    -       2026-11-06T15:48:51.000Z
~~~

### Step 3: See it from the CLI
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3api list-buckets \
  --query 'Buckets[?starts_with(Name,`ama-l1-console`)].[Name,CreationDate]' --output table
~~~

~~~text
------------------------------------------------------
|                     ListBuckets                    |
+----------------------+-----------------------------+
|  ama-l1-console-made |  2026-11-06T15:48:51+00:00  |
+----------------------+-----------------------------+
~~~

Same bucket, same creation time. The console didn't create a "console bucket"; it called **CreateBucket**, exactly like the CLI would.

### Step 4: Now the other way: create with the CLI
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3api create-bucket --bucket ama-l1-console-cli --output text
printf 'Hello from the CLI\n' > hello.txt
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 cp hello.txt s3://ama-l1-console-cli/hello.txt --no-progress
~~~

~~~text
/ama-l1-console-cli
upload: ./hello.txt to s3://ama-l1-console-cli/hello.txt
~~~

### Step 5: See it in the console
1. In the Storage page click **Refresh**. Both buckets are listed:

   ~~~text
   ama-l1-console-cli    bucket  aws  -  2026-11-06T15:48:53.000Z
   ama-l1-console-made   bucket  aws  -  2026-11-06T15:48:51.000Z
   ~~~

2. Click **ama-l1-console-cli**. The details panel shows the bucket's properties and, under **OBJECTS**:

   ~~~text
   0 folders, 1 objects
   Name       Type    Size   Last Modified
   hello.txt  object  19 B   2026-11-06T15:48:54.000Z
   ~~~

The file you uploaded from the Terminal is visible in the browser: 19 bytes, the length of "Hello from the CLI" plus a newline.

### Step 6: Delete in the console
In the row for **ama-l1-console-made**, click the red **trash** icon, then **Confirm**. The bucket disappears from the table. Check from the CLI (it now lists only the CLI bucket):

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3api list-buckets \
  --query 'Buckets[?starts_with(Name,`ama-l1-console`)].Name' --output text
~~~

~~~text
ama-l1-console-cli
~~~

Like the real console, the Floci UI asks you to **confirm** destructive actions. (The real AWS console makes you type the bucket name.)

### Step 7: Clean up with the CLI
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 rb s3://ama-l1-console-cli --force
aws --endpoint-url http://localhost:4566 --region us-east-1 s3api list-buckets \
  --query 'Buckets[?starts_with(Name,`ama-l1-console`)].Name' --output text
~~~

~~~text
delete: s3://ama-l1-console-cli/hello.txt
remove_bucket: ama-l1-console-cli
~~~

`--force` empties the bucket before removing it. The last command prints nothing: both buckets are gone.

### Floci vs. real AWS
- **Different console.** The Floci UI is a separate open-source local console. The real AWS console has sign-in, a Region selector on every page, an account menu, CloudShell, AWS Health and far more options per service.
- **No sign-in or permissions.** The Floci UI connects with Floci's `test` credentials. The real console uses your identity, and IAM decides what each button may do.
- **Region column:** the Floci UI shows `-` for bucket Regions. The real S3 console shows each bucket's Region (these buckets would be in US East (N. Virginia)).
- **No CloudTrail record** on Floci (`lookup-events` returned nothing in our test). In real AWS both creates would appear as `CreateBucket` events, with the console one marked by its user agent.
- **Matched the real behaviour that matters:** console-created resources are visible to the CLI immediately and vice versa, the bucket-name rules are the same, and destructive actions need confirmation.
