## How a data centre keeps running

### Power: from the grid to the server
~~~text
Utility feed A --+                      +--> UPS A --> PDU A --+
                 +--> switchgear -------+                      +--> server (dual power supplies)
Utility feed B --+        ^             +--> UPS B --> PDU B --+
                          |
                   diesel generators
~~~

1. Power arrives from the grid, ideally from **two independent feeds**.
2. If the grid fails, **UPS batteries** carry the load instantly, for seconds to minutes.
3. **Generators** start automatically and take over within seconds. Sites keep enough fuel for many hours or days, with refuelling contracts.
4. Each server has **two power supplies**, each fed from a different path. Losing one path doesn't turn the server off.

### Cooling: moving heat out
Every watt a server uses becomes heat. Data centres arrange racks in **hot aisles and cold aisles**: cold air is blown in front of the servers, which exhaust hot air behind them into a separate aisle, where it's removed and cooled. Large operators use outside air, evaporative cooling or liquid cooling to cut energy use.

**PUE** measures efficiency:

~~~text
PUE = total facility power / IT equipment power

Server room: 200 kW total / 100 kW IT = PUE 2.0  (100 kW overhead)
Efficient hyperscale site: 115 kW total / 100 kW IT = PUE 1.15  (15 kW overhead)
~~~

### Network: no single cable
Fibre enters the building by **different physical routes** from **several carriers**. Inside, redundant core routers and switches connect every rack. In AWS, data centres in an AZ, and AZs in a Region, are linked by AWS's own private, encrypted, low-latency fibre.

### Physical security: layers, like an onion
AWS describes data-centre security in layers:

| Layer | Examples |
|---|---|
| **Perimeter** | Fences, guards, CCTV, vehicle barriers, restricted site locations |
| **Infrastructure** | Building access by badge and biometrics, mantraps, monitoring of power and cooling |
| **Data** | The server floor, where access is the most restricted and logged. Failed disks are destroyed on site, never sent out intact |
| **Environmental** | Site selection away from flood plains, fire detection and suppression, seismic design |

Access is granted only for a verified business need and only for as long as needed, and every entry is logged and reviewed.

### Reliability ratings
Many facilities are rated using the **Uptime Institute Tier** system, from Tier I (basic, no redundancy) to Tier IV (fault tolerant: any single component can fail without downtime). AWS doesn't market individual buildings by tier. Instead it gets resilience mainly from **many independent AZs**, so the failure of one whole facility is survivable.

### How you "use" AWS data centres
You never choose a building. You choose a **Region** (where your data lives) and, for some services, an **AZ**. Your data stays in the Region you chose unless you move it. You'll see this in the demo: an S3 bucket is created in a Region and reports that Region back.
