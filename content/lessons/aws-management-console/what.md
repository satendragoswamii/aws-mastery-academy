## What is the AWS Management Console?

### The simple version
The console is **the AWS website** where you manage everything by clicking: create a bucket, start a server, read a graph, look at your bill. It's like your bank's website: the bank (AWS) does the real work, and the website is a friendly window onto it.

Behind every button, the console sends the **same requests** the command-line tool sends. Clicking "Create bucket" and typing `aws s3api create-bucket` do exactly the same thing.

### The professional version
The AWS Management Console (console.aws.amazon.com) is a web application that signs API requests with your session's credentials. Its main parts:

| Area | Where | What it's for |
|---|---|---|
| **Search bar** | Top centre | Jump to any service, feature, documentation page or resource |
| **Services menu** | Top left | Browse services by category; add **favourites** |
| **Region selector** | Top right | Choose the Region for Regional services (shows "Global" for IAM, Route 53…) |
| **Account menu** | Top right | Account ID, your identity, switch role, security credentials, billing, sign out |
| **CloudShell** | Terminal icon in the toolbar | A ready-to-use shell with the CLI, already signed in |
| **Notifications / Health** | Bell icon | AWS Health events affecting your account |
| **Console Home** | Start page | Widgets: recently visited, cost, health, applications |
| **Unified Settings** | Account menu → Settings | Default Region, language, visual mode |
| **Resource Groups & Tag Editor** | Services menu | Find and tag resources across services and Regions |

### How you sign in depends on who you are
| Identity | Signs in at | With |
|---|---|---|
| Root user | The main AWS sign-in page, choosing "Root user" | Account email + password + MFA |
| IAM user | `https://<account-id-or-alias>.signin.aws.amazon.com/console` | IAM user name + password + MFA |
| IAM Identity Center user | Your organisation's **AWS access portal** URL | Company login (+ MFA), then pick account and role |

### What you'll use instead: the Floci UI
Floci includes its own web console, **Floci UI**, at `http://localhost:4500`. It's **not** the AWS console. It looks different and has fewer features, but it works the same way: it calls Floci's AWS-compatible API, so you can prove the console/CLI equivalence on your own Mac.
