## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws ec2 describe-regions` | Lists the Regions enabled for your account |
| `aws ec2 describe-regions --all-regions` | Also lists Regions that exist but aren't enabled (opt-in Regions) |
| `aws ec2 describe-availability-zones` | Lists the AZs in the current Region (`--region`) |
| `aws s3api create-bucket --create-bucket-configuration LocationConstraint=<region>` | Creates a bucket in a specific Region |
| `aws s3api get-bucket-location --bucket <name>` | Shows which Region a bucket lives in |
| `aws s3api head-object --bucket <b> --key <k>` | Shows an object's metadata (size, type) without downloading it |

### `--region` decides where the request goes
The `--region` option (or `AWS_DEFAULT_REGION`, or the `region` in your profile) decides **which Region's endpoint** receives the request. It's the most important option after `--endpoint-url`:

~~~bash
# Same command, different data-centre groups:
aws --endpoint-url http://localhost:4566 --region us-east-1  ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output text
~~~

Output on Floci:

~~~text
us-east-1a	us-east-1b	us-east-1c
ap-south-1a	ap-south-1b	ap-south-1c
~~~

### Filtering Regions, and a gotcha
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 describe-regions \
  --query 'Regions[?starts_with(RegionName, `ap-south`)].RegionName' --output text
~~~

Output on Floci:

~~~text
ap-south-1	ap-southeast-1	ap-southeast-2
~~~

`starts_with('ap-south')` also matched **ap-southeast** (Singapore, Sydney). For an exact match use `RegionName=='ap-south-1'`.

Notice that **Hyderabad (`ap-south-2`) isn't listed.** Regions launched after March 2019, including Hyderabad, are **opt-in**: they appear in `describe-regions` only after an administrator enables them for the account. Ask for every Region and you'll see its status:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 describe-regions --all-regions \
  --query 'Regions[?RegionName==`ap-south-2`].[RegionName,OptInStatus]' --output text
~~~

Output on Floci (real AWS behaves the same for an account that hasn't enabled Hyderabad):

~~~text
ap-south-2	not-opted-in
~~~

### Habit
Check where you are before creating anything:

~~~bash
aws configure get region    # the default Region of your profile
~~~
