## Troubleshooting

### Lab errors (seen on Floci 2.4.0)
| Error | Cause | Fix |
|---|---|---|
| `AccessDenied … PutBucketPolicy` | Block Public Access refused a public policy (step 4) | Expected. Don't make the bucket public; grant access to specific roles instead |
| `KMSInvalidStateException … is pending deletion` | You scheduled the key for deletion and then tried to use it (even decrypting `card.enc` fails now) or schedule it again | `kms cancel-key-deletion --key-id …`, then `kms enable-key`, if you still need it |
| `NotFoundException … Alias … is not found` | Alias not created yet, or already deleted in clean-up | Run step 1 again, or use the key ID |
| `InvalidCiphertextException` from `decrypt` | You passed the base64 text instead of the decoded bytes | Decode with `base64 --decode` and use `fileb://` |
| `IncorrectKeyException` from `decrypt --key-id …` | The data was encrypted with a different key | Leave out `--key-id`, or pass the key that encrypted it |
| `$KEY` is empty in step 9 | You opened a new Terminal window | Find the ID: `kms list-aliases`, or `kms list-keys` |
| `EntityAlreadyExists` on `create-user` / `create-policy` | Leftovers from an earlier run | Run the clean-up from step 9 first |
| `DeleteConflict` on `delete-user` | The user still has an attached policy or access key | Detach policies and delete access keys first |

### "Access Denied" in real AWS: what to check
1. **Who am I?** `aws sts get-caller-identity`, which shows whether you're using the identity you think you are.
2. **Is there an Allow?** Simulate it: `iam simulate-principal-policy`. Check that the action **and** the resource ARN match (`bucket` vs. `bucket/*`).
3. **Is there an explicit Deny?** A Service Control Policy, permissions boundary, bucket policy or VPC endpoint policy can deny even when IAM allows.
4. **Is the data encrypted with KMS?** You also need `kms:Decrypt` on that key, allowed by the key policy.
5. **Block Public Access** overrides any public grant. That's intended.

The error message in CloudTrail (`errorCode`, `errorMessage`) usually names the denied action.
