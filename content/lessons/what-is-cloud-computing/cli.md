## Reading an AWS CLI command

Every AWS CLI command has the same shape:

~~~text
aws  [global options]  <service>  <operation>  [operation arguments]
~~~

Take the command from the demonstration apart:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 mb s3://ama-l1-my-first-bucket
~~~

| Part | Meaning |
|---|---|
| `aws` | The AWS Command Line Interface program |
| `--endpoint-url http://localhost:4566` | **Global option.** Send the request here instead of the real AWS endpoint. This is what makes it a Floci command. |
| `--region us-east-1` | **Global option.** Which AWS Region the request is for. A Region is a geographic area with its own data centres (next lessons). `us-east-1` is N. Virginia. |
| `s3` | The **service** to talk to |
| `mb` | The **operation**: "make bucket" |
| `s3://ama-l1-my-first-bucket` | The **argument**: the bucket's name, in S3 URL form |

## Commands used in this lesson

| Command | What it does | Key flags |
|---|---|---|
| `s3 mb s3://NAME` | Create a bucket | none |
| `s3 ls` | List all your buckets | none |
| `s3 ls s3://NAME/` | List objects in one bucket | `--recursive` lists everything inside "subfolders" |
| `s3 cp SOURCE DEST` | Copy a file to or from S3 (upload when the source is local, download when the source is `s3://`) | `--recursive` copies whole folders |
| `s3 rb s3://NAME` | Remove a bucket. It must be empty. | `--force` deletes all objects first, then the bucket |

## `s3` versus `s3api`

The CLI has two ways to use S3:
- `aws s3 …` gives **high-level, friendly** commands (`mb`, `cp`, `ls`) that may make several API calls for you.
- `aws s3api …` gives **one command per API operation** (`create-bucket`, `put-object`, `list-objects-v2`), with full control and JSON output.

For example, `aws s3 mb` calls the **CreateBucket** API, the same operation as `aws s3api create-bucket`. You'll use `s3api` heavily in the S3 lessons.

## Getting help (works offline)

~~~bash
aws help                 # overview
aws s3 help              # all high-level S3 commands
aws s3 mb help           # one command, with every option explained
~~~

Press `q` to leave a help page.

> **Habit to build now:** before running any unfamiliar command, read its `help` page and be able to explain every flag. You'll be asked to do exactly this in assessments.
