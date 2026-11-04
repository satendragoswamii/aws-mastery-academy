## Security and best practices

### Elasticity changes how you secure servers
When servers come and go automatically, you can't hand-configure them. Security must be **built into the recipe**:

1. **Harden the launch template, not the instance.** Use a patched, hardened AMI; set security groups and the IAM role in the template. Every new instance is then secure from its first second.
2. **Treat instances as disposable ("cattle, not pets").** Never log in to fix one by hand. Fix the template and let the group replace instances.
3. **Give instances an IAM role, never stored keys.** New instances get temporary credentials automatically. Access keys baked into an image would be copied to every instance.
4. **Patch by replacement.** Build a new AMI, create a new template version, and roll it out with an **instance refresh**.
5. **Send logs off the instance** (CloudWatch Logs). Scale-in deletes instances, and their local logs with them.

### Elasticity as a security and cost risk
- **Denial of wallet:** an attacker floods your site, your ASG scales to its maximum, and you pay. A sensible **maximum**, AWS WAF rate limits, AWS Shield (DDoS protection) and CloudFront caching all reduce this risk.
- **Budgets and alerts:** set an AWS Budgets alert so unexpected scaling shows up quickly.
- **Least privilege for scaling:** only automation and a few admins should be able to change min, max and desired capacity.

### Elasticity as a security benefit
- **Self-healing:** a compromised or broken instance can be terminated, and the group replaces it with a clean one from the template.
- **Short-lived instances** give attackers less time to settle in.
- **Consistent configuration:** every instance comes from the same recipe, so there's no configuration drift.

### Lab habit
You used `--force-delete` and checked that no instances were left. In real AWS, a forgotten group with min ≥ 1 keeps launching instances, and billing, forever.
