## Troubleshooting

### Lab problems

| Symptom | Likely cause | Fix |
|---|---|---|
| `Could not connect to the endpoint URL: "http://localhost:4566/"` | Floci isn't running | `docker ps --filter name=floci`. If it's missing, `docker start floci` |
| `An error occurred (AuthFailure)` or `InvalidAccessKeyId` | You left out `--endpoint-url`, so the request went to **real AWS** | Add `--endpoint-url http://localhost:4566` |
| `InvalidAMIID.NotFound` | Wrong image ID, or a real-AWS AMI ID used in Floci | Run `ec2 describe-images --owners amazon` against Floci and use an ID from its output |
| Instance stays `pending` | First EC2 launch on Floci is still starting its helper container | Wait a few seconds and describe it again |
| `describe-instances` shows old instances | Instances from earlier runs (terminated ones stay visible for a while, as in real AWS) | Filter by tag or by state, as in the CLI section |
| `Invalid type for parameter` in `--tag-specifications` | Quotes lost by the shell | Wrap the whole value in single quotes, exactly as shown |

### Real-world on-prem problems this lesson explains
These are the problems the cloud was invented to remove. Recognising them helps you answer scenario questions.

| Situation | Root cause | Cloud answer |
|---|---|---|
| "The site crashed on launch day" | Capacity was planned for a smaller peak and can't grow fast | Elasticity, Auto Scaling |
| "We have racks of servers at 10% CPU" | Bought for peak plus headroom | Right-sizing, pay for what you use |
| "The new project waited three months for hardware" | Procurement lead time | Provision in minutes |
| "Finance won't approve a ₹50 lakh purchase for an experiment" | CapEx barrier | OpEx: small, variable spend you can stop |
| "A disk failed and the spare takes two days" | You hold the spares and the risk | Managed services, multiple Availability Zones |
| "We can't afford a second data centre for disaster recovery" | Duplicate hardware cost | Cross-Region backups and DR (later lesson) |
