## Feel "on-demand self-service" for yourself

**Lab tier: ✅ Verified executable in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-04.

You'll create a cloud storage resource, put a file in it, look at it, and delete it, all in under a minute and without asking anyone. That's the cloud in one experience.

We use **Amazon S3** (Simple Storage Service), AWS's storage for files. You'll study S3 in depth later. For now you only need two words:
- **Bucket**: a container for files. Think of it as a top-level folder.
- **Object**: a file stored in a bucket.

### Before you start
Open Terminal and check that Floci is running:

~~~bash
docker ps --filter name=floci
~~~

You should see a container named `floci` with status `Up … (healthy)`. If it isn't listed, start it with `docker start floci`.

> **Important habit:** every command in this lab includes `--endpoint-url http://localhost:4566`. This sends the request to **Floci on your Mac**. Without it, the AWS CLI would try to reach **real AWS**.

### Step 1: Create a bucket (provisioning on demand)

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 mb s3://ama-l1-my-first-bucket
~~~

Expected output:

~~~text
make_bucket: ama-l1-my-first-bucket
~~~

A storage resource now exists. It took well under a second, and you didn't need permission from a person.

### Step 2: List your buckets

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 ls
~~~

Expected output (your date and time will differ):

~~~text
2026-11-04 13:14:25 ama-l1-my-first-bucket
~~~

### Step 3: Upload a file

~~~bash
echo "Hello from my first cloud resource" > hello.txt
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 cp hello.txt s3://ama-l1-my-first-bucket/hello.txt
~~~

Expected output ends with:

~~~text
upload: ./hello.txt to s3://ama-l1-my-first-bucket/hello.txt
~~~

### Step 4: See what's stored (measured service)

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 ls s3://ama-l1-my-first-bucket/
~~~

~~~text
2026-11-04 13:14:26         35 hello.txt
~~~

`35` is the size in bytes. In real AWS you'd be billed per byte stored and per request, which is exactly the **measured service** characteristic.

### Step 5: Give it back (release)

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 rb s3://ama-l1-my-first-bucket --force
~~~

~~~text
delete: s3://ama-l1-my-first-bucket/hello.txt
remove_bucket: ama-l1-my-first-bucket
~~~

The resource is gone. In real AWS, the meter would stop too.

### What you just experienced

| Characteristic | Where you saw it |
|---|---|
| On-demand self-service | Step 1: created instantly by you alone |
| Broad network access | You used a standard tool (the CLI) over HTTP |
| Measured service | Step 4: size shown per object, which is the basis for billing |
| Rapid elasticity | Created and released in seconds |
| Resource pooling | You didn't choose a disk; the service decided where to store it |

> **Floci vs real AWS, honestly:** Floci is **more permissive** than AWS in places. For example, Floci accepted the bucket name `Bad_Name`, which real AWS rejects because bucket names must be lowercase. Always follow real AWS rules even when Floci lets something through.
