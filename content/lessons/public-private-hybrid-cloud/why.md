## Why are there different models?

Because organisations have different constraints. The "best" model is the one that fits the **workload**, not the company's logo.

### Why choose public cloud
- **No up-front cost**, pay as you go.
- **Elasticity**: grow and shrink in minutes.
- **Hundreds of managed services** (databases, AI, analytics) that you'd never build yourself.
- **Global reach**: deploy in many Regions with the same tools.
- **Best for**: new applications, startups, variable workloads, experiments.

### Why choose private cloud
- **Regulation or contracts** that demand dedicated, self-controlled infrastructure.
- **Existing investment** in a data centre and hardware that's still young.
- **Special hardware** or extremely steady workloads.
- **Trade-off**: you keep paying for capacity, staff and refreshes, and you rarely get the breadth of services a hyperscaler offers.

> A private cloud is **more than "servers we own"**. It's a private environment that behaves like a cloud: self-service, automated, pooled. A rack of manually managed servers is just on-premises.

### Why choose hybrid
Most large organisations end up hybrid, usually because they're **somewhere in the middle of a migration** or have workloads that genuinely must stay put:
- **Data that must stay on-premises**, with apps in the cloud that use it.
- **Latency**: factory or hospital systems next to their equipment.
- **Burst capacity ("cloud bursting")**: run normally on-prem, add cloud capacity for peaks.
- **Backup and disaster recovery** in the cloud for on-prem systems. That's often the **first** thing companies move, and it's what you'll build in the demo.
- **Gradual migration**: move one application at a time instead of everything at once.

### Why multi-cloud (and why to be careful)
Companies use multiple clouds because of acquisitions, a specific service only one provider has, or negotiating leverage. But each extra cloud means more tools, skills, security policies and network links to manage. "Multi-cloud for its own sake" usually costs more than it saves.

## Why this matters for you
- CLF-C02 asks you to **identify the deployment model** from a scenario.
- Real projects almost always involve **hybrid connectivity** (VPN, Direct Connect) and migration. Knowing why a system stays on-prem keeps you from giving naive "just move it all" advice.
