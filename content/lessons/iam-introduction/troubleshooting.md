## Troubleshooting

### Lab issues (seen on Floci 2.4.0 with AWS CLI 2.35.9)
| Symptom | Cause | Fix |
|---|---|---|
| `NoSuchEntity … PasswordPolicy cannot be found` | No password policy set yet (step 2, expected) | Run `update-account-password-policy` |
| `PasswordPolicyViolation … must contain…` | The password breaks the policy (step 3, on purpose) | Use a password meeting every rule |
| `InvalidAuthenticationCode … Invalid MFA one time pass code` | Codes not from this device's seed, not consecutive, or the clock is wrong | Generate two consecutive codes from the right seed; check the computer's time |
| `Invalid length for parameter AuthenticationCode1` | Code shorter than 6 digits | Keep leading zeros (the script pads them) |
| `DeleteConflict … must detach all policies first` | The user still has policies, MFA, password or keys (step 7, on purpose) | Remove them, then delete the user |
| A user with no policies could still run commands | Floci doesn't enforce IAM | Use the simulator for real decisions |
| No QR code file after `--bootstrap-method QRCodePNG` | Floci doesn't write one | Use `Base32StringSeed` |

### Real-world IAM problems
| Message or symptom | Cause | Fix |
|---|---|---|
| `AccessDenied … is not authorized to perform … because no identity-based policy allows` | Implicit deny | Add an Allow for that action and resource |
| `… with an explicit deny in an identity-based policy` | A Deny matches | Find and change the Deny; no Allow can override it |
| `… with an explicit deny in a service control policy` | An Organizations SCP blocks it | Ask the organization admins |
| Can't sign in: "Your authentication information is incorrect" | Wrong account ID/alias, user name or password | Use the account's sign-in URL; reset the password |
| MFA codes rejected on sign-in | Phone clock drift or wrong device | Turn on automatic time; resync the device |
| Lost the root MFA device | Device lost or reset | Use AWS's root MFA recovery (email and phone verification) |
| New role "doesn't work" for a few seconds | IAM is eventually consistent | Retry after a short wait |
