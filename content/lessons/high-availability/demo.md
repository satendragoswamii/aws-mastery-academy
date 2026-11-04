## Failover drill: health checks catch a dead server

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-04. Floci creates load balancers and target groups and runs **real HTTP health checks** against your targets. What it doesn't do in this setup is carry user traffic through the load balancer (its traffic port isn't published to your Mac), so you'll watch the health checks, which decide where traffic would go.

**Scenario:** your shop runs two web servers. You'll put them behind a load balancer, "crash" one, watch the load balancer notice, then bring it back.

Your two "servers" are tiny web servers on your own Mac. Floci runs inside Colima's virtual machine, which reaches your Mac at the address **`192.168.5.2`**.

> **Using Docker Desktop instead of Colima?** The address the Floci container uses to reach your Mac is different (Docker Desktop provides `host.docker.internal`). Look up the IP it resolves to inside a container and use that instead of `192.168.5.2`.

> **Important habit:** every AWS command includes `--endpoint-url http://localhost:4566`.

### Step 0: Start the two servers
Create a health page for each:

~~~bash
mkdir -p ~/ama-ha/server-a ~/ama-ha/server-b
echo "ok from server A" > ~/ama-ha/server-a/health
echo "ok from server B" > ~/ama-ha/server-b/health
~~~

Open **two new Terminal windows** and run one server in each. Leave them running.

~~~bash
# Window 1: server A
python3 -m http.server 18081 --bind 127.0.0.1 --directory ~/ama-ha/server-a
~~~

~~~bash
# Window 2: server B
python3 -m http.server 18082 --bind 127.0.0.1 --directory ~/ama-ha/server-b
~~~

Back in your first window, check that server A answers:

~~~bash
curl http://127.0.0.1:18081/health
~~~

~~~text
ok from server A
~~~

`--bind 127.0.0.1` keeps the servers private to your Mac.

### Step 1: Create a load balancer across two AZs

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 create-load-balancer \
  --name ama-l1-shop-alb --type application \
  --subnets subnet-default-ap-south-1-a subnet-default-ap-south-1-b \
  --query 'LoadBalancers[0].{Name:LoadBalancerName,State:State.Code,AZs:AvailabilityZones[].ZoneName}' --output json
~~~

Expected output:

~~~text
{
    "Name": "ama-l1-shop-alb",
    "State": "provisioning",
    "AZs": [
        "ap-south-1a",
        "ap-south-1b"
    ]
}
~~~

The load balancer itself is redundant: it has a presence in both AZs.

### Step 2: Create a target group with fast health checks
Check `/health` every 5 seconds; 2 failures mark a target unhealthy, 2 successes mark it healthy.

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 create-target-group \
  --name ama-l1-shop-tg --protocol HTTP --port 80 --vpc-id vpc-default-ap-south-1 \
  --target-type ip --health-check-path /health \
  --health-check-interval-seconds 5 --healthy-threshold-count 2 --unhealthy-threshold-count 2 \
  --query 'TargetGroups[0].TargetGroupArn' --output text
~~~

Expected output (your ID will differ):

~~~text
arn:aws:elasticloadbalancing:ap-south-1:000000000000:targetgroup/ama-l1-shop-tg/e746bbbe242f45e6
~~~

Save the ARN in a variable so you don't have to paste it each time:

~~~bash
TG=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 describe-target-groups \
  --names ama-l1-shop-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
~~~

### Step 3: Register both servers

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 register-targets --target-group-arn "$TG" \
  --targets Id=192.168.5.2,Port=18081,AvailabilityZone=all Id=192.168.5.2,Port=18082,AvailabilityZone=all
~~~

No output means success. (`AvailabilityZone=all` is required for IP targets outside the VPC's address range.)

### Step 4: Both healthy
Wait about 20 seconds, then:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 describe-target-health --target-group-arn "$TG" \
  --query 'TargetHealthDescriptions[].[Target.Port,TargetHealth.State,TargetHealth.Reason]' --output table
~~~

Expected output:

~~~text
------------------------------
|    DescribeTargetHealth    |
+-------+-----------+--------+
|  18081|  healthy  |  None  |
|  18082|  healthy  |  None  |
+-------+-----------+--------+
~~~

If you see `initial` / `Elb.RegistrationInProgress`, wait a little longer. Go to window 1: you'll see Floci's `GET /health` requests arriving every few seconds.

### Step 5: Crash server A
In **window 1**, press **Ctrl+C** to stop server A. Wait about 20 seconds, then run the step 4 command again:

~~~text
-----------------------------------------------------
|               DescribeTargetHealth                |
+-------+-------------+-----------------------------+
|  18081|  unhealthy  |  Target.FailedHealthChecks  |
|  18082|  healthy    |  None                       |
+-------+-------------+-----------------------------+
~~~

The load balancer noticed within seconds. From now on it would send **every user to server B**. Users wouldn't see an error page, just one fewer server behind the scenes. That's high availability.

### Step 6: Recovery
In window 1, start server A again (press the up arrow, then Enter). Wait about 20 seconds and check once more:

~~~text
------------------------------
|    DescribeTargetHealth    |
+-------+-----------+--------+
|  18081|  healthy  |  None  |
|  18082|  healthy  |  None  |
+-------+-----------+--------+
~~~

Server A passed two health checks in a row and is back in rotation. Nobody had to edit a configuration.

### Step 7: Clean up
Stop both servers with **Ctrl+C** in windows 1 and 2, then:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 delete-target-group --target-group-arn "$TG"
LB=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 describe-load-balancers \
  --names ama-l1-shop-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 elbv2 delete-load-balancer --load-balancer-arn "$LB"
rm -rf ~/ama-ha
~~~

No output means success.

### Floci vs. real AWS
- **Health checks are real** in Floci: it sends actual HTTP requests to your targets.
- **User traffic:** in real AWS you'd add a listener and browse to the load balancer's DNS name; requests would go only to healthy targets. In Floci the listener is accepted, but its port isn't reachable from your Mac with the standard Floci container setup, so this lab doesn't send user traffic.
- **IP targets outside the VPC:** real AWS only accepts IP targets from the VPC's range, private address ranges, or (with `AvailabilityZone=all`) addresses reachable through peering, VPN or Direct Connect. Using your Mac as a target is a lab shortcut.
- **Health-check timing** in real AWS is similar: interval × threshold, plus a few seconds.
