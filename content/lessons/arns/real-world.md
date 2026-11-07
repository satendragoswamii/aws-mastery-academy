## In the real world

### The data pipeline that could read nothing
A team in Hyderabad gave its analytics role `s3:GetObject` on `arn:aws:s3:::sales-data`. The nightly job failed with AccessDenied on every file for two days before someone noticed the missing `/*`. The fix was one character; the lesson was to test policies with the simulator before deploying.

### The wildcard that matched too much
A policy allowed `arn:aws:s3:::prod*` so a deployment tool could reach `prod-assets`. It also matched `prod-customer-exports`, a bucket full of personal data, created later by another team. They changed it to the exact bucket ARNs and added a review rule rejecting wildcards in bucket names.

### One policy, a thousand home folders
A university gave each student a folder in one S3 bucket. Instead of a policy per student, a single group policy used `arn:aws:s3:::student-files/home/${aws:username}/*`. New students only had to be added to the group.

### Finding who did it
After an unexpected deletion, CloudTrail showed the caller as `arn:aws:sts::…:assumed-role/ci-deployer/build-1873`. The session name pointed directly to pipeline build 1873, which had run a clean-up script against the wrong environment. Meaningful session names turned a mystery into a five-minute investigation.

### Moving into GovCloud
A company winning a US government contract had to deploy its stack in GovCloud. Templates that hard-coded `arn:aws:` failed; the ones using `${AWS::Partition}` deployed unchanged.
