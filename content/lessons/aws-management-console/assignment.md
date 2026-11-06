## Independent assignment: console vs. code for a photo studio

A photo studio stores client photos in S3. Every week it needs a new folder per client, and once a month it checks storage use. An intern currently does everything by clicking in the console.

### Part A: Think it through (no AWS needed)
1. List three tasks the intern should keep doing in the console, and three that should be scripted. Justify each in one sentence.
2. The intern says "the bucket vanished from the console". Give two possible reasons and how to check each.
3. How should the intern sign in (identity type and URL), and what protects that sign-in?

### Part B: Prove it on Floci
Use the Floci UI (http://localhost:4500) and the CLI with `--endpoint-url http://localhost:4566 --region us-east-1`.
1. In the UI, create a bucket `ama-l1-studio-photos`.
2. With the CLI, create folders by uploading files `clients/asha/photo1.txt` and `clients/ravi/photo1.txt` (any small text). Paste the CLI output.
3. In the UI, browse into `clients/` and describe what you see (folders and objects).
4. With the CLI, list everything recursively with sizes: `aws s3 ls s3://ama-l1-studio-photos --recursive --human-readable --summarize`. Paste it.
5. Delete the bucket **from the UI** (it has objects; what happens?) and finish the clean-up with the CLI. Prove it's gone.

### Part C: Explain (100–150 words)
Explain to the studio owner why "everything in the console" is risky as the business grows, and what they should do instead.

### Self-assessment
- [ ] Part A: viewing/exploring stays in the console; repeated or bulk tasks are scripted.
- [ ] Part A2 mentions the Region selector and the account.
- [ ] Part B shows the UI-created bucket used by the CLI and the CLI-uploaded objects in the UI.
- [ ] Part B5 explains what the UI did with a non-empty bucket and how you finished.
- [ ] No `ama-l1-studio` bucket remains.
