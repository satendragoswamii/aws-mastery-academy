## Security and best practices

### Availability is part of security
Security has three classic goals: **Confidentiality, Integrity and Availability** (the "CIA triad"). An attacker who takes your site offline (a denial-of-service attack) has broken its security, even without stealing anything. So HA design and security design overlap.

### Secure HA patterns
1. **Only the load balancer faces the internet.** Put web servers in **private subnets** and allow traffic only from the load balancer's security group. Users reach servers only through the load balancer.
2. **Health endpoints reveal nothing.** `/health` should return "ok", not version numbers, hostnames or database details that help attackers.
3. **Terminate TLS at the load balancer** with a certificate from AWS Certificate Manager, which also renews it automatically. Expired certificates are a classic self-inflicted outage.
4. **Protect against floods.** AWS Shield Standard (DDoS protection) is on automatically for every AWS customer; add AWS WAF rate-based rules on the load balancer for application-layer floods.
5. **Redundancy for security components too.** A single firewall appliance, authentication server or secrets store is a SPOF. Prefer managed, multi-AZ services (IAM, Secrets Manager, KMS).
6. **Least privilege for failover controls.** The ability to deregister targets or modify listeners can take a site down. Limit who and what can do it.

### Lab safety
The demo's web servers used `--bind 127.0.0.1`, so they were reachable only from your own Mac (and Floci's VM), not from other devices on your network. Binding to `0.0.0.0` would expose them to your whole Wi-Fi network. And you stopped them at the end: never leave test servers running.

### Watch out for availability vs. security trade-offs
- Opening a security group to `0.0.0.0/0` "to fix the health checks" makes the server reachable by everyone. Instead, allow the **load balancer's security group** only.
- Disabling health checks "because they keep failing" hides real problems. Fix the endpoint.
