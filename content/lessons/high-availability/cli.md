## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws ec2 describe-subnets` | Lists subnets and their AZs (a load balancer needs subnets in 2+ AZs) |
| `aws elbv2 create-load-balancer --type application --subnets … …` | Creates an Application Load Balancer |
| `aws elbv2 create-target-group … --health-check-path … --health-check-interval-seconds …` | Creates a pool of targets and its health check |
| `aws elbv2 register-targets --target-group-arn … --targets Id=…` | Adds targets (instance IDs, IPs or Lambda functions) |
| `aws elbv2 describe-target-health --target-group-arn …` | Shows each target's health state and reason |
| `aws elbv2 deregister-targets …` | Removes targets |
| `aws elbv2 create-listener --load-balancer-arn … --port 80 --default-actions Type=forward,TargetGroupArn=…` | Tells the load balancer which port to accept and where to forward |
| `aws elbv2 delete-target-group` / `delete-load-balancer` | Clean-up |

### Find the subnets for two AZs
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-subnets \
  --query 'Subnets[].[SubnetId,AvailabilityZone,CidrBlock]' --output text
~~~

Output on Floci (order may differ):

~~~text
subnet-default-ap-south-1-b	ap-south-1b	172.31.16.0/20
subnet-default-ap-south-1-c	ap-south-1c	172.31.32.0/20
subnet-default-ap-south-1-a	ap-south-1a	172.31.0.0/20
~~~

Real AWS subnet IDs look like `subnet-0a1b2c3d4e5f67890`; Floci's default ones have readable names.

### Health-check settings
| Option | Default (ALB) | Notes |
|---|---|---|
| `--health-check-path` | `/` | Use a dedicated, cheap endpoint such as `/health` |
| `--health-check-interval-seconds` | 30 | 5–300 |
| `--health-check-timeout-seconds` | 5 | Must be shorter than the interval |
| `--healthy-threshold-count` | 5 | Successes needed to become healthy |
| `--unhealthy-threshold-count` | 2 | Failures needed to become unhealthy |
| `--matcher HttpCode=200-299` | 200 | Which response codes count as healthy |

With the defaults, a failed target is detected in about a minute (2 × 30 s), and a recovered one takes about 2.5 minutes to return (5 × 30 s). The demo used faster settings so you could watch it happen.

### Readable health output
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 describe-target-health --target-group-arn "$TG" \
  --query 'TargetHealthDescriptions[].{Port:Target.Port,State:TargetHealth.State,Reason:TargetHealth.Reason}' --output table
~~~

### Only the unhealthy ones
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 describe-target-health --target-group-arn "$TG" \
  --query 'TargetHealthDescriptions[?TargetHealth.State!=`healthy`].[Target.Id,Target.Port,TargetHealth.Reason]' --output text
~~~
