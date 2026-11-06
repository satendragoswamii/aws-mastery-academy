## What is the AWS global infrastructure?

### The simple version
AWS is not one giant computer. It's **many data centres spread around the world**, organised in layers:

- **Regions** are like **cities** where AWS has built several data centres: Mumbai, Hyderabad, Singapore, Frankfurt, N. Virginia…
- **Availability Zones (AZs)** are like **separate neighbourhoods** in that city, each with its own power and network, far enough apart that a flood or fire in one doesn't hit the others.
- **Edge locations** are like **small shops** in hundreds of towns that keep copies of popular items, so customers don't have to travel to the big warehouse.

You choose **where** your things run. AWS provides the buildings, power, cooling and network.

### The professional version
| Component | What it is | Typical use |
|---|---|---|
| **Region** | A geographic area with multiple isolated AZs; independent of other Regions | Where you deploy workloads and store data |
| **Availability Zone** | One or more data centres with redundant power, networking and connectivity | Fault isolation inside a Region (deploy to 2+ AZs) |
| **Edge location / point of presence** | Sites in many more cities than Regions | CloudFront caching, Route 53 DNS, Global Accelerator, Shield |
| **Regional edge cache** | Larger caches between edge locations and the origin | Content that's less popular but still requested |
| **Local Zone** | Compute and storage in a large city, attached to a parent Region | Single-digit-millisecond latency to that city |
| **Wavelength Zone** | AWS infrastructure inside telecom 5G networks | Ultra-low-latency mobile apps |
| **AWS Outposts** | AWS-managed racks/servers in your own data centre | Hybrid, on-premises data residency |

### Names and codes
Every Region has a **code** you use in the CLI and a **name** you see in the console:

| Code | Name |
|---|---|
| `ap-south-1` | Asia Pacific (Mumbai) |
| `ap-south-2` | Asia Pacific (Hyderabad) |
| `us-east-1` | US East (N. Virginia) |
| `eu-west-1` | Europe (Ireland) |

AZs add a letter: `ap-south-1a`. AZs also have **zone IDs** (`aps1-az1`) that mean the same physical AZ in every account.

### Regional vs. global services
Most services are **Regional** (EC2, S3 buckets, RDS, Lambda): they live in the Region you choose. A few are **global**: IAM, Route 53, CloudFront, AWS Organizations. That's why some lab commands use `us-east-1`: global services have their control endpoint there.

### What you'll do
List Regions and their opt-in status, look at Mumbai's AZs and zone IDs, create a bucket and prove which Region holds its data, and put a **CloudFront** distribution (edge network) in front of it.
