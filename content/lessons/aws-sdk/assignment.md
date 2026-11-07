## Independent assignment: a library's book-loan service

A small community library wants a Node.js script that records book loans safely, so the same copy can never be lent to two people at once.

### Part A: Plan (no AWS needed)
1. Where will this code get credentials when it runs (a) on your laptop, (b) as a Lambda function? Name the source in the default chain for each.
2. Which errors from the table in "How it works" should the script handle, and which should it re-throw?
3. Write the `ConditionExpression` that allows lending a copy only when it is not already on loan.

### Part B: Build it on Floci
Create a project in `~/ama-library`, with a `lab-config.mjs` like step 1 (endpoint `http://localhost:4566`, Region ap-south-1, dummy `test` keys).
1. `setup.mjs`: create the DynamoDB table `ama-l2-library-copies` (key `copyId`), wait for it with a waiter, and put 12 copies with `status: "AVAILABLE"` using the document client.
2. `lend.mjs`: lend copy `c-1` to `"Asha"` with a conditional update (`AVAILABLE` -> `ON_LOAN`, store the borrower). Run it twice; the second run must print a friendly "already on loan" message by catching `ConditionalCheckFailedException`.
3. `report.mjs`: scan the table with the document client's paginator (`paginateScan` from `@aws-sdk/lib-dynamodb`) using `pageSize: 5`, and print the number of pages and the number of copies on loan.
4. Save a receipt `receipts/c-1.json` to an S3 bucket `ama-l2-library-receipts`, then read it back.
5. Check your results with the CLI (`--endpoint-url http://localhost:4566` on every command), then write `cleanup.mjs` that deletes everything. Prove nothing `ama-l2-library` remains, and delete the project folder.

### Part C: Explain (100–150 words)
Explain to the librarian, in plain words, why the conditional update protects them better than "first read the status, then write if it's AVAILABLE".

### Self-assessment
- [ ] Clients are created once per script and reused.
- [ ] The scan used a paginator and reported 3 pages for 12 items with `pageSize: 5`.
- [ ] The second loan attempt was refused by the condition, and the script didn't crash.
- [ ] Unexpected errors are re-thrown, not swallowed.
- [ ] No real keys anywhere; every client has the Floci endpoint; clean-up leaves nothing behind.
