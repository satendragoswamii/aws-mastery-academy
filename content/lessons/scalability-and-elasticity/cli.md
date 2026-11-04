## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws ec2 create-launch-template --launch-template-name … --launch-template-data '{…}'` | Creates the instance recipe |
| `aws ec2 delete-launch-template --launch-template-name …` | Deletes the recipe |
| `aws autoscaling create-auto-scaling-group … --min-size --max-size --desired-capacity` | Creates the group |
| `aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names …` | Shows sizes and instances |
| `aws autoscaling set-desired-capacity --auto-scaling-group-name … --desired-capacity N` | Scales manually |
| `aws autoscaling update-auto-scaling-group … --min-size … --max-size …` | Changes min and max |
| `aws autoscaling describe-scaling-activities --auto-scaling-group-name …` | History: what was launched or terminated, and why |
| `aws autoscaling put-scaling-policy … --policy-type TargetTrackingScaling` | Adds an automatic policy |
| `aws autoscaling describe-policies --auto-scaling-group-name …` | Lists policies |
| `aws autoscaling delete-auto-scaling-group … --force-delete` | Deletes the group and its instances |

### A target-tracking policy
This is how you'd make the demo group elastic in real AWS: keep average CPU near 50%.

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling put-scaling-policy \
  --auto-scaling-group-name ama-l1-web-asg --policy-name ama-l1-cpu50 \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{"PredefinedMetricSpecification":{"PredefinedMetricType":"ASGAverageCPUUtilization"},"TargetValue":50.0}' \
  --query 'PolicyARN' --output text
~~~

Output on Floci:

~~~text
arn:aws:autoscaling:ap-south-1:000000000000:scalingPolicy:ama-l1-web-asg:ama-l1-cpu50
~~~

Then list it:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling describe-policies \
  --auto-scaling-group-name ama-l1-web-asg \
  --query 'ScalingPolicies[].[PolicyName,PolicyType,TargetTrackingConfiguration.TargetValue]' --output text
~~~

~~~text
ama-l1-cpu50	TargetTrackingScaling	50.0
~~~

In real AWS the `put-scaling-policy` response also lists the two alarms it created (`Alarms`). In Floci that list is empty and the policy never fires.

### Scheduled scaling
Raise capacity before a known event:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling put-scheduled-update-group-action \
  --auto-scaling-group-name ama-l1-web-asg --scheduled-action-name ama-l1-match-day \
  --start-time 2026-12-01T09:30:00Z --desired-capacity 4
~~~

### Useful queries
- Count instances: `--query 'length(AutoScalingGroups[0].Instances)'`
- Only healthy ones: `--query 'AutoScalingGroups[0].Instances[?HealthStatus==`Healthy`].InstanceId'`
