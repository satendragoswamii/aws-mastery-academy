## Look up real prices, compare Spot, and set a budget

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-06. Floci has a **small sample price list** (8 instance types, On-Demand only), simulated Spot prices, Cost Explorer (always $0, because nothing is really billed) and working Budgets. Floci doesn't support Reserved Instance offerings.

> The Pricing, Cost Explorer and Budgets APIs are **global** services, so these steps use `--region us-east-1`. Work in an empty folder: `mkdir -p ~/ama-price && cd ~/ama-price`.

### Step 1: Look up an On-Demand price with the Pricing API
Which instance types does the price list know?

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 pricing get-attribute-values --service-code AmazonEC2 \
  --attribute-name instanceType --query 'AttributeValues[].Value' --output text
~~~

~~~text
t3.nano	t3.micro	t3.small	t3.medium	m5.large	m5.xlarge	c5.large	r5.large
~~~

Get the t3.micro product in us-east-1 and print its price. Price-list entries are JSON inside JSON, so a short Python one-liner picks out the price:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 pricing get-products --service-code AmazonEC2 \
  --filters Type=TERM_MATCH,Field=instanceType,Value=t3.micro Type=TERM_MATCH,Field=regionCode,Value=us-east-1 \
  --query 'PriceList[0]' --output text > t3micro.json
python3 -c "import json;p=json.load(open('t3micro.json'));d=next(iter(next(iter(p['terms']['OnDemand'].values()))['priceDimensions'].values()));print(p['product']['attributes']['instanceType'],p['product']['attributes']['location'],d['pricePerUnit']['USD'],d['unit']);print(d['description'])"
~~~

~~~text
t3.micro US East (N. Virginia) 0.0104000000 Hrs
$0.0104 per On Demand Linux t3.micro Instance Hour
~~~

$0.0104 per hour, which matches AWS's public On-Demand price for t3.micro Linux in N. Virginia. A full month (720 hours) is about **$7.49**.

### Step 2: Compare Spot prices across Availability Zones
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-spot-price-history --instance-types t3.micro \
  --product-descriptions Linux/UNIX --query 'SpotPriceHistory[].[AvailabilityZone,SpotPrice]' --output table
~~~

~~~text
-----------------------------
| DescribeSpotPriceHistory  |
+--------------+------------+
|  ap-south-1a |  0.004400  |
|  ap-south-1b |  0.004532  |
|  ap-south-1c |  0.004664  |
+--------------+------------+
~~~

Each AZ has its own Spot price, here less than half the On-Demand rate. The price is cheap because the capacity can be **taken back with two minutes' notice**.

### Step 3: Check what you've spent
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 ce get-cost-and-usage --time-period Start=2026-10-01,End=2026-11-01 \
  --granularity MONTHLY --metrics UnblendedCost --query 'ResultsByTime[0].Total.UnblendedCost' --output table
~~~

~~~text
--------------------------
|     GetCostAndUsage    |
+---------------+--------+
|    Amount     | Unit   |
+---------------+--------+
|  0.0000000000 |  USD   |
+---------------+--------+
~~~

Zero, because Floci doesn't bill anything. In a real account, add `--group-by Type=DIMENSION,Key=SERVICE` to see spend per service. (Real Cost Explorer API calls cost $0.01 each.)

### Step 4: Create a budget with an alert
Create `budget.json`:

~~~json
{
  "BudgetName": "ama-l1-monthly-limit",
  "BudgetLimit": {"Amount": "10", "Unit": "USD"},
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
~~~

and `alerts.json` (alert when **actual** spend passes **80%**):

~~~json
[{
  "Notification": {"NotificationType": "ACTUAL", "ComparisonOperator": "GREATER_THAN", "Threshold": 80, "ThresholdType": "PERCENTAGE"},
  "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "you@example.com"}]
}]
~~~

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 budgets create-budget --account-id 000000000000 \
  --budget file://budget.json --notifications-with-subscribers file://alerts.json
aws --endpoint-url http://localhost:4566 --region us-east-1 budgets describe-budgets --account-id 000000000000 \
  --query 'Budgets[].{Name:BudgetName,Limit:BudgetLimit.Amount,Unit:BudgetLimit.Unit,Period:TimeUnit}' --output table
aws --endpoint-url http://localhost:4566 --region us-east-1 budgets describe-notifications-for-budget --account-id 000000000000 \
  --budget-name ama-l1-monthly-limit --query 'Notifications[].[NotificationType,ComparisonOperator,Threshold,ThresholdType]' --output text
~~~

~~~text
------------------------------------------------------
|                   DescribeBudgets                  |
+-------+------------------------+----------+--------+
| Limit |         Name           | Period   | Unit   |
+-------+------------------------+----------+--------+
|  10   |  ama-l1-monthly-limit  |  MONTHLY |  USD   |
+-------+------------------------+----------+--------+
ACTUAL	GREATER_THAN	80	PERCENTAGE
~~~

`create-budget` prints nothing on success. When actual spend passes $8, AWS emails the subscriber. A budget **alerts**; it does not stop spending on its own.

### Step 5: Clean up
~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 budgets delete-budget --account-id 000000000000 --budget-name ama-l1-monthly-limit
aws --endpoint-url http://localhost:4566 --region us-east-1 budgets describe-budgets --account-id 000000000000 --query 'length(Budgets)'
~~~

~~~text
0
~~~

### Floci vs. real AWS
- **Price list:** Floci's catalogue is a small sample (8 instance types, a few Regions, On-Demand terms only). Real `get-products` returns thousands of entries, including Reserved terms. The t3.micro us-east-1 price matched AWS's published price.
- **Spot prices** on Floci are simulated; real ones change over time and differ by Region.
- **Cost Explorer** always shows $0 on Floci. Real Cost Explorer must be enabled first, and each API request costs $0.01.
- **Reserved Instance offerings:** `describe-reserved-instances-offerings` returns `UnsupportedOperation` on Floci.
- **Budgets:** real AWS returns the limit as `10.0`, and actually sends the emails. Floci stores the budget and notification but sends nothing. Two budgets per account are free in real AWS.
