## Troubleshooting

### Lab issues (seen on Floci 2.4.0 with AWS CLI 2.35.9)
| Symptom | Cause | Fix |
|---|---|---|
| `UnmodifiableEntity … is a service-linked role` | Service-linked roles can't be edited or deleted directly (step 6, on purpose) | Use `delete-service-linked-role` |
| `DeleteConflict … must detach all policies first` on a group | The group still has policies or members (step 7, on purpose) | Detach policies, remove members, then delete |
| Any role can be assumed, by anyone | Floci doesn't evaluate trust policies | Review trust policies by reading them; real AWS enforces them |
| A trust policy naming a group was accepted | Floci doesn't validate principals | Name accounts, users or roles; never groups |
| `NoSuchEntity` for an instance profile at launch | Profile name misspelled, or not yet created | Check `list-instance-profiles`; on real AWS a new profile can take a few seconds to be usable |

### Real-world problems
| Message or symptom | Cause | Fix |
|---|---|---|
| `AccessDenied … is not authorized to perform: sts:AssumeRole on resource: …role/R` | The trust policy doesn't allow the caller, the external ID is wrong or missing, or the caller's own policy doesn't allow AssumeRole | Check both sides: the role's trust policy and the caller's permissions |
| `MalformedPolicyDocument … Invalid principal in policy` | A typo in an ARN, a deleted role, or a group as principal | Use a valid account, user or role ARN |
| Code on EC2 says "Unable to locate credentials" | No instance profile attached, or IMDS disabled or blocked | Attach a profile; check the metadata options (IMDSv2 hop limit for containers) |
| `LimitExceeded … InstanceSessionsPerInstanceProfile` | A profile can hold only one role | Create another profile |
| `The requested DurationSeconds exceeds the MaxSessionDuration` | Asked for a longer session than the role allows | Raise the role's maximum (up to 12 h) or ask for less |
| A user still has access after leaving a group | They have a direct user policy or another group with the same permission | Check `list-attached-user-policies` and all their groups |
