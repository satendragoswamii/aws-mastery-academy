## Independent assignment: choose and build the right model

A local library wants a simple system to track which books are borrowed. They have no IT staff, a tiny budget, and usage is heavy on Saturdays and almost zero at night.

### Part A: Classify and decide (no AWS needed)
1. Describe how the library could build this with **IaaS**, with a **managed/serverless** database, and with **SaaS**. One short paragraph each.
2. For each option, list who would patch the OS, who would take backups, and who controls who can see borrower data.
3. Recommend one option and justify it using the library's constraints (no staff, small budget, uneven usage).

### Part B: Build the serverless core on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`.

1. Create an on-demand table `ama-l1-loans` with the key `bookId` (string).
2. Add three loans, each with `bookId`, `title`, `borrower` and `dueDate`.
3. Read one loan back with `get-item`, showing only `title` and `dueDate` (hint: `--projection-expression`).
4. Try to read a `bookId` that doesn't exist. Show the output, and explain how a script would detect "not found".
5. Cause each of these errors on purpose and paste the messages:
   - creating the table a second time;
   - `get-item` with the key as a number instead of a string;
   - `put-item` without a `bookId`.
6. Delete the table and prove with `list-tables` that it's gone.

### Part C: Responsibility check (100–150 words)
Even with a serverless database, which security responsibilities remain the library's? Name at least three, and say how each would be handled.

### Self-assessment
- [ ] Your recommendation is based on the constraints, not on fashion.
- [ ] You used the correct DynamoDB types (`S` for strings).
- [ ] You explained that an empty `get-item` result means "not found".
- [ ] Part C names data access, borrower privacy and account security (or equivalent).
- [ ] No `ama-l1-` tables remain.
