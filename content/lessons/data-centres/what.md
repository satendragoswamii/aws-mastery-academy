## The simple version

**A data centre is a building designed to do one thing: keep thousands of computers running, safely, all the time.**

When people say "the cloud", this is where the cloud physically is. Your photos, your bank balance and your favourite app are stored on real disks in real servers inside buildings like this.

A data centre is like a hospital for computers. A hospital needs:
- **Power that never fails** (generators for operating theatres).
- **The right temperature** in the right rooms.
- **Security**, so only authorised people get in.
- **Connections** to the outside world (roads, ambulances).

A data centre needs exactly the same things for its servers: **power, cooling, security and network connectivity**, and spares of each in case one fails.

## The professional version

A **data centre** is a facility engineered for continuous operation of IT equipment. Its core systems:

| System | What it includes | Why |
|---|---|---|
| **Power** | Utility feeds (often two), transformers, UPS batteries, diesel generators, power distribution units | Servers must never lose power, even for milliseconds |
| **Cooling** | Chillers, air handlers or CRAC units, hot/cold aisle containment, sometimes liquid cooling | Servers turn electricity into heat; overheating damages them |
| **Network** | Multiple fibre routes, several carriers, core routers and switches | No single cut cable should disconnect the site |
| **Physical security** | Perimeter fencing, guards, CCTV, badge and biometric access, mantraps, visitor logging | Stop theft, tampering and unauthorised access |
| **Fire and environment** | Smoke detection, fire suppression, flood and seismic design | Protect equipment and data from disasters |

Everything is built with **redundancy**, described as **N+1** (one spare) or **2N** (a full duplicate).

### How AWS organises data centres
AWS doesn't ask you to pick a building. It groups data centres into two levels:

~~~text
Region (e.g. ap-south-1, Mumbai)
 |-- Availability Zone ap-south-1a  = one or more data centres
 |-- Availability Zone ap-south-1b  = one or more data centres
 |-- Availability Zone ap-south-1c  = one or more data centres
~~~

- An **Availability Zone (AZ)** is one or more data centres with independent power, cooling and networking.
- A **Region** is a geographic area with several AZs, physically separated by a meaningful distance but linked by fast private fibre.

You'll study Regions and AZs in depth later in this level. In this lesson the key idea is: **an AZ is the AWS name for "a data centre (or a group of them) that fails independently".**
