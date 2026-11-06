## In the real world

### The review before launch
A retailer runs a Well-Architected review two months before its biggest sale. The review finds: the database is single-AZ, there are no alarms on checkout errors, and nobody has ever restored a backup. They fix the first two and run a restore drill, which takes four hours instead of the expected 30 minutes because of a missing permission. Better to find that in a drill than during the sale.

### AWS partners and the Tool
Many AWS partners run free or subsidised Well-Architected reviews for customers, and AWS sometimes offers credits to fix the high-risk issues found. The output is usually a list of HRIs with an improvement plan, which the customer tracks in the Well-Architected Tool and re-reviews later.

### Continuous, not yearly
Mature teams encode the framework into automation: Config conformance packs, Security Hub standards, tag policies, IaC templates that always include alarms and backups, and pipeline checks like the demo's script. The human review then focuses on design trade-offs and processes that can't be automated.

### Trade-offs written down
A start-up decides its internal reporting tool doesn't need multi-AZ: if it's down for two hours, nobody loses money. It records that as an **accepted risk** in the review. That's a perfectly well-architected decision. Well-architected doesn't mean "maximum everything"; it means "chosen deliberately".
