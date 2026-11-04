## Independent assignment: an availability review

### Part A: Find the single points of failure (no AWS needed)
A college runs its admissions portal like this:

~~~text
Students -> one EC2 web server (ap-south-1a) -> one RDS database, single-AZ (ap-south-1a)
            uploaded documents saved on the web server's disk
            the domain's DNS is managed by the college's own server on campus
~~~

1. List **every** single point of failure (there are at least four).
2. Redesign it to survive the loss of one AZ. Draw it in ASCII and name each AWS service you add.
3. The college wants 99.9% availability. How many minutes of downtime per 30-day month is that? Is the original design likely to meet it? Why?

### Part B: Drill on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`.

1. Start **three** local servers (ports 18081, 18082, 18083), each with its own `/health` page.
2. Create a load balancer across **three** AZs (a, b and c).
3. Create a target group with a 5-second interval and thresholds of 2, and register all three servers.
4. Show all three `healthy`.
5. Stop two servers. Show the result, and explain whether the site would still be up.
6. Change one server's `/health` page into a 404 (rename the file) while it keeps running. Show the `ResponseCodeMismatch` reason and explain the difference from `FailedHealthChecks`.
7. Restore everything, show all `healthy`, then clean up: stop the servers, delete the target group and load balancer, and remove your folders.

### Part C: Short answers
1. Why should `/health` usually **not** check the database? When might it be right to?
2. A colleague proposes disabling health checks because they "cause too many alerts". Respond.

### Self-assessment
- [ ] Part A finds: one web server, one AZ, single-AZ database, documents on local disk, campus DNS.
- [ ] Your redesign uses multiple AZs, a load balancer, Auto Scaling, RDS Multi-AZ, S3 for documents and Route 53.
- [ ] Part A.3: about 43 minutes per month.
- [ ] Part B.6 explains that a 404 means the server responded with the wrong code, while `FailedHealthChecks` means no valid response.
- [ ] Nothing from the drill is left running.
