## Where you'll see on-premises in the real world

### Still common today
- **Banks and insurers**: core banking systems, decades old, tightly regulated. Many are moving to the cloud gradually, starting with new digital apps.
- **Government**: data-sovereignty rules and long procurement cycles. In India, government cloud adoption goes through empanelled providers and specific guidelines.
- **Hospitals**: imaging machines and patient systems that must work even if the internet link fails.
- **Factories**: machines on the shop floor need millisecond responses from nearby computers.
- **Companies that just bought hardware**: if the servers are two years into a five-year life, moving now may not pay off yet.

### A typical migration story
A retail company runs its e-commerce site on-prem. Every November the festival sale strains the servers. Three years in a row they over-buy for the peak, and the hardware sits idle for the rest of the year. In one bad year a payment server fails during the sale and spare parts take two days to arrive.

At the next hardware refresh they compare:

| | Refresh on-prem | Move to AWS |
|---|---|---|
| Up-front cost | ₹1.2 crore of new hardware | Nearly zero |
| Festival peak | Buy for the peak, idle 11 months | Scale up for 3 weeks, scale down after |
| Spare capacity for failures | Buy extra servers | Use multiple Availability Zones |
| Time to launch a new feature environment | Weeks | Minutes |
| Staff time on hardware | High | Near zero (focus moves to the application) |

They migrate the website first, keeping the old warehouse system on-prem and connecting the two. That is a **hybrid** architecture, and it's how most real migrations begin.

### On your job
As a cloud engineer you'll constantly meet on-prem systems:

- Migrating them (a whole AWS discipline, with services like AWS Application Migration Service and AWS Database Migration Service).
- Connecting them to AWS with VPN or AWS Direct Connect.
- Explaining to finance why a monthly bill replaces a large purchase.
- Building the TCO comparison that justifies (or doesn't justify) a move.

Understanding on-prem well makes you more credible, not less, as a cloud engineer.
