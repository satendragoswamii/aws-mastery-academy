## Security and best practices

### Cost is a security signal
A sudden cost spike is often the **first sign of a compromised account**: leaked keys are typically used to launch many large instances in Regions you never use, for crypto-mining. Budgets and Cost Anomaly Detection therefore protect you twice.

### Rules to live by
1. **Create a budget with alerts on day one**, including a forecasted alert.
2. **Protect billing access.** Billing data and payment settings should be visible only to the people who need them (IAM access to Billing must be explicitly activated by the root user).
3. **Restrict Regions and instance types** with Service Control Policies in AWS Organizations, so a leaked key can't launch expensive instances anywhere.
4. **Tag everything** (owner, project, environment) so unknown spend stands out.
5. **Clean up** labs and experiments, and look for idle resources (unattached EBS volumes, old snapshots, unused Elastic IPs, idle load balancers, NAT gateways).
6. **Never commit to Savings Plans or RIs for a workload you haven't measured.** Commitments can't simply be cancelled.
7. **Use Spot only for interruptible work.** Never run a single critical database on Spot.

### In this lab
- Budgets were created against Floci's fake account ID `000000000000`, and the clean-up deletes them.
- `you@example.com` is a reserved example address; never put a real address in a shared lab file.
