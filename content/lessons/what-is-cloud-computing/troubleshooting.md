## Common errors in this lesson

### `Could not connect to the endpoint URL: "http://localhost:4566/…"`
**Cause:** Floci isn't running, or Docker (Colima) is stopped.
**Fix:**
~~~bash
colima status          # is the Docker VM running? If not: colima start
docker ps -a --filter name=floci
docker start floci     # if it shows "Exited"
~~~
Your Floci container has no automatic restart, so after a Mac reboot you need to start it yourself.

### `remove_bucket failed: … BucketNotEmpty … The bucket you tried to delete is not empty.`
**Cause:** `s3 rb` only deletes **empty** buckets. This protects you from deleting data by accident.
**Fix:** delete the objects first, or add `--force` once you're sure:
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 s3 rb s3://ama-l1-my-first-bucket --force
~~~

### `An error occurred (InvalidAccessKeyId)` or `(SignatureDoesNotMatch)` or `Unable to locate credentials`
**Cause:** you probably **forgot `--endpoint-url`**, so the request went to **real AWS**. Your local credentials are dummy values, and AWS rejected them.
**Fix:** add `--endpoint-url http://localhost:4566`. This error is a **useful safety signal**: the dummy credentials stopped the request.

### `Unknown options: …` or `Invalid choice: …`
**Cause:** a typo in the service or operation name, or a flag in the wrong place.
**Fix:** run `aws s3 help` and compare. Global options such as `--endpoint-url` can go before the service name, as in this lesson.

### `zsh: command not found: aws`
**Cause:** the AWS CLI isn't on your PATH in this terminal.
**Fix:** `which aws` should print a path. Your machine has aws-cli 2.35.9 installed. If a new terminal can't find it, check your shell profile.

## How to read any AWS error

AWS errors follow one pattern:

~~~text
An error occurred (ErrorCode) when calling the OperationName operation: Human readable message
~~~

- **ErrorCode** (e.g. `BucketNotEmpty`) is the precise thing to search for in the AWS documentation.
- **OperationName** (e.g. `DeleteBucket`) tells you which API call failed, even when you used a friendly command like `s3 rb`.
