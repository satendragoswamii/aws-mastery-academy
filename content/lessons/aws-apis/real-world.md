## In the real world

### The audit that missed people
A security team's script listed IAM users to check for old access keys. It reported "all clear". It had read only the **first page** of results; dozens of users with years-old keys were on later pages. The fix was one line: use the SDK's paginator. Now the team reviews every "list" call for pagination.

### The 2 a.m. throttling failure
A nightly job tagged thousands of resources as fast as possible and failed halfway with `ThrottlingException`. The team switched on the SDK's **adaptive** retry mode, added a little concurrency control and made the job safe to re-run (idempotent). It hasn't failed since.

### The duplicate servers
A deployment tool timed out waiting for `RunInstances`, retried, and launched **two** fleets. Passing a **ClientToken** (idempotency token) makes the retry return the original result instead. Many AWS create APIs support this.

### "SignatureDoesNotMatch" on one laptop only
Requests from one developer's laptop failed with signature errors. Its clock was 20 minutes wrong. SigV4 includes a timestamp, and AWS rejects requests too far from the current time. Turning on automatic time sync fixed it.

### Support tickets with request IDs
AWS Support can trace a specific failed call quickly when you give them the **request ID** and time. Good logging includes it for every failed AWS call.
