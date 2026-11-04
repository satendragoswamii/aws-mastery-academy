## Independent assignment: design and test a hybrid backup policy

A dental clinic chain has five clinics. Each clinic has a small server holding X-ray images and appointment exports. They want off-site backups in India and a way to recover any clinic within a day.

### Part A: Classify (no AWS needed)
For each item, choose **cloud**, **hybrid** or **on-premises**, and justify it in one line:
1. The X-ray machine software, which must keep working during internet outages.
2. A new online appointment-booking website.
3. Nightly backups of each clinic server.
4. The chain's accounting system, bought last year to run on a local server.

### Part B: Build it on Floci
Always use `--endpoint-url http://localhost:4566`, and work in your home folder.

1. Create two "clinic" folders, `ama-clinic-a` and `ama-clinic-b`, each with an `xrays/` and an `exports/` subfolder and two small text files in each. Add a `.cache` file to each clinic that must **not** be backed up.
2. Create **one** bucket in ap-south-1: `ama-l1-clinics-<yourname>`.
3. Back up each clinic into its **own prefix** (hint: `s3://ama-l1-clinics-<yourname>/clinic-a/`).
4. Add a new file to clinic B and show that a second sync uploads only that file.
5. Delete a file in clinic A. Use `--dryrun` to show what `--delete` would do, and explain in your notes why the clinic's backup policy must not use it.
6. Restore **only clinic B** into a new folder and list it.
7. Clean up the bucket and every local folder you created.

### Part C: Write the policy (150–250 words)
Write the clinic chain's backup policy: what's backed up, how often, what's excluded, how restores are tested, and which **real** AWS features (from the security section) you'd add before going live, and why.

### Self-assessment
- [ ] Part A: the X-ray software stays on-premises, the backups are hybrid.
- [ ] `.cache` files never reached the bucket.
- [ ] Each clinic has its own prefix, and you restored one clinic alone.
- [ ] Your policy rules out `--delete` for backups and mentions versioning and restore tests.
- [ ] Nothing starting with `ama-` remains in Floci or your home folder.
