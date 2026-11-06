## Security and best practices

### The security pillar's design principles
1. **Implement a strong identity foundation.** Least privilege, separation of duties, no long-term credentials.
2. **Maintain traceability.** Log and monitor every action (CloudTrail, Config, CloudWatch).
3. **Apply security at all layers.** Edge, VPC, subnet, instance, application, data.
4. **Automate security best practices.** Security as code, in templates and pipelines.
5. **Protect data in transit and at rest.** Classify data, encrypt, use tokenisation where needed.
6. **Keep people away from data.** Reduce direct access and manual processing.
7. **Prepare for security events.** Incident response plans, tools and practice runs.

### Reviews are sensitive documents
A Well-Architected review lists your weaknesses. Share it only with the people who need it, and track fixes for high-risk issues with owners and dates.

### Security relates to every other pillar
- **Reliability:** backups protect against ransomware and mistakes, not just hardware failure.
- **Operational excellence:** alarms and runbooks speed up incident response.
- **Cost:** sudden cost spikes can signal compromise.

### In this lab
- The review script only **reads** settings; changes are made by you in steps 3–6.
- Everything is named `ama-l1-wa-*`, and step 8 removes it.
