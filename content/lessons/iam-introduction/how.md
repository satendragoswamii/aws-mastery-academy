## How IAM works

### 1. Authentication: proving who you are
| How you sign in | Credentials | Used by |
|---|---|---|
| Console as root | Account email + password (+ MFA) | Only for root-only tasks |
| Console as IAM user | Account ID or alias + user name + password (+ MFA) | People, in small setups |
| IAM Identity Center | Company login (+ MFA), then pick an account and role | People, recommended |
| CLI / SDK | Access key ID + secret (long-term) | Avoid where possible |
| CLI / SDK / services | Temporary credentials from a role | Applications, CI, EC2, Lambda |

### 2. Authorization: the evaluation steps
For a request inside one account, IAM gathers every policy that applies (identity policies, resource policies, permissions boundaries, session policies, and Organizations SCPs) and decides:

~~~text
1. Is there an explicit Deny that matches?       yes -> DENY  (explicitDeny)
2. Does an SCP / boundary fail to allow it?      yes -> DENY  (implicitDeny)
3. Is there an Allow that matches?               no  -> DENY  (implicitDeny)
4. Otherwise                                         -> ALLOW
~~~

This lesson used only identity policies; lesson 29 and the "IAM in depth" lesson add the other policy types.

### 3. Protecting sign-in
- **Password policy:** minimum length, required character types, expiry, reuse prevention. It applies to IAM users' console passwords, not to root or access keys.
- **MFA:** virtual (authenticator app), passkeys/security keys (FIDO2), or hardware TOTP tokens. A user can have up to 8 MFA devices.
- **Account alias:** a friendly sign-in URL; it hides nothing, since the account ID is not a secret.

### How a TOTP code is made
~~~text
shared secret (seed)  +  current time / 30 s  --HMAC-SHA1-->  6-digit code
   (on the phone and in AWS)                                     changes every 30 s
~~~
Both sides compute the same code without talking to each other. That's why the seed must stay secret, and why a phone with the wrong time produces wrong codes.

### Requiring MFA in policies
`aws:MultiFactorAuthPresent` is `true` for sessions created with MFA. A Deny with `BoolIfExists … false` blocks risky actions unless MFA was used. For CLI users, MFA-backed sessions come from `aws sts get-session-token --serial-number … --token-code …` (with the endpoint in this academy) or from assuming a role with MFA.

### IAM is global and eventually consistent
Users, policies and roles exist in every Region at once. Changes spread within seconds, so a script that creates a role and uses it immediately may need a short wait.
