## Technologies

NextJS, MongoDB, AWS S3, Redis

<br/>

### Using LocalStack S3 with Docker Compose

###### Requirements: LocalStack CLI, Docker Compose, Python 3

```bash
> pip install awscli-local
> docker compose down && docker compose up --build
> python3 ls_s3_setup.py # bucket-name specified in this file
```

###### More bash commands

```bash
> awslocal s3 ls # check LS S3 buckets
> awslocal s3 ls <bucket-name> # check contents of LS S3 bucket
> awslocal s3api get-object-tagging --bucket <bucket-name> --key <object-key> # check tags of LS S3 object
```

##### See

- [AWS-CLI documentation](https://docs.localstack.cloud/integrations/aws-cli/#aws-cli)
- [Commands](https://alojea.com/how-to-create-an-aws-local-bucket/)

<br/>

### Known issues

- [Localstack docs](https://docs.localstack.cloud/localstack/persistence-mechanism/): "_...please note that persistence in LocalStack, as currently intended, is a Pro only feature..._" 😕

- Adding header `x-amz-tagging` works in LS but results in 403 for AWS
