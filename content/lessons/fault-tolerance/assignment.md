## Independent assignment: make a photo printing shop crash-proof

A photo printing shop takes uploads on its website. Each upload must be printed **exactly once**. Today the website calls the printer service directly; when the printer service is restarting, uploads fail and customers re-upload, sometimes causing double prints.

### Part A: Design (no AWS needed)
1. Draw the current design and the failure. Explain why it's neither fault tolerant nor idempotent.
2. Redesign it with a queue, a DLQ and an idempotency record. Draw it in ASCII.
3. Choose a visibility timeout if a print job normally takes 40 seconds and occasionally 3 minutes. Justify it.
4. Should this be a standard or a FIFO queue? Explain your choice.

### Part B: Build and break it on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`.

1. Create `ama-l1-prints-dlq` and `ama-l1-prints` (visibility timeout 5 s, `maxReceiveCount` 3).
2. Create a DynamoDB table `ama-l1-printed` keyed on `jobId`.
3. Send three print jobs (`JOB-1`, `JOB-2`, `JOB-3`) in one go (hint: `send-message-batch`), or with three `send-message` calls.
4. Process `JOB-1` correctly: receive, record it with a conditional write, delete the message.
5. Simulate a duplicate delivery of `JOB-1`: run the conditional write again and show the error. Explain what the worker should do next.
6. Treat `JOB-2` as a poison message: receive it repeatedly without deleting it until it lands in the DLQ. Show the receive counts along the way, and show it in the DLQ.
7. Use `get-queue-attributes` to show the main queue's and the DLQ's message counts at the end.
8. Clean up both queues and the table, and prove they're gone. Don't touch any queue you didn't create.

### Part C: Explain (100–150 words)
Why must the worker **delete the message last**? Describe what goes wrong if it deletes first and crashes, and what goes wrong if it never deletes at all.

### Self-assessment
- [ ] Your visibility timeout is above the 3-minute worst case (e.g. 4–5 minutes).
- [ ] `JOB-1`'s duplicate is rejected by the conditional write and treated as done.
- [ ] `JOB-2` reached the DLQ after 3 receives.
- [ ] Part C: delete-first loses the job; never-delete reprocesses it until it reaches the DLQ.
- [ ] Only `ama-l1-` resources were created and all were removed.
