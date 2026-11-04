## In the real world

### Predictable peaks: exam results day
A state education board publishes results at 10:00. Traffic goes from almost nothing to millions of requests in minutes, then fades over two days.
- **Scheduled scaling** raises capacity at 09:30, before the spike.
- **Target tracking** handles the unexpected extra.
- **CloudFront caching** serves the same static pages to everyone without touching the servers.
- Two days later the fleet scales back to its minimum, and the board pays for a few days of peak capacity instead of a year of it.

### Daily cycles: food delivery
Orders peak at lunch and dinner. Predictive scaling learns the daily pattern and adds capacity just before 12:30 and 19:30, every day, without anyone touching it.

### Viral surprises: a startup on a TV show
A startup's app is featured on a TV show. Without elasticity, the site crashes at its most valuable moment. With an ASG and a serverless backend, it scales out. The main risks become hitting **service quotas** (account limits, such as how many instances you can run), and a database that can't keep up. Both should be checked **before** a big event.

### When elasticity isn't enough
- **Slow start-up**: if an instance takes 8 minutes to become ready, a 2-minute spike is over before it helps. Pre-built images, warm pools and containers start faster.
- **Stateful legacy apps**: they need refactoring (move sessions to a cache, files to S3) before they can scale out.
- **Licences priced per server**: scaling out can multiply licence cost.

### On the job
You'll set min, max and target values; choose metrics that reflect real load (CPU is common, but requests per target or queue length is often better); load-test to prove scaling works; and review scaling activity when something goes wrong (`describe-scaling-activities`).
