## How the global infrastructure works

### The hierarchy
~~~text
AWS global network (private fibre between all Regions)
|
+-- Region ap-south-1 (Mumbai)
|     +-- AZ ap-south-1a (aps1-az1)  = one or more data centres
|     +-- AZ ap-south-1b (aps1-az2)
|     +-- AZ ap-south-1c (aps1-az3)
|           (AZs linked by low-latency, redundant fibre)
|
+-- Region ap-south-2 (Hyderabad)  [opt-in]
|     +-- AZs ...
|
+-- Edge locations / points of presence (many more cities than Regions)
      Chennai, Delhi, Kolkata, Bengaluru, Hyderabad, Mumbai, ... worldwide
~~~

### What "isolated" means
- **Regions** are fully independent: separate control planes and separate data. A problem in one Region shouldn't affect another. Data doesn't leave a Region unless you move it.
- **AZs** in a Region are physically separate (different buildings, flood plains, power substations) but connected with high-bandwidth, low-latency links, fast enough for synchronous database replication.

### How a request reaches you through the edge
~~~text
user in Chennai --> nearest edge location (CloudFront)
                       | cache hit?  yes -> return copy (fast, a few ms)
                       | no
                       v
                    regional edge cache --> origin (S3 bucket in ap-south-1)
                       ^ copy is cached for the next user
~~~

### Opt-in Regions
Regions launched **before March 2019** are enabled by default. Regions launched later (Hyderabad, Jakarta, UAE…) are **opt-in**: an administrator enables them per account. Until then, they appear in `describe-regions --all-regions` as `not-opted-in` and can't be used.

### Extending the edge of a Region
~~~text
           parent Region (e.g. us-west-2)
          /            |             \
   Local Zone    Wavelength Zone    Outposts
   (big city)    (inside 5G net)    (your data centre)
~~~
All three run a **subset** of AWS services and are managed through the parent Region's APIs.

### Global services
IAM, Route 53, CloudFront, AWS Organizations and WAF for CloudFront are **global**: you don't choose a Region for them, and the CLI talks to their endpoint in `us-east-1`. Certificates (ACM) used by CloudFront must also be created in `us-east-1`.
