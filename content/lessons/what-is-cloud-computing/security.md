## Security starts on day one

Moving to the cloud doesn't make you secure automatically, and it doesn't make you insecure either. It **changes who is responsible for what**. AWS secures the buildings, hardware and core software. **You** secure what you put in the cloud and who can access it. That's the *shared responsibility model*, which gets its own lesson in this level.

## Best practices to start with

1. **Protect your credentials as you would your bank PIN.** AWS access keys let anyone who holds them act as you, and run up your bill. Never paste them into code, chat, screenshots or public GitHub repositories. Automated bots scan public repositories for leaked keys.
2. **Don't use the root account for daily work.** The email address that created an AWS account (the *root user*) can do everything, including closing the account. Turn on multi-factor authentication (MFA) for it and use it rarely. You'll learn the alternative, IAM, in Level 2.
3. **Pay-per-use cuts both ways.** A forgotten resource keeps costing money. In real AWS, set up a **billing alarm or AWS Budget** before you build anything (Level 2).
4. **Know where your request goes.** Always be explicit about the endpoint and Region. In this academy that's `--endpoint-url http://localhost:4566`, so practice never touches a real account.
5. **Delete what you don't need.** Cleaning up after a lab, as you did in Step 5, is a professional habit, not just tidiness. It reduces cost and also reduces your *attack surface*: the number of things that could be attacked.

## Common beginner mistakes

| Mistake | Why it's dangerous |
|---|---|
| Committing access keys to GitHub | Keys are found by bots within minutes and used for crypto-mining at your expense |
| Making storage "public" to "make it work" | Leaked customer data is one of the most common cloud breaches |
| Leaving test resources running | Surprise bills |
| Using the root user for everything | One stolen password gives away the whole account |

## How this academy keeps you safe

- The lab endpoint is locked to your own Mac. The platform refuses any other address.
- Your local AWS credentials are dummy values. Even a mistaken command can't authenticate to a real account.
- Lab resources use the `ama-` name prefix so they're easy to identify and clean up.
