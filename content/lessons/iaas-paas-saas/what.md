## The simple version

**IaaS, PaaS and SaaS describe how much of the work the cloud provider does for you.**

The classic explanation is pizza:

| | You make… | Example |
|---|---|---|
| **On-premises** | Everything: buy the oven, make the dough, cook it, set the table | Making pizza at home from scratch |
| **IaaS** | You rent a kitchen with an oven. You still make and cook the pizza | Renting a commercial kitchen |
| **PaaS** | The pizza base and oven are provided. You add toppings, it's cooked for you | Take-and-bake pizza |
| **SaaS** | You just eat | Ordering at a restaurant |

The further down the table you go, the **less work** you do, and the **less control** you have over exactly how it's done.

## The professional version

A **service model** defines the boundary between what the provider manages and what the customer manages.

~~~text
                 On-prem    IaaS      PaaS      SaaS
Applications      YOU       YOU       YOU       provider
Data              YOU       YOU       YOU       YOU (your content)
Runtime           YOU       YOU       provider  provider
Middleware        YOU       YOU       provider  provider
Operating system  YOU       YOU       provider  provider
Virtualisation    YOU       provider  provider  provider
Servers           YOU       provider  provider  provider
Storage           YOU       provider  provider  provider
Networking        YOU       provider  provider  provider
~~~

- **IaaS**: you rent virtualised infrastructure (compute, storage, network) and manage everything from the OS up. *AWS examples: EC2, EBS, VPC.*
- **PaaS**: the provider also runs the OS and runtime; you deploy applications or use a managed engine. *AWS examples: Elastic Beanstalk, RDS.*
- **SaaS**: the provider runs the whole application; you configure it and manage your data and users. *Examples: Gmail, Microsoft 365, Salesforce; on AWS, Amazon WorkMail, Amazon Chime.*

**Serverless** is a further step that cuts across these: you never provision or size servers, scaling is automatic, and you pay per use. *AWS examples: Lambda, DynamoDB on-demand, S3, SQS.*

> **Data is always yours.** In every model, even SaaS, you're responsible for your own data: who can access it, what you put in it, and complying with laws about it.
