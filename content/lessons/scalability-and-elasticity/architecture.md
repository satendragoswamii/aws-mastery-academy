## The standard elastic web architecture

~~~text
                         Users
                           |
                  Application Load Balancer  (spans AZ a and AZ b)
                    /                   \
     +---------------------+   +---------------------+
     | AZ ap-south-1a      |   | AZ ap-south-1b      |
     |  [web] [web]        |   |  [web] [web]        |   <- one Auto Scaling group
     +---------------------+   +---------------------+      min 2, max 10
                    \                   /                    target: 50% avg CPU
                     \                 /
          shared state: Amazon RDS (Multi-AZ) or DynamoDB,
          ElastiCache for sessions, S3 for uploaded files
~~~

### Why each piece is there
| Piece | Role in elasticity |
|---|---|
| **Load balancer** | One stable address for users; sends each request to a healthy instance, whatever the current count |
| **Auto Scaling group** | Adds and removes identical instances; replaces failed ones |
| **Two or more AZs** | Scaling and availability together: losing an AZ still leaves capacity |
| **Stateless web tier** | Any instance can serve any user, so instances are disposable |
| **Shared state outside instances** | Sessions, carts and uploads survive scale-in |
| **Minimum of 2** | Even at the quietest time, one instance per AZ for availability |
| **Maximum** | A cost and safety ceiling |

### Vertical scaling still has a place
~~~text
Web tier:      scale OUT with Auto Scaling (many small instances)
Database tier: scale UP the primary (bigger instance class)
               + scale OUT reads with read replicas
               or use a database that scales automatically (DynamoDB, Aurora Serverless)
~~~

### Anti-patterns to recognise
- **One big server, no load balancer.** Can only scale up, and is a single point of failure.
- **Sessions stored in instance memory.** Scale-in logs users out.
- **Uploads saved to the instance's local disk.** Files vanish when the instance is terminated. Use S3.
- **Min = max.** That's a fixed fleet with self-healing, not elasticity.
- **No maximum, or a huge one.** A bug or attack can scale your bill without limit.
