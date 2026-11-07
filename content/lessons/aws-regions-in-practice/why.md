## Why Region skills matter

### "It's gone!" (it isn't)
The most common beginner panic in AWS is a resource that seems to have disappeared. Almost always, the console or CLI is pointed at a different Region. Knowing that Regional services are separate per Region turns that panic into a ten-second check.

### Forgotten resources cost money
A test instance left running in a Region nobody uses keeps costing money every hour. Attackers who steal credentials also like to launch resources in Regions they hope you never look at. An **all-Regions inventory** and a **Region fence** both protect you.

### Laws and customers decide where data lives
Many countries and industries require certain data to stay in the country (data residency). A bank in India may have to keep customer data in Indian Regions; a European company may need EU Regions. That requirement turns into **Region choice** and **`aws:RequestedRegion` policies**.

### Whole-Region problems happen
Regions are built to be independent, so a serious problem rarely affects more than one. Businesses that must keep running during such an event prepare a **second Region** in advance: data replicated, secrets and keys available, images copied. You can't copy anything out of a Region that is unavailable, so the preparation has to happen before.

~~~text
Mumbai (primary)                         Hyderabad (disaster recovery)
data      --- replication --->           copy of data
secrets   --- replica secret --->        same secret, local ARN
KMS key   --- multi-Region replica -->   same key material, can decrypt
~~~

## Why this matters for you
CLF-C02 asks how to choose a Region and which services are global. SAA-C03 and later exams are full of multi-Region designs: disaster recovery strategies, S3 Cross-Region Replication, DynamoDB global tables, Aurora global databases, multi-Region keys, and SCPs restricting Regions.
