## Troubleshooting

### Lab issues (seen on Floci 2.4.0)
| Symptom | Cause | Fix |
|---|---|---|
| `get-products` returns an empty list (`length` = 0) | No product matches all your filters. Floci's sample list has no Mumbai prices, for example | Check valid values with `get-attribute-values` and relax one filter at a time |
| `Expecting value: line 1 column 1` from Python | `t3micro.json` is empty because the previous command matched nothing | Fix the filters first |
| `UnsupportedOperation … DescribeReservedInstancesOfferings` | Floci doesn't model Reserved Instance offerings | Read about RIs here; use the Pricing Calculator in real AWS |
| Cost Explorer shows `0.0000000000` | Floci doesn't bill | Expected. In real AWS, enable Cost Explorer and wait up to 24 hours for data |
| `DuplicateRecordException … A budget with this name already exists` | The budget exists from an earlier run | Run the clean-up step first |

### "My bill is higher than expected" in real AWS
1. **Cost Explorer**, grouped by **Service**, then by **Usage type**. Find the line that grew.
2. Check **all Regions** for running resources. A forgotten instance in another Region is a classic.
3. Look at **data transfer** usage types (`DataTransfer-Out-Bytes`, `…-Regional-Bytes` for cross-AZ, NAT gateway bytes).
4. Look for idle resources: unattached EBS volumes, old snapshots, Elastic IPs, load balancers and NAT gateways with no traffic.
5. Check **Savings Plans / RI coverage and utilisation**: did a commitment expire?
6. If you see resources you didn't create, treat it as a **security incident**: rotate keys and contact AWS Support.
