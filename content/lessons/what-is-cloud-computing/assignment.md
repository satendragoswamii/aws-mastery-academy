## Your assignment: prove it to yourself

Do this **without copying commands from this lesson**. Use `aws s3 help` and `aws s3 cp help` when you're unsure. Getting stuck and finding the answer in `help` is the point.

### Part 1: Practical (Floci)

1. Create a bucket named `ama-l1-<yourname>-notes` (lowercase, no spaces).
2. On your Mac, write a text file called `cloud-in-my-words.txt` that explains cloud computing in **three sentences of your own**, as if to a friend who isn't technical.
3. Upload it to your bucket.
4. List the bucket's contents and note the file size.
5. **Download** the file back to your Mac under a *different* name, `downloaded.txt`. Hint: the same command you used to upload works in the other direction.
6. Check that the two files are identical:
   ~~~bash
   diff cloud-in-my-words.txt downloaded.txt && echo "identical"
   ~~~
7. Delete everything you created in Floci, and confirm that `s3 ls` no longer shows your bucket.

### Part 2: Thinking

Write a short answer (a few lines each) in your notes for this lesson:

1. For **each** of the five NIST characteristics, point to the exact step in Part 1 where you experienced it. If one didn't appear, say so and explain why.
2. Your college wants to run an online exam for 20,000 students once a year. Using two of the six advantages by name, explain why the cloud suits this better than buying servers.
3. Name one **risk** that pay-per-use creates, and one habit that prevents it.

### Done when
- Part 1 ends with `identical` printed and your bucket gone.
- Part 2 is written in your lesson notes.

Lab verification and graded feedback on Part 2 arrive with the assessment engine (Phase 10). Until then, compare your answers with the Knowledge check section **after** you've written them.
