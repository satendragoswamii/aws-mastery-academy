## How the console works

### Every click is an API call
~~~text
You click "Create bucket"
   |
   v
Console (JavaScript in your browser)
   |  builds a CreateBucket request, signs it with your session's temporary credentials
   v
https://s3.<region>.amazonaws.com   <- the SAME endpoint the CLI and SDKs use
   |  IAM checks your permissions (exactly as for the CLI)
   v
Bucket created  ->  CloudTrail records "CreateBucket by <you>" (from console or CLI, same event)
~~~
That's why permissions errors look the same in the console and the CLI, and why the console can't do anything your IAM permissions don't allow.

### The Region selector, precisely
~~~text
Regional service (EC2, S3 console views, Lambda, RDS…) -> shows ONLY the selected Region's resources
Global service (IAM, Route 53, CloudFront, Organizations) -> selector shows "Global"
S3 bucket list -> shows ALL buckets (global namespace), each with its Region column
~~~

### Console sessions
- Signing in creates a **session** with temporary credentials (by default it lasts hours, not forever).
- **Switch role** (account menu) lets you act as an IAM role in the same or another account without signing out.
- Identity Center users choose **account + permission set** in the access portal; each opens a console session.

### CloudShell
~~~text
Console session --(same temporary credentials)--> CloudShell environment
   - AWS CLI, Python, Node.js, git and more pre-installed
   - 1 GB persistent $HOME per Region (deleted after a long period of inactivity)
   - runs in AWS, so no local keys are needed
~~~

### Console, CLI, SDK, IaC: same API, different strengths
| Method | Best for | Repeatable? |
|---|---|---|
| Console | Exploring, viewing, one-off tasks | No |
| CLI / CloudShell | Scripts, quick admin tasks, automation | Yes (scripted) |
| SDKs | Applications calling AWS from code | Yes |
| Infrastructure as code (CloudFormation, CDK, Terraform) | Whole environments, reviewed and versioned | Yes, fully |
