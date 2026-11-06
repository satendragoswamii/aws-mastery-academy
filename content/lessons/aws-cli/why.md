## Why the CLI matters

### Repeatable, scriptable, fast
A task that takes 15 clicks in the console is one line in the CLI, and that line can be saved, reviewed, shared and run again tomorrow, in another Region, or 100 times in a loop. Almost every automation, from a two-line backup script to a deployment pipeline, starts with CLI commands.

### Precise answers
`--query` and `--output text` turn a page of JSON into exactly the value you need:

~~~text
"How many European Regions are there?"      -> 8
"What's the newest AZ ID in Mumbai?"        -> ap-south-1c  aps1-az3
"Give me only the running instance IDs"     -> i-0abc i-0def
~~~
That's how scripts pass values from one command to the next.

### Safe habits are built in
- `--dry-run` tests a risky command before it runs.
- Profiles keep accounts separate; `sts get-caller-identity` confirms where you are before you act.
- Skeleton files make complex commands reviewable before they're sent.

### It's everywhere
The CLI runs on macOS, Linux and Windows, inside containers and CI/CD systems, and is pre-installed in **AWS CloudShell**. Documentation, blog posts and AWS Support answers use CLI commands as the common language.

### Mistakes are faster too
The flip side: a CLI command can delete 1,000 objects as fast as it can list them. Knowing which account and Region a command will hit (profiles and precedence) is not optional.

## Why this matters for you
CLF-C02 expects you to know when to use the CLI. The Developer and SysOps exams test profiles, credential precedence, `--query`, `--dry-run`, pagination options and `s3` vs. `s3api`. And every remaining lesson in this academy uses the CLI.
