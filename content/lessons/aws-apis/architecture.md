## The API at the centre of AWS

~~~text
 Clients                       Front door                       Inside AWS
+---------------+        +-------------------------+       +------------------------+
| Console       |        | Regional endpoint       |       | Service control plane  |
| CLI           |  HTTPS | dynamodb.ap-south-1     |       |  (create, configure)   |
| SDK in an app |------->|  - TLS                  |------>|                        |
| CloudFormation|  SigV4 |  - verify signature     |       | Service data plane     |
| Terraform     |        |  - IAM authorisation    |       |  (read/write your data)|
+---------------+        |  - throttling (quotas)  |       +------------------------+
                         +-----------+-------------+
                                     |
                              CloudTrail (who called what, when, from where)
~~~

### Control plane vs. data plane
| | Control plane | Data plane |
|---|---|---|
| What | Create, configure, delete resources | Use the resource: read and write data |
| Examples | `CreateTable`, `RunInstances`, `CreateBucket` | `PutItem`, `GetObject`, `SendMessage` |
| Volume | Low | Very high |
| Design note | Can be less available; avoid depending on it during an outage | Built for very high availability |

A resilient system keeps working using **data-plane** calls only, even if the control plane is having trouble. For example, don't create resources as part of handling every user request.

### How SDKs are built
~~~text
AWS service model (JSON: operations, shapes, errors, pagination, protocol)
      |
      +-> AWS CLI (botocore)          +-> SDK for Python (boto3)
      +-> SDK for JavaScript v3       +-> SDK for Java, Go, .NET, Rust, …
~~~
All official tools are generated from the same models, so they behave consistently: same parameter names, same errors, same pagination.
