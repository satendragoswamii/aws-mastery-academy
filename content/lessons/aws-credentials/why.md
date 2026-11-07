## Why credentials matter

### Credentials are the front door
AWS can only enforce permissions on **whoever signed the request**. If an attacker has your credentials, AWS sees **you**. Stolen or leaked credentials, not clever hacking, are behind a large share of real cloud security incidents.

~~~text
How access keys leak                        What happens next
------------------------------------------  ------------------------------------------
committed to a public Git repository        bots find it within minutes
pasted into a chat or support ticket        anyone with access can copy it
baked into a mobile app or Docker image     extracted by anyone who downloads it
left on an old laptop or build server       found long after everyone forgot it
~~~

### Long-term vs. temporary: the key difference
An access key works **until someone removes it**, which can be years. Temporary credentials stop working **on their own**, usually within an hour. That single difference is why AWS recommends roles and IAM Identity Center for almost everything, and access keys only where nothing else works.

### Rotation and auditing limit the damage
Even good teams have some long-term keys. Rotating them regularly, deleting unused ones and checking the **credential report** shrink the window in which a leaked key is useful.

### It makes multi-account work possible
Real companies have many accounts. Nobody wants a separate access key for each; **role profiles** and SSO let one login switch into the right role in any account, with temporary credentials.

## Why this matters for you
CLF-C02 asks about access keys, MFA, rotation and the difference between long-term and temporary credentials. Associate and Professional exams assume you know STS, AssumeRole, cross-account roles, session duration and the credential report. And in every job using AWS, handling credentials safely is a basic expectation from day one.
