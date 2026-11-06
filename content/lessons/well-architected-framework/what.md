## What is the Well-Architected Framework?

### The simple version
When an engineer checks a new building, they don't just ask "does it stand up?". They ask: is it safe in a fire? Will it survive an earthquake? Is it cheap to heat? Can it be maintained easily?

The **AWS Well-Architected Framework** is that kind of checklist for cloud systems. It asks good questions in **six areas**, called **pillars**, so you don't forget an important one.

### The professional version
The framework is AWS's collection of **design principles, best practices and review questions**, built from thousands of customer architecture reviews. It has six pillars:

| Pillar | Main question | Examples of best practices |
|---|---|---|
| **Operational excellence** | How do we run and improve it? | Infrastructure as code, small reversible changes, monitoring, runbooks, post-incident learning |
| **Security** | How do we protect data and systems? | Least privilege, traceability (logging), encryption, security at every layer, automated responses |
| **Reliability** | Does it keep working and recover? | Multi-AZ, auto scaling, backups, tested recovery, automatic failover |
| **Performance efficiency** | Are we using the right resources efficiently? | Right service/instance type, serverless, caching, global deployment, experimentation |
| **Cost optimization** | Are we spending wisely? | Pay for what you use, right pricing model, right-sizing, storage classes, cost visibility |
| **Sustainability** | Are we minimising environmental impact? | High utilisation, managed services, less data stored/moved, efficient hardware |

### General design principles
The framework also lists principles that apply everywhere:
- **Stop guessing your capacity needs.** Scale with demand.
- **Test systems at production scale.** Create a full copy, test, then delete it.
- **Automate** to make architectural experimentation easier.
- **Allow for evolutionary architectures.** Designs can change as you learn.
- **Drive architectures using data.** Measure, then decide.
- **Improve through game days.** Practise failures before they happen.

### The tool
The **AWS Well-Architected Tool** (free, in the console) walks you through the questions for a workload, records your answers, highlights **high-risk issues (HRIs)** and tracks an improvement plan. **Lenses** add questions for specific workloads (Serverless, SaaS, Machine Learning, Generative AI, Financial Services…).

### What you'll do
Floci doesn't run the Well-Architected Tool, so you'll do what many teams do for continuous checks: a **scripted mini review**. You'll build a quick first draft of the shop backend (a bucket and an orders table), run `wa-review.sh` to check one or two practices per pillar, fix every failure, and review again.
