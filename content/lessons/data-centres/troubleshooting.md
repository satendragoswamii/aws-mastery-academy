## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `IllegalLocationConstraintException … The unspecified location constraint is incompatible for the region specific endpoint this request was sent to.` | You created a bucket outside us-east-1 without `--create-bucket-configuration LocationConstraint=<region>` | Add the location constraint, matching `--region` |
| `get-bucket-location` returns `null` | The bucket is in us-east-1 (normal, historical behaviour) | Nothing is wrong |
| A bucket exists in the wrong Region | Created with the wrong default Region | Buckets can't be moved. Create a new one in the right Region, copy the objects, verify, delete the old one |
| `describe-availability-zones` shows different zones than expected | `--region` or your default Region isn't what you think | Pass `--region` explicitly; check `aws configure get region` |
| A Region (e.g. `ap-south-2`) is missing from `describe-regions` | Opt-in Region not enabled for the account | `describe-regions --all-regions` shows it as `not-opted-in`. In real AWS an admin enables it in the account settings |
| `Could not connect to the endpoint URL` | Floci isn't running | `docker ps --filter name=floci`, then `docker start floci` if needed |

Reproduce the first error on Floci (it creates nothing):

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api create-bucket --bucket ama-l1-no-constraint
~~~

~~~text
aws: [ERROR]: An error occurred (IllegalLocationConstraintException) when calling the CreateBucket operation: The unspecified location constraint is incompatible for the region specific endpoint this request was sent to.
~~~

### Data-centre problems in the real world, and the design answer
| Event | Impact if you're in one AZ | Design answer |
|---|---|---|
| Power or cooling failure in one data centre | Outage | Run in 2+ AZs behind a load balancer |
| Fibre cut to one facility | Outage or degraded performance | Multi-AZ; AWS has redundant fibre between AZs |
| Regional disaster (flood, major grid failure) | Outage even with Multi-AZ | Cross-Region backup or disaster recovery |
| Regulator asks where data is stored | You can't answer confidently | Choose Regions deliberately; check with `get-bucket-location`; enforce with policies |
