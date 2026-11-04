## AWS CLI commands in this lesson

All commands target Floci. In your own scripts, keep the endpoint in a variable so you can never forget it:

~~~bash
export AWS_ENDPOINT_URL=http://localhost:4566   # the AWS CLI v2 reads this automatically
export AWS_DEFAULT_REGION=us-east-1
~~~

> With those two variables set, `aws ec2 describe-instances` goes to Floci. **Open a new terminal and they're gone**, and the same command goes to real AWS. Lab commands in this course always spell out `--endpoint-url` for that reason.

| Command | What it does | On-prem equivalent |
|---|---|---|
| `aws ec2 describe-instance-types --instance-types t3.micro` | Shows the CPU, memory and network of a server type | Reading a vendor spec sheet |
| `aws ec2 describe-images --owners amazon` | Lists operating system images you can launch | Choosing which OS DVD/ISO to install |
| `aws ec2 run-instances --image-id … --instance-type …` | Creates one or more virtual servers | Buying, delivering, racking and installing a server |
| `aws ec2 describe-instances` | Lists your servers and their state | Walking to the server room / checking the asset register |
| `aws ec2 terminate-instances --instance-ids …` | Deletes a server permanently; billing stops | Decommissioning and disposing of hardware |

### Useful options you met
- `--query '…'` filters the JSON response using **JMESPath**, so you see only what you need.
- `--output table | text | json` changes the format. `text` is best for scripts, `table` for humans.
- `--tag-specifications` adds tags (key–value labels) at creation time. Tag everything: tags are how you track cost and ownership later.
- `--filters Name=tag:Name,Values=…` finds resources by tag.

### Instance states
~~~text
pending -> running -> stopping -> stopped
                  \-> shutting-down -> terminated
~~~
`stopped` keeps the server (and its disk) so you can start it again; you still pay for the disk. `terminated` deletes it for good.

### Try it yourself
List only instances that aren't terminated, showing ID, type and state:

~~~bash
aws --endpoint-url http://localhost:4566 --region us-east-1 ec2 describe-instances \
  --query 'Reservations[].Instances[?State.Name!=`terminated`].[InstanceId,InstanceType,State.Name]' \
  --output text
~~~

After the demo's clean-up this prints nothing, which is what you want.
