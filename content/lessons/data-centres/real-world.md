## Data centres in the real world

### Who builds them
- **Hyperscalers** (AWS, Microsoft, Google) build huge campuses with their own designs for servers, networking, cooling and power.
- **Colocation providers** rent space, power and cooling to other companies. In India, Mumbai, Chennai, Hyderabad, Pune and Delhi NCR are major hubs, helped by submarine cable landings, power availability and data-residency rules.
- **Enterprises** still run their own data centres, often alongside the cloud.

### Why location matters
- **Latency**: data travels through fibre at about two-thirds of the speed of light. A user in Bengaluru gets faster responses from Mumbai or Hyderabad than from Virginia.
- **Regulation**: rules from regulators such as the RBI, and India's data protection law, can require certain data to stay in the country. AWS's two Indian Regions (Mumbai `ap-south-1`, Hyderabad `ap-south-2`) let companies meet those rules and still use the cloud.
- **Resilience**: two Indian Regions let a company keep disaster recovery inside the country.

### What a cloud engineer actually does with this
You'll rarely think about generators or chillers. You **will** constantly decide:
- Which **Region** to deploy in (latency, compliance, service availability, price).
- How many **AZs** to use, and making sure the design really survives losing one.
- How to prove compliance to auditors, using AWS's third-party reports in **AWS Artifact** instead of a site visit.

### A real kind of incident
Large cloud providers publish post-incident summaries. A recurring pattern: one AZ has a power or cooling problem, and applications in only that AZ go down, while applications spread across several AZs keep running, perhaps a little slower. The lesson that keeps repeating: **if you deploy in one AZ, you've accepted a data-centre failure as your outage.**
