## Real containers on your Mac, then a container task on "AWS"

**Lab tier: 🟡 Partially supported in Floci.** Part A uses **real Docker** on your Mac. Part B was run against Floci 2.4.0 on 2026-11-05: Floci's ECS really starts the task's container on your Docker engine. Pushing images to Floci's ECR doesn't work in this setup (see "Floci vs. real AWS").

Everything uses the `alpine:3.21` image, which is already on your Mac (Floci uses it), so **nothing is downloaded**. `--rm` deletes each container as soon as it exits, so nothing is left behind.

### Part A: Containers, for real

#### Step 1: Your first container

~~~bash
docker run --rm alpine:3.21 echo "hello from a container"
~~~

~~~text
hello from a container
~~~

Docker created an isolated environment from the Alpine image, ran one command in it, and removed it.

#### Step 2: Shared kernel, different distribution
First the kernel of the Colima VM (where Docker runs):

~~~bash
colima ssh -- uname -r
~~~

~~~text
6.8.0-117-generic
~~~

Now the same question, asked **inside** a container, plus which Linux it thinks it is:

~~~bash
docker run --rm alpine:3.21 sh -c 'uname -r; . /etc/os-release; echo "$PRETTY_NAME"'
~~~

~~~text
6.8.0-117-generic
Alpine Linux v3.21
~~~

- **Same kernel** as the VM: a container doesn't bring its own kernel. It shares the host's.
- **Different distribution** (Alpine, while the VM is Ubuntu): the container brings its own files, libraries and tools.

That's the key difference from a VM, which runs its own kernel.

#### Step 3: Its own private world

~~~bash
docker run --rm alpine:3.21 ps
~~~

~~~text
PID   USER     TIME  COMMAND
    1 root      0:00 ps
~~~

The VM is running dozens of processes, including Floci and Postgres, but the container sees **only itself**, as process number 1. That's the PID namespace at work.

#### Step 4: How fast?

~~~bash
time docker run --rm alpine:3.21 true
~~~

~~~text
docker run --rm alpine:3.21 true  0.01s user 0.01s system 12% cpu 0.195 total
~~~

About **0.2 seconds** to create, run and delete a container. No operating system had to boot.

#### Step 5: Limits

~~~bash
docker run --rm --memory 64m --cpus 0.5 alpine:3.21 sh -c 'cat /sys/fs/cgroup/memory.max /sys/fs/cgroup/cpu.max'
~~~

~~~text
67108864
50000 100000
~~~

- `67108864` bytes = 64 MiB, the memory cap.
- `50000 100000` = 50,000 µs of CPU time per 100,000 µs period, i.e. half a CPU.

The kernel's **cgroups** enforce these limits. ECS's `cpu` and `memory` settings work the same way.

### Part B: Run a container task with ECS (Floci)

> **Important habit:** every AWS command includes `--endpoint-url http://localhost:4566`.

#### Step 6: Create a cluster

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ecs create-cluster \
  --cluster-name ama-l1-cluster --query 'cluster.[clusterName,status]' --output text
~~~

~~~text
ama-l1-cluster	ACTIVE
~~~

#### Step 7: Describe the task (task definition)
0.25 vCPU (256 CPU units) and 512 MiB, Fargate-compatible, running Alpine with one command:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ecs register-task-definition \
  --family ama-l1-hello --requires-compatibilities FARGATE --network-mode awsvpc --cpu 256 --memory 512 \
  --container-definitions '[{"name":"hello","image":"alpine:3.21","command":["echo","hello from ECS"],"essential":true}]' \
  --query 'taskDefinition.[family,revision,status,cpu,memory]' --output text
~~~

~~~text
ama-l1-hello	1	ACTIVE	256	512
~~~

`1` is the **revision**. Registering again with changes creates revision 2, 3… (Older revisions are kept.)

#### Step 8: Run it on "Fargate"

~~~bash
TASK=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ecs run-task \
  --cluster ama-l1-cluster --task-definition ama-l1-hello --launch-type FARGATE \
  --network-configuration 'awsvpcConfiguration={subnets=[subnet-default-ap-south-1-a],assignPublicIp=DISABLED}' \
  --query 'tasks[0].taskArn' --output text)
echo "$TASK"
~~~

~~~text
arn:aws:ecs:ap-south-1:000000000000:task/ama-l1-cluster/7a0648db3889480e9437ed0326ed9d26
~~~

You didn't choose a server. You described **what** to run; ECS decided **where**.

#### Step 9: What happened?
Wait about 10 seconds, then:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ecs describe-tasks --cluster ama-l1-cluster --tasks "$TASK" \
  --query 'tasks[0].{Last:lastStatus,Desired:desiredStatus,Exit:containers[0].exitCode,Reason:stopCode,LaunchType:launchType,CPU:cpu,Memory:memory}' \
  --output table
~~~

~~~text
--------------------------------------------
|               DescribeTasks              |
+-------------+----------------------------+
|  CPU        |  256                       |
|  Desired    |  STOPPED                   |
|  Exit       |  0                         |
|  Last       |  STOPPED                   |
|  LaunchType |  FARGATE                   |
|  Memory     |  512                       |
|  Reason     |  EssentialContainerExited  |
+-------------+----------------------------+
~~~

The container ran its command and finished successfully (**exit code 0**), so the task stopped. A web server would keep running instead, usually managed by an **ECS service**. If you look quickly, `lastStatus` may still show `PROVISIONING` or `RUNNING`.

#### Step 10: Clean up

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ecs deregister-task-definition \
  --task-definition ama-l1-hello:1 --query taskDefinition.status --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 ecs delete-cluster \
  --cluster ama-l1-cluster --query cluster.status --output text
~~~

~~~text
INACTIVE
INACTIVE
~~~

If you registered more than one revision, deregister each (`ama-l1-hello:2`, …). Check with `aws --endpoint-url http://localhost:4566 --region ap-south-1 ecs list-task-definitions --status ACTIVE`.

### Floci vs. real AWS
- **ECS tasks run for real:** Floci started the task's container on your Docker engine. In real Fargate, each task runs in its own isolated micro-VM in AWS, and you'd normally send its output to CloudWatch Logs.
- **ECR doesn't work in this setup:** creating a repository starts a Floci-managed registry container that listens only inside the Colima VM, and Floci then reports `Backing registry unreachable` (even deleting the repository fails). Changing that would mean reconfiguring Floci, which this course never does, so this lab avoids ECR and uses a local image instead.
- **Images:** real Fargate pulls images from a registry (usually ECR); here the image was already on your Docker engine.
