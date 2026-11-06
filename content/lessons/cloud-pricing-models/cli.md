## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws pricing describe-services` | Lists services in the price list and their attributes |
| `aws pricing get-attribute-values --service-code AmazonEC2 --attribute-name instanceType` | Lists possible values of a price-list attribute |
| `aws pricing get-products --service-code AmazonEC2 --filters Type=TERM_MATCH,Field=…,Value=…` | Returns matching products with their prices (JSON strings) |
| `aws ec2 describe-spot-price-history --instance-types … --product-descriptions Linux/UNIX` | Shows Spot prices per AZ |
| `aws ce get-cost-and-usage --time-period Start=…,End=… --granularity MONTHLY --metrics UnblendedCost` | Shows what you spent |
| `aws ce get-cost-forecast …` | Forecasts spend (real AWS) |
| `aws budgets create-budget --account-id … --budget file://… --notifications-with-subscribers file://…` | Creates a budget with alerts |
| `aws budgets describe-budgets --account-id …` | Lists budgets |
| `aws budgets describe-notifications-for-budget --account-id … --budget-name …` | Shows a budget's alerts |
| `aws budgets delete-budget --account-id … --budget-name …` | Deletes a budget |

### Useful filters for `get-products`
| Field | Example value |
|---|---|
| `instanceType` | `t3.micro` |
| `regionCode` | `us-east-1` |
| `location` | `US East (N. Virginia)` |
| `operatingSystem` | `Linux` |
| `tenancy` | `Shared` |

### Try it yourself
1. Look up the On-Demand price of `m5.large` in us-east-1 with step 1's commands. How many t3.micro hours cost the same as one m5.large hour?
2. Add a **forecasted** alert to `alerts.json` (`"NotificationType": "FORECASTED"`, threshold 100), create the budget, and check that both alerts are listed. Delete it afterwards.

### In a real account
Set up a budget **before** anything else. The console's "zero spend budget" template alerts on the first cent spent beyond the Free Tier.
