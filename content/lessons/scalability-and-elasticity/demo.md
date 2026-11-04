## Grow and shrink a fleet with an Auto Scaling group

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-04. Floci's Auto Scaling launches and terminates (simulated) instances to match desired capacity and balances them across AZs. It doesn't run real workloads, and scaling **policies** are stored but don't react to CPU. So in this lab **you** play the scaling policy by changing desired capacity.

**Scenario:** a ticket-booking site needs 1 web server normally, more when a big match goes on sale, and never more than 4.

> **Important habit:** every command includes `--endpoint-url http://localhost:4566`.

### Step 1: Write the recipe (launch template)

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 create-launch-template \
  --launch-template-name ama-l1-web \
  --launch-template-data '{"ImageId":"ami-0abcdef1234567891","InstanceType":"t3.micro"}' \
  --query 'LaunchTemplate.[LaunchTemplateName,LatestVersionNumber]' --output text
~~~

Expected output:

~~~text
ama-l1-web	1
~~~

Version 1 of the recipe: Amazon Linux 2023 on a `t3.micro`.

### Step 2: Create the Auto Scaling group
Minimum 1, maximum 4, desired 1, spread across two AZs:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling create-auto-scaling-group \
  --auto-scaling-group-name ama-l1-web-asg \
  --launch-template 'LaunchTemplateName=ama-l1-web,Version=$Latest' \
  --min-size 1 --max-size 4 --desired-capacity 1 \
  --availability-zones ap-south-1a ap-south-1b
~~~

No output means success. The single quotes around `$Latest` stop your shell from treating it as a variable.

### Step 3: Watch the group fill itself
Wait about 20 seconds (Floci reconciles the group periodically; real AWS takes a similar short time), then:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names ama-l1-web-asg \
  --query 'AutoScalingGroups[0].{Desired:DesiredCapacity,Instances:Instances[].[InstanceId,AvailabilityZone,LifecycleState]}' \
  --output json
~~~

Expected output (your IDs will differ):

~~~text
{
    "Desired": 1,
    "Instances": [
        [
            "i-46bd2d7e6a122d1bc",
            "ap-south-1a",
            "InService"
        ]
    ]
}
~~~

You never ran `run-instances`. The group saw "desired 1, have 0" and launched one. If you run it too early you'll see an empty list or a `Pending` instance; wait and try again.

### Step 4: Tickets go on sale: scale out
In real AWS a target-tracking policy would do this when CPU rises. Here, you do it:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling set-desired-capacity \
  --auto-scaling-group-name ama-l1-web-asg --desired-capacity 3
~~~

Wait about 25 seconds and run the step 3 command again. Expected output:

~~~text
{
    "Desired": 3,
    "Instances": [
        [
            "i-46bd2d7e6a122d1bc",
            "ap-south-1a",
            "InService"
        ],
        [
            "i-2fe99a5ceaab7dc7b",
            "ap-south-1b",
            "InService"
        ],
        [
            "i-17ae822beeaefd722",
            "ap-south-1a",
            "InService"
        ]
    ]
}
~~~

Look at the **AZ column**: the group spread the instances across **both** AZs. If one data centre group failed, the other would still be serving.

See what the group did, and why:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling describe-scaling-activities \
  --auto-scaling-group-name ama-l1-web-asg --query 'Activities[0:3].[StatusCode,Description]' --output text
~~~

~~~text
Successful	Launching a new EC2 instance: i-17ae822beeaefd722
Successful	Launching a new EC2 instance: i-2fe99a5ceaab7dc7b
Successful	Launching a new EC2 instance: i-46bd2d7e6a122d1bc
~~~

### Step 5: The sale ends: scale in

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling set-desired-capacity \
  --auto-scaling-group-name ama-l1-web-asg --desired-capacity 1
~~~

Wait about 25 seconds, then run the step 3 command again:

~~~text
{
    "Desired": 1,
    "Instances": [
        [
            "i-17ae822beeaefd722",
            "ap-south-1a",
            "InService"
        ]
    ]
}
~~~

Two instances were terminated. In real AWS, **billing for them stops**. That's elasticity: capacity followed demand **down** as well as up.

### Step 6: Try to go past the maximum

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling set-desired-capacity \
  --auto-scaling-group-name ama-l1-web-asg --desired-capacity 9
~~~

Expected output (Floci):

~~~text
aws: [ERROR]: An error occurred (ValidationError) when calling the SetDesiredCapacity operation: New DesiredCapacity=9 must be between MinSize=1 and MaxSize=4.
~~~

The maximum is your safety ceiling against runaway cost. Real AWS rejects this too, with slightly different wording.

### Step 7: Clean up
`--force-delete` terminates the group's instances along with the group.

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 autoscaling delete-auto-scaling-group \
  --auto-scaling-group-name ama-l1-web-asg --force-delete
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 delete-launch-template \
  --launch-template-name ama-l1-web --query 'LaunchTemplate.LaunchTemplateName' --output text
~~~

Expected output:

~~~text
ama-l1-web
~~~

After about 15 seconds, this prints nothing, meaning no instances are left running:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-instances \
  --query 'Reservations[].Instances[?State.Name!=`terminated`].[InstanceId,State.Name]' --output text
~~~

### Floci vs. real AWS
- **Scaling policies:** real AWS target tracking creates two CloudWatch alarms and scales on real metrics. Floci accepts and lists the policy (`put-scaling-policy`, `describe-policies`) but creates no alarms and never triggers it, so you scale manually here.
- **Instances:** Floci's instances are simulated; nothing serves traffic, and there's no load balancer in this lab.
- **Activity history:** Floci kept scaling activities from an earlier, deleted group that had the same name. Don't rely on that.
- **Timing:** Floci reconciles every ~20 seconds; real AWS reacts within seconds, but instances then need time to boot and warm up.
