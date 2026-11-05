## Independent assignment: right-size and place the VMs

A school's IT team is moving three applications to EC2:
1. **Website**: light traffic most of the day, short bursts when results are published.
2. **Timetable database**: needs a lot of memory, steady load.
3. **Exam software**: its vendor licence is priced per physical CPU core and must run on hardware not shared with other organisations.

### Part A: Choose (no AWS needed)
For each application, choose an instance **family**, explain the choice, and say which **tenancy** it needs. For application 3, explain the difference between Dedicated Instances and Dedicated Hosts, and which one the licence requires.

### Part B: Explore your own VM
Read-only commands only:
1. Record your Mac's architecture, CPU count and memory.
2. Record the Colima (or Docker Desktop) VM's OS, kernel, CPUs and memory.
3. Explain in two sentences why Floci runs inside a Linux VM on your Mac, and why that VM is `aarch64`.

### Part C: Build it on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`.
1. Compare `t3.medium`, `m5.large` and `t4g.medium` with `describe-instance-types` in one table (type, vCPUs, memory, architecture).
2. Launch one instance per application, tagged `ama-l1-school-<app>`, using your chosen types (pick the closest type Floci knows) and tenancy. Use the correct image for each architecture.
3. Show all three with name, type, architecture and tenancy in one table.
4. Deliberately cause an architecture mismatch and paste the error.
5. Terminate all three and prove none remain `pending` or `running`.

### Self-assessment
- [ ] The website uses a burstable (T) family; the database a memory-optimised (R) family (closest Floci type: `m5.large`).
- [ ] The exam software uses **Dedicated Hosts**, with the licensing reason explained.
- [ ] Part B explains that Docker needs a Linux kernel and the VM must match Apple silicon's Arm architecture.
- [ ] Every image matched its instance architecture, except the deliberate mismatch.
- [ ] All `ama-l1-school-` instances are terminated.
