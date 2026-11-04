## How an on-premises environment actually works

Let's follow a mid-sized online shop that runs everything itself.

### The physical layer
In the basement there's a **server room**:

- **Racks**: tall metal cabinets, 42 "units" (U) high, that hold servers like drawers.
- **Servers**: each one a computer with CPUs, memory and disks, typically 1U or 2U tall.
- **Storage array (SAN or NAS)**: a big box of disks shared by many servers.
- **Network switches and a firewall**: connect the servers to each other and to the internet.
- **UPS and generator**: batteries and a diesel generator to survive power cuts.
- **Air conditioning (CRAC units)**: servers produce a lot of heat, and overheating kills hardware.

### The software layer
On top of the hardware the IT team installs:

1. A **hypervisor** (such as VMware ESXi or Hyper-V), so one physical server can run several virtual machines. You'll learn exactly how in the *Virtualization* lesson.
2. **Operating systems** (Linux, Windows Server) in each virtual machine.
3. **Databases, web servers and runtimes**.
4. The **shop application** itself.

### The people layer
Someone must do all of this, around the clock:

- **Data-centre or facilities staff**: power, cooling, access control.
- **System administrators**: install, patch and monitor servers.
- **Network engineers**: switches, firewalls, internet links.
- **Storage and backup administrators**: disks, backups, restores.
- **Security team**: hardening, audits, incident response.

### The money layer: CapEx and depreciation
The shop buys ₹60 lakh of hardware this year. Accounting doesn't treat that as a ₹60 lakh expense today. It **depreciates** it, recording the asset's loss of value over its useful life:

~~~text
₹60,00,000 / 5 years = ₹12,00,000 depreciation expense per year
~~~

After five years the hardware is "worth" zero on paper, and is usually also out of warranty and due for a **refresh**, so the cycle starts again.

### Capacity planning in practice
The shop's peak is the November festival sale. The IT team:

1. Looks at last year's peak traffic.
2. Adds expected growth (say +40%).
3. Adds **headroom** for failures and surprises (say +30%).
4. Orders hardware in **July** so it's installed by **October**.

~~~text
Last peak: 10,000 orders/hour
x 1.4 growth  = 14,000
x 1.3 headroom = 18,200 orders/hour capacity to buy
~~~

For 11 months of the year, the shop runs at a fraction of that. If the sale goes viral and hits 30,000 orders/hour, no amount of money can make new servers appear before the sale ends.

### Total cost of ownership (TCO)
When comparing on-prem with cloud, professionals calculate **TCO**, every cost over the hardware's life:

| Cost | Easy to forget? |
|---|---|
| Server, storage and network hardware | No |
| Software licences and support contracts | Sometimes |
| Space (rent or construction) | Yes |
| Power and cooling (often as much again as the IT load) | Yes |
| Staff time | Very often |
| Downtime when something fails | Almost always |
| Refresh and disposal at end of life | Yes |

The purchase price is often well under half of the real TCO. AWS provides tools such as the **AWS Pricing Calculator** and migration assessments to help companies build this comparison honestly.
