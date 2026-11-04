## The simple version

**Scalability is being able to grow. Elasticity is growing and shrinking automatically, as demand changes.**

Imagine a restaurant:

- On a normal Tuesday, 5 waiters are enough.
- On Diwali evening, 20 waiters are needed.
- A **scalable** restaurant *can* hire 15 more waiters for Diwali.
- An **elastic** restaurant does it **automatically**, exactly when the crowd arrives, and sends them home when it leaves, so it never pays 20 waiters on a quiet Tuesday.

There are two ways to handle more customers:

| | Restaurant | Computers |
|---|---|---|
| **Scale up (vertical)** | Replace the small kitchen with a bigger one | Move to a bigger server: more CPU, more memory |
| **Scale out (horizontal)** | Open more counters, each with its own cook | Add more servers that share the work |

## The professional version

- **Scalability**: a system's ability to maintain performance as load increases by adding resources.
- **Elasticity**: the ability to provision and de-provision resources dynamically, ideally automatically, so capacity tracks demand closely in both directions. It's one of NIST's five essential characteristics of cloud computing (*rapid elasticity*).

Scaling dimensions:

~~~text
Vertical (scale up / down)            Horizontal (scale out / in)
+------+      +----------+            +----+       +----+ +----+ +----+ +----+
| t3.  |  ->  |  r6i.    |            | s1 |  ->   | s1 | | s2 | | s3 | | s4 |
| small|      |  xlarge  |            +----+       +----+ +----+ +----+ +----+
+------+      +----------+                              behind a load balancer
limit: biggest machine; often restart  limit: practically none; needs stateless design
~~~

In AWS, the main tool for elastic EC2 capacity is **Amazon EC2 Auto Scaling**. You define an **Auto Scaling group** with a **minimum**, **maximum** and **desired** number of instances. AWS keeps the group at the desired number, replaces unhealthy instances, and, with a **scaling policy**, changes the desired number automatically based on metrics such as CPU.

> **Key idea:** on-premises you scale **for the peak** and pay for it all year. In the cloud you scale **with the demand** and pay for what you use.
