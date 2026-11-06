## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws ec2 describe-regions` | Lists Regions usable in the account |
| `aws ec2 describe-regions --all-regions` | Also lists opt-in Regions that aren't enabled |
| `aws ec2 describe-regions --all-regions --region-names a b c` | Shows specific Regions |
| `aws ec2 describe-availability-zones --region ap-south-1` | Lists a Region's AZs with names and zone IDs |
| `aws s3api get-bucket-location --bucket …` | Shows which Region a bucket lives in |
| `aws cloudfront create-distribution --origin-domain-name …` | Creates a CDN distribution in front of an origin |
| `aws cloudfront get-distribution --id …` | Shows its domain, status and configuration |
| `aws cloudfront get-distribution-config --id …` | Downloads the editable configuration (and ETag) |
| `aws cloudfront update-distribution --id … --distribution-config file://… --if-match ETAG` | Changes it, e.g. disable |
| `aws cloudfront delete-distribution --id … --if-match ETAG` | Deletes a disabled distribution |
| `aws account enable-region --region-name ap-south-2` | Enables an opt-in Region (real AWS only) |

### `--region` vs. the Region you're asking about
`--region` sets **which Regional endpoint** the CLI calls. `describe-availability-zones --region us-east-1` lists **N. Virginia's** AZs. Forgetting `--region` uses your profile's default, a common cause of "my resources disappeared" (they're in another Region).

### Try it yourself
1. List the AZs of `us-east-1` and `eu-west-1`. Compare their zone IDs with Mumbai's.
2. Create a bucket in `eu-west-1` called `ama-l1-geo-eu` and confirm its location. Delete it.
3. In which Region would you put a shop for customers in Germany, and why? Use the four questions from "Why".
