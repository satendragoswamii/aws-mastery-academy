## Choose where your data physically lives

**Lab tier: ✅ Verified executable in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-04.

**Scenario:** a school in Pune must keep student marks in India. You'll look at the Mumbai Region's Availability Zones, then create storage that lives **only** in Mumbai, and prove it.

> **Important habit:** every command includes `--endpoint-url http://localhost:4566` so it goes to **Floci on your Mac**.

### Step 1: See the data-centre groups in Mumbai

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-availability-zones \
  --query 'AvailabilityZones[].[ZoneName,ZoneId,State]' --output table
~~~

Expected output:

~~~text
------------------------------------------
|        DescribeAvailabilityZones       |
+-------------+------------+-------------+
|  ap-south-1a|  aps1-az1  |  available  |
|  ap-south-1b|  aps1-az2  |  available  |
|  ap-south-1c|  aps1-az3  |  available  |
+-------------+------------+-------------+
~~~

Each row is an **Availability Zone**: one or more data centres with their own power, cooling and network. The **ZoneName** (`ap-south-1a`) is the label you use. The **ZoneId** (`aps1-az1`) names the physical zone.

### Step 2: Create a bucket in Mumbai
`--region ap-south-1` sends the request to the Mumbai Region, and `LocationConstraint` tells S3 to store the bucket there.

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api create-bucket \
  --bucket ama-l1-india-only \
  --create-bucket-configuration LocationConstraint=ap-south-1
~~~

Expected output (Floci):

~~~text
{
    "Location": "/ama-l1-india-only"
}
~~~

### Step 3: Prove where it lives

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api get-bucket-location --bucket ama-l1-india-only
~~~

Expected output:

~~~text
{
    "LocationConstraint": "ap-south-1"
}
~~~

This is the evidence an auditor would ask for: the bucket is in the Mumbai Region.

### Step 4: Store a file in it

~~~bash
echo "Student marks, class 10-B" > /tmp/marks.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 cp /tmp/marks.txt s3://ama-l1-india-only/marks.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api head-object \
  --bucket ama-l1-india-only --key marks.txt --query '{Size:ContentLength,Type:ContentType}'
~~~

Expected output:

~~~text
upload: ../../../tmp/marks.txt to s3://ama-l1-india-only/marks.txt
{
    "Size": 26,
    "Type": "text/plain"
}
~~~

(The `upload:` path is shown relative to your current folder, so yours may look different.)

The 26-byte file now sits on disks in a Mumbai data centre (in real AWS; in Floci, on your Mac). S3 automatically stores copies across multiple AZs in the Region, so losing one data centre doesn't lose the file. **It never leaves the Region unless you copy it out.**

> **Why is us-east-1 different?** If you run `get-bucket-location` on a bucket created in `us-east-1`, it returns `"LocationConstraint": null`. us-east-1 was S3's original Region, and its buckets have no location constraint. Floci copies this real AWS quirk.

### Step 5: Clean up

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rm s3://ama-l1-india-only/marks.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rb s3://ama-l1-india-only
rm /tmp/marks.txt
~~~

Expected output:

~~~text
delete: s3://ama-l1-india-only/marks.txt
remove_bucket: ama-l1-india-only
~~~

### Floci vs. real AWS
- **Location in the create response:** real AWS returns a full URL (for example `http://ama-l1-india-only.s3.amazonaws.com/`); Floci returns `/ama-l1-india-only`. The bucket's Region is the same either way.
- **Number of AZs:** Floci shows three AZs in every Region. Real Regions have at least three; some have more (us-east-1 has six).
- **AZ name mapping:** in real AWS, `ap-south-1a` in your account may be a different physical zone from `ap-south-1a` in someone else's. AWS shuffles the names per account so that everyone doesn't pile into "a". The **ZoneId** is the same for everyone, so use it when coordinating between accounts.
- **Physical reality:** in Floci all "Regions" and "AZs" are on your Mac. Your data isn't really in Mumbai. The API behaviour is what you're learning.
