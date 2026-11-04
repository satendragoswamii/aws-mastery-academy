## Troubleshooting

### Health-check reasons
`describe-target-health` tells you **why** a target isn't healthy. These were seen on Floci 2.4.0:

| State / Reason | Meaning | Fix |
|---|---|---|
| `initial` / `Elb.RegistrationInProgress` | Just registered; checks haven't passed yet | Wait for (healthy threshold × interval) |
| `unhealthy` / `Target.FailedHealthChecks` | No response: server down, wrong port, or blocked | Is the server running? Right port? (In AWS: does the security group allow the load balancer?) |
| `unhealthy` / `Target.ResponseCodeMismatch` + `Health checks failed with these codes: [404]` | The server answered, but with the wrong code. Here, the path doesn't exist | Fix `--health-check-path`, or the app's health endpoint |

Reproduce the 404 case: create a target group with `--health-check-path /healthz` while your server only has `/health`.

Other reasons you'll meet in real AWS: `Target.Timeout` (too slow to answer), `Target.NotRegistered`, `Target.NotInUse` (the target's AZ isn't enabled on the load balancer), and `Target.DeregistrationInProgress` (state `draining`).

### Lab problems
| Symptom | Cause | Fix |
|---|---|---|
| Both targets stay `unhealthy` / `FailedHealthChecks` | Servers not running, or the wrong host address for your Docker setup | `curl http://127.0.0.1:18081/health` on your Mac; on Docker Desktop, use the address that `host.docker.internal` resolves to instead of `192.168.5.2` |
| `OSError: [Errno 48] Address already in use` when starting a server | The port is taken (e.g. an old server still running) | Stop the old one with Ctrl+C, or pick another port |
| Deleting the load balancer fails | Listeners or other resources still reference it | Delete listeners first (`describe-listeners`, `delete-listener`) |
| `"$TG"` is empty | The variable was set in a different Terminal window | Re-run the `TG=$(…)` line in the window you're using |

### Real-world HA problems
| Symptom | Likely cause | Fix |
|---|---|---|
| Outage when one AZ fails, despite "two servers" | Both servers were in the same AZ | Spread across AZs; check with `describe-instances` |
| Every target unhealthy at once | A shared dependency failed (deep health check) or a bad deployment | Keep health checks shallow; deploy gradually; roll back |
| Users see errors for ~1 minute after a server dies | Default thresholds are slow to react | Tune interval and threshold; add retries in clients |
| Requests cut off during deployments | Deregistration delay too short | Let targets drain (default 300 s) before stopping them |
