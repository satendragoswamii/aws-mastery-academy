## Independent assignment: write and test a DR plan

A coaching institute runs its online test platform in Mumbai. Students' answers are stored in DynamoDB; question papers and result PDFs in S3. During the exam season an outage of more than **2 hours** is unacceptable, and losing more than **1 hour** of answers would mean re-running exams.

### Part A: Plan (no AWS needed)
1. State the **RPO** and **RTO** for (a) student answers and (b) result PDFs. They don't have to be the same; justify the difference.
2. Choose a DR strategy and recovery Region. Explain why it meets the RPO/RTO **and** keeps data in India.
3. List three disasters your plan must handle, including at least one **logical** disaster (a human mistake or ransomware), and say which part of the plan handles each.

### Part B: Rehearse on Floci
Always use `--endpoint-url http://localhost:4566`. **Never** use `--source-region`.

1. Create a versioned bucket `ama-l1-exams-<yourname>` in ap-south-1 and upload `paper-1.txt`.
2. Overwrite it with a "corrupted" version, then delete it. Show the history, and restore the **original** by removing the delete marker or copying the old version.
3. Create a table `ama-l1-answers` with three items. Turn on PITR and take an on-demand backup.
4. Delete the table. Restore it from the backup as `ama-l1-answers-restored`, measuring the time with `time`. Show the items.
5. Create `ama-l1-exams-dr-<yourname>` in ap-south-2 and copy the bucket's current files into it.
6. Clean up everything: all versions, both buckets, both tables and the backup.

### Part C: Report (150–250 words)
Write the institute's DR test report: what you tested, the measured restore time, what that would likely mean on real AWS, the gaps you found (for example, what replication alone wouldn't protect against), and one improvement.

### Self-assessment
- [ ] Your RPO for answers is 1 hour or less, and you chose PITR or continuous replication to meet it.
- [ ] Your recovery Region is ap-south-2 (Hyderabad).
- [ ] You restored the original paper, not the corrupted one.
- [ ] No command used `--source-region`.
- [ ] No `ama-l1-` buckets, tables or backups remain.
