## What is IAM?

### The simple version
Think of an office building. **Security at the door** checks your ID card: that's **authentication** (who are you?). Then your card only opens certain doors: that's **authorization** (what may you do?). IAM is both the ID-card office and the list of which doors each card opens, for everything in your AWS account.

~~~text
         WHO are you?                    WHAT may you do?
   +-----------------------+      +----------------------------+
   | password + MFA code   |      | policies attached to you   |
   | or access key         | ---> | default: everything DENIED |
   | or temporary role     |      | Allow opens a door          |
   +-----------------------+      | Deny locks it for good      |
      authentication              +----------------------------+
                                        authorization
~~~

### The professional version
AWS Identity and Access Management (IAM) is a **global, free** service that controls access to AWS APIs.

| Building block | What it is | Covered in |
|---|---|---|
| Root user | The account owner identity; unlimited power | This lesson |
| IAM user | A long-lived identity for a person or (rarely) an application | This lesson, lesson 28 |
| IAM group | A collection of users that share policies | Lesson 28 |
| IAM role | An identity anyone trusted can **assume** for temporary credentials | Lessons 24, 28 |
| Policy | A JSON document allowing or denying actions on resources | This lesson, lesson 29 |
| Credentials | Console password, access keys, MFA devices, temporary tokens | This lesson, lesson 24 |

### What IAM decides
Every API request, from the console, CLI, SDK or another AWS service, carries:
- a **principal** (who: user, role, root, or a service),
- an **action** (`s3:GetObject`, `ec2:TerminateInstances`…),
- a **resource** (an ARN, lesson 26),
- a **context** (time, source IP, Region, whether MFA was used…).

IAM evaluates the applicable policies and returns **allow** or **deny**. The default is deny.

### What IAM doesn't do
- It doesn't manage sign-in to **your applications'** users; that is Amazon Cognito.
- It doesn't control **network** access (that is security groups and network ACLs).
- For many people across many accounts, AWS recommends **IAM Identity Center** for sign-in, which creates roles for you behind the scenes.
