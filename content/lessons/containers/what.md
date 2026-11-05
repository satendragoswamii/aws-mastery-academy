## The simple version

**A container is a sealed box that holds an application and everything it needs, so it runs the same anywhere.**

Think about shipping before the 1950s: sacks, barrels and crates of every shape were loaded by hand, and every port handled them differently. Then came the **standard shipping container**: one size, one shape, one way to lift it. A crane in Mumbai and a crane in Rotterdam handle it the same way, whatever is inside.

Software containers do the same for applications:
- Inside the box: your app, the language runtime (e.g. Python), libraries and settings.
- Outside: any computer with a container engine (like Docker) can run the box the same way.

Compared with virtual machines from the last lesson:
- A **VM** is like building a whole new **house** for each family: walls, plumbing, its own foundation (its own operating system kernel).
- A **container** is like giving each family a **room** in one house: private, with its own lock, but sharing the foundation (the host's kernel). Much quicker to set up and much lighter.

## The professional version

A **container** is an isolated process that shares the host's **kernel** but has its own:
- **filesystem** (from its **image**),
- **process tree** (it sees only its own processes),
- **network** interfaces,
- **resource limits** (CPU and memory caps).

Linux implements this with **namespaces** (isolation of what a process can see) and **cgroups** (limits on what it can use).

~~~text
   Virtual machines                      Containers
+--------+ +--------+ +--------+     +-------+ +-------+ +-------+
| App A  | | App B  | | App C  |     | App A | | App B | | App C |
| libs   | | libs   | | libs   |     | libs  | | libs  | | libs  |
| GUEST  | | GUEST  | | GUEST  |     +-------+ +-------+ +-------+
| OS +   | | OS +   | | OS +   |     +-----------------------------+
| kernel | | kernel | | kernel |     | container engine (Docker)   |
+--------+ +--------+ +--------+     +-----------------------------+
+------------------------------+     | ONE shared host OS kernel   |
|          hypervisor          |     +-----------------------------+
+------------------------------+     |        host hardware        |
|        host hardware         |     +-----------------------------+
+------------------------------+
~~~

A container is created from an **image**: a layered, read-only package of files plus instructions for starting the app. Images are stored in **registries** (Amazon ECR, Docker Hub) and pulled to wherever they run.

On AWS, containers run on:
- **Amazon ECS** (AWS's orchestrator) or **Amazon EKS** (managed Kubernetes),
- on **EC2 instances you manage** or on **AWS Fargate** (serverless, no instances to manage),
- with images stored in **Amazon ECR**.
