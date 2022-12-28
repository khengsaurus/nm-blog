## Technologies

NextJS, MongoDB, AWS S3, Redis

<hr/>

### Running LocalStack S3 with Docker Compose

Requirements: [LS CLI](https://github.com/localstack/awscli-local), Docker Compose, Python 3

```bash
# Running via Docker Compose
> docker compose down && docker compose up

# Start LS S3
> python3 scripts/ls_s3_setup.py

# List LS S3 buckets
> awslocal s3 ls

# List contents of LS S3 bucket
> awslocal s3 ls <bucket-name>

# Show tags of LS S3 object
> awslocal s3api get-object-tagging --bucket <bucket-name> --key <object-key>
```

<hr/>

### Issues

- Adding header `x-amz-tagging` works in LS but results in 403 for AWS

- [Localstack docs](https://docs.localstack.cloud/localstack/persistence-mechanism/): "_...please note that persistence in LocalStack, as currently intended, is a Pro only feature..._" 😕

### See

- [AWS-CLI docs](https://docs.localstack.cloud/integrations/aws-cli/#aws-cli)
- [Setting up LS S3](https://alojea.com/how-to-create-an-aws-local-bucket/)
