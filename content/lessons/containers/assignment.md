## Independent assignment: containerise a nightly job

A tuition centre needs a small nightly job that creates an attendance report. It runs for about 2 minutes and then stops. Nobody on the team wants to manage servers.

### Part A: Decide (no AWS needed)
1. Compare running the job on (a) an always-on EC2 instance, (b) ECS on Fargate, (c) Lambda. For each: what you'd manage, roughly how billing works, and one limitation.
2. Recommend one and justify it.
3. Explain, in your own words, why a container image makes the job behave the same on a laptop and in AWS.

### Part B: Explore containers on your Mac
Use only `alpine:3.21` (it's already on your Mac). Always use `--rm`.
1. Show that the container shares the VM's kernel but has its own distribution.
2. Run a container named with `--name ama-l1-job` that prints the date and its hostname. Explain why the hostname looks random (hint: UTS namespace).
3. Start a container with a 32 MB memory limit and print the limit from `/sys/fs/cgroup/memory.max`. Convert the number to MiB.
4. Prove with `docker ps -a --filter name=ama-l1` that nothing was left behind.

### Part C: Run it as an ECS task on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`.
1. Create cluster `ama-l1-reports`.
2. Register task definition `ama-l1-attendance` (Fargate, 256 CPU, 512 MiB, image `alpine:3.21`, command that echoes "report done").
3. Run it, then describe it until it's `STOPPED`. Show the exit code and stop reason.
4. Register a **second revision** that uses 512 MiB → 1024 MiB memory, and list both revisions.
5. Clean up: deregister both revisions and delete the cluster.

### Self-assessment
- [ ] You recommended Fargate (or Lambda, with a good justification about run time and packaging).
- [ ] Part B.3: 33554432 bytes = 32 MiB.
- [ ] Your task stopped with exit code 0 and `EssentialContainerExited`.
- [ ] Both task-definition revisions are INACTIVE and the cluster is deleted.
- [ ] You didn't download any new images.
