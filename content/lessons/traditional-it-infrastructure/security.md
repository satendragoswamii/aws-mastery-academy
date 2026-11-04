## Security and best practices

### On-prem: you own all of security
When you run your own servers, **every** security control is your job:

- **Physical**: locks, badges, CCTV, guards, visitor logs, secure disposal of old disks.
- **Infrastructure**: firewall rules, network segmentation, patching hypervisors and firmware.
- **Operating system**: patches, hardening, antivirus/EDR, user accounts.
- **Application and data**: encryption, access control, backups, logging.

Small companies often can't afford to do all of this well, which is why on-prem server rooms are a common source of breaches: an unlocked door, an unpatched server, backups that were never tested.

### In the cloud: security is shared
In AWS the bottom layers (buildings, hardware, the hypervisor) become **AWS's** responsibility, and the top layers stay **yours**. This split is the **shared responsibility model**, which has its own lesson in this level and is heavily tested on the exam. In one sentence:

> AWS is responsible for security **of** the cloud. You are responsible for security **in** the cloud.

Moving to the cloud doesn't remove your security work. It removes the physical and hardware layers, so you can focus on configuration, identity and data.

### Best practices from this lesson
1. **Always know where your commands go.** In this course that means `--endpoint-url http://localhost:4566`. At work it means checking your profile and Region before running anything that creates or deletes.
2. **Tag every resource** with at least `Name`, `Owner` and `Project`. Untagged servers are how both on-prem and cloud environments fill with forgotten, unpatched machines.
3. **Clean up what you create.** On-prem, forgotten servers waste power. In the cloud they waste money **and** stay exposed to attack. You terminated your instance in the demo; make that a habit.
4. **Don't copy on-prem habits blindly.** Opening a firewall to "everything inside the office network" made some sense on-prem. In the cloud, grant the narrowest access possible (you'll learn security groups and IAM later).
5. **Treat dummy credentials as a safety net, not a plan.** The `test` credentials in your AWS profile would be rejected by real AWS. That protects you, but the endpoint option is what keeps you on Floci.
