## Independent assignment: the data-residency audit

A health-tech startup in Bengaluru stores patient reports. Its compliance officer has two requirements:
1. Patient data must be stored **only in India**.
2. The startup must be able to **prove** where the data is.

### Part A: On Floci
Always use `--endpoint-url http://localhost:4566`.

1. List the Availability Zones of the Mumbai Region and record their **ZoneIds**.
2. Create a bucket named `ama-l1-patients-<yourname>` in **ap-south-1**.
3. Create a second bucket `ama-l1-oops-<yourname>` **by mistake** in us-east-1 (no location constraint).
4. Run `get-bucket-location` on **both**, and explain the two different outputs.
5. Upload a small text file (no real personal data!) to the Mumbai bucket and show its size with `head-object`.
6. Try to create a third bucket in ap-south-1 **without** a location constraint. Paste the error and explain it in your own words.
7. Clean up: delete the objects and **both** buckets, then prove with `s3 ls` that no `ama-l1-` buckets remain.

### Part B: Explain it (100–200 words each)
1. The compliance officer asks: "Can AWS move our data to another country without telling us?" Answer, and say what controls the startup itself should add.
2. The CTO wants to save money by running the app in **one AZ**. Explain the risk using what you learned about data centres, and propose the minimum change.
3. The auditor asks to visit the data centre. What do you tell them, and what do you give them instead?

### Self-assessment
- [ ] You explained why the us-east-1 bucket shows `null`.
- [ ] You correctly described the IllegalLocationConstraintException.
- [ ] Your clean-up left no `ama-l1-` buckets.
- [ ] Your answers mention AWS Artifact and the shared responsibility model.
- [ ] Your one-AZ answer recommends at least two AZs.
