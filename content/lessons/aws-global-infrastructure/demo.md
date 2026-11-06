## Explore Regions and AZs, then put the edge network in front of a bucket

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-06. Floci models Regions (with opt-in status), AZs with zone IDs, S3 bucket locations and CloudFront distributions, but nothing is physically distributed and no content is cached at an edge.

> Work in an empty folder (`mkdir -p ~/ama-geo && cd ~/ama-geo`) and **one Terminal window**: step 5 reuses `$DIST`.

### Step 1: How many Regions, and which need opting in?
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-regions --query 'length(Regions)'
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-regions --all-regions --query 'length(Regions)'
~~~

~~~text
17
34
~~~

17 Regions are usable straight away; with `--all-regions` you also see the opt-in ones. Look at a few:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-regions --all-regions \
  --region-names ap-south-1 ap-south-2 us-east-1 eu-west-1 me-central-1 \
  --query 'Regions[].{Region:RegionName,OptIn:OptInStatus}' --output table
~~~

~~~text
-----------------------------------------
|            DescribeRegions            |
+----------------------+----------------+
|         OptIn        |    Region      |
+----------------------+----------------+
|  opt-in-not-required |  ap-south-1    |
|  not-opted-in        |  ap-south-2    |
|  opt-in-not-required |  eu-west-1     |
|  not-opted-in        |  me-central-1  |
|  opt-in-not-required |  us-east-1     |
+----------------------+----------------+
~~~

Mumbai (2016) is enabled by default; Hyderabad (2022) and UAE (2022) are newer **opt-in** Regions.

### Step 2: Mumbai's Availability Zones
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-availability-zones \
  --query 'AvailabilityZones[].{Name:ZoneName,Id:ZoneId,Type:ZoneType,State:State}' --output table
~~~

~~~text
---------------------------------------------------------------
|                  DescribeAvailabilityZones                  |
+----------+--------------+------------+----------------------+
|    Id    |    Name      |   State    |        Type          |
+----------+--------------+------------+----------------------+
|  aps1-az1|  ap-south-1a |  available |  availability-zone   |
|  aps1-az2|  ap-south-1b |  available |  availability-zone   |
|  aps1-az3|  ap-south-1c |  available |  availability-zone   |
+----------+--------------+------------+----------------------+
~~~

Three AZs, each with a **name** (`ap-south-1a`) and a **zone ID** (`aps1-az1`). The `--region` you pass decides which Region you're asking about.

### Step 3: Data lives in the Region you choose
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api create-bucket --bucket ama-l1-geo-site \
  --create-bucket-configuration LocationConstraint=ap-south-1 --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api get-bucket-location --bucket ama-l1-geo-site --output text
~~~

~~~text
/ama-l1-geo-site
ap-south-1
~~~

The bucket and every object in it are stored in Mumbai. AWS doesn't move it to another Region unless you configure replication.

### Step 4: Put the edge network in front of it
~~~bash
DIST=$(aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront create-distribution \
  --origin-domain-name ama-l1-geo-site.s3.ap-south-1.amazonaws.com --query Distribution.Id --output text)
aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront get-distribution --id $DIST \
  --query 'Distribution.{Id:Id,Domain:DomainName,Status:Status,Origin:DistributionConfig.Origins.Items[0].DomainName,PriceClass:DistributionConfig.PriceClass}' --output table
~~~

~~~text
---------------------------------------------------------------
|                       GetDistribution                       |
+------------+------------------------------------------------+
|  Domain    |  eibhsl7j9j29ch.cloudfront.net                 |
|  Id        |  EIBHSL7J9J29CH                                |
|  Origin    |  ama-l1-geo-site.s3.ap-south-1.amazonaws.com   |
|  PriceClass|  PriceClass_All                                |
|  Status    |  Deployed                                      |
+------------+------------------------------------------------+
~~~

Users would now visit `….cloudfront.net` and be served from the **nearest edge location**, which fetches from the Mumbai bucket only on a cache miss. `PriceClass_All` means "use edge locations everywhere"; cheaper price classes leave out the most expensive areas. Your IDs will differ.

### Step 5: Clean up (and meet a CloudFront rule)
Try to delete the distribution straight away:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront delete-distribution --id $DIST \
  --if-match $(aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront get-distribution --id $DIST --query ETag --output text)
~~~

~~~text
aws: [ERROR]: An error occurred (DistributionNotDisabled) when calling the DeleteDistribution operation: The distribution you are trying to delete has not been disabled.
~~~

A distribution must be **disabled** first. Download its configuration, set `Enabled` to false, and send it back (`--if-match` passes the version tag, so you can't overwrite someone else's newer change):

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront get-distribution-config --id $DIST --query DistributionConfig > dist-config.json
python3 -c "import json; c=json.load(open('dist-config.json')); c['Enabled']=False; json.dump(c, open('dist-config.json','w'))"
aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront update-distribution --id $DIST --distribution-config file://dist-config.json \
  --if-match $(aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront get-distribution-config --id $DIST --query ETag --output text) \
  --query 'Distribution.DistributionConfig.Enabled'
~~~

~~~text
false
~~~

Now delete the distribution and the bucket, and check that nothing is left (the last command prints nothing):

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront delete-distribution --id $DIST \
  --if-match $(aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront get-distribution --id $DIST --query ETag --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api delete-bucket --bucket ama-l1-geo-site
aws --endpoint-url http://localhost:4566 --region us-east-1 cloudfront list-distributions --query 'DistributionList.Items[].Id' --output text
~~~

### Floci vs. real AWS
- **Region counts:** Floci lists 34 Regions. Real AWS has more (it adds Regions regularly); check the AWS Global Infrastructure page for today's number. Real `describe-regions` without `--all-regions` shows only Regions enabled in **your** account.
- **Opt-in filter:** on Floci, `--filters Name=opt-in-status,Values=not-opted-in` is ignored and returns all Regions; real AWS filters correctly. That's why step 1 uses `--region-names` instead.
- **AZs:** Floci gives every Region three AZs. Real us-east-1 has six, and some Regions have four. Real accounts may map AZ names to different zone IDs.
- **CloudFront:** Floci reports `Deployed` instantly and caches nothing. Real distributions take several minutes to deploy (`InProgress`), and disabling also takes minutes before delete is allowed. A real S3 origin should use **Origin Access Control** so the bucket stays private.
- **Local Zones, Wavelength and Outposts** aren't modelled by Floci.
- **Matched real AWS:** the `DistributionNotDisabled` error, the ETag (`--if-match`) workflow and the bucket location.
