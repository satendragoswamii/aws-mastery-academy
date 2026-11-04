## The same web application, three ways

### 1. IaaS: you run everything on EC2
~~~text
Users -> Load balancer -> [EC2: web + app]  [EC2: web + app]     (AZ a, AZ b)
                                  |                |
                          [EC2: PostgreSQL primary] -> [EC2: PostgreSQL replica]
You manage: OS patching, web server, app runtime, DB install, replication, backups, scaling.
~~~

### 2. Managed / PaaS: AWS runs the platforms
~~~text
Users -> Elastic Beanstalk environment (load balancer + auto-scaled EC2, managed platform)
                                  |
                     Amazon RDS for PostgreSQL (Multi-AZ, automated backups)
You manage: application code, configuration, schema, data, sizes.
~~~

### 3. Serverless: no servers to see
~~~text
Users -> Amazon API Gateway -> AWS Lambda functions -> Amazon DynamoDB (on-demand)
                                                     -> Amazon S3 (images, receipts)
You manage: function code, table design, permissions, data. Idle cost is close to zero.
~~~

### Mixing models is normal
Real systems combine them. A typical modern stack:

| Part | Service | Model |
|---|---|---|
| Company email and documents | Microsoft 365 or Google Workspace | SaaS |
| Customer website | CloudFront + S3 | Serverless |
| Order API | API Gateway + Lambda | Serverless |
| Reporting database | Amazon RDS | Managed (PaaS) |
| Legacy pricing engine needing a specific OS | EC2 | IaaS |
| Customer support phone line | Amazon Connect | SaaS |

### How responsibility moves (preview of the shared responsibility model)
~~~text
           customer responsibility
IaaS       |#################################-----|  AWS: facilities, hardware, hypervisor
Managed    |#################---------------------|  AWS: + OS, engine, patching, backups
Serverless |##########----------------------------|  AWS: + capacity, scaling, availability
SaaS       |####----------------------------------|  provider: almost everything but your data and users
~~~
The customer's share never reaches zero: **data, identity and access configuration always stay with you.**
