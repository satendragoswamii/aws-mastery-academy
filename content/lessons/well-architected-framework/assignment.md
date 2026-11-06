## Independent assignment: review a food-delivery backend

A food-delivery start-up has: an S3 bucket for restaurant menus and app logs, and a DynamoDB table of deliveries. Lunch and dinner bring huge spikes; mornings are quiet. Menus change weekly, and logs are needed for 90 days.

### Part A: Ask the right questions (no AWS needed)
1. For each of the six pillars, write one question you'd ask this team and one best practice that answers it.
2. Identify one trade-off between two pillars for this business, and say which side you'd choose and why.
3. Name one Well-Architected **lens** that might fit this company and explain why.

### Part B: Build, review, fix on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`. Name resources starting `ama-l1-food`.
1. Create the bucket `ama-l1-food-data` and a **provisioned** table `ama-l1-food-deliveries` (key `deliveryId`).
2. Copy `wa-review.sh` to `food-review.sh`, change the names, and change the sustainability check to **90 days**. Run it and paste the result.
3. Fix every FAIL. Add one extra check of your own (for example table deletion protection) and fix that too.
4. Run the review until everything passes, and paste the final output.
5. Clean up and prove nothing `ama-l1-food` remains (turn deletion protection off first if you used it).

### Part C: Explain (100–150 words)
The CEO asks, "Why spend a day on a review when the app already works?" Answer using two concrete findings from your review.

### Self-assessment
- [ ] All six pillars named correctly, including sustainability.
- [ ] First review output shows FAILs; final shows only PASS.
- [ ] The lifecycle rule expires logs at 90 days.
- [ ] The trade-off in A2 names both pillars and a reason.
- [ ] No `ama-l1-food` bucket, table or alarm remains.
