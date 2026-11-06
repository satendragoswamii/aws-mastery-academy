## A secure shop, layer by layer

~~~text
                          customers (HTTPS only, TLS certificate from ACM)
                                        |
                              AWS WAF + Shield (bad requests, DDoS)
                                        |
+---------------------------- VPC 10.20.0.0/16 --------------------------------+
|  public subnets      [load balancer]   SG: 443 from 0.0.0.0/0                 |
|                             |                                                 |
|  private app subnets  [app servers]    SG: 8080 from load-balancer SG only    |
|                         |  IAM role "shop-app":                               |
|                         |    s3:GetObject/PutObject on ama-l1-shop-records/*  |
|                         |    secretsmanager:GetSecretValue on ama-l1/shop-db  |
|                         |    kms:Decrypt on alias/ama-l1-shop-key            |
|                         v                                                     |
|  private data subnets [database]       SG: 5432 from app SG only              |
|                       encrypted with KMS key; password in Secrets Manager     |
+-------------------------------------------------------------------------------+
        |                          |                            |
   S3 bucket                 Secrets Manager                 AWS KMS
   Block Public Access ON    ama-l1/shop-db                  alias/ama-l1-shop-key
   SSE-KMS default           encrypted with KMS key          key policy + CloudTrail

   CloudTrail (every API call logged)  ->  GuardDuty (threat detection)  ->  alerts
~~~

### What each layer stops
| Layer | Stops | If it fails… |
|---|---|---|
| WAF / Shield | Common web attacks, floods | Security groups still limit what's reachable |
| Security groups | Direct access to app and database | IAM still limits what stolen app credentials can do |
| IAM role (least privilege) | App credentials being used for anything else | KMS still protects data at rest |
| KMS encryption | Reading stolen disks, snapshots or objects | CloudTrail records the attempt |
| CloudTrail + GuardDuty | Unnoticed attacks | You detect and respond |

### Who can decrypt?
To read an SSE-KMS object, a caller needs **two** permissions: `s3:GetObject` on the object **and** `kms:Decrypt` on the key. That's why a separate key per data set is powerful: you can give a team access to the bucket but not the key, and they still can't read the data.

~~~text
GetObject request
   |-- IAM: s3:GetObject allowed?      no  -> AccessDenied
   |-- KMS: kms:Decrypt on key allowed? no  -> AccessDenied (KMS)
   `-- both yes -> S3 asks KMS to decrypt the data key -> object returned
~~~
