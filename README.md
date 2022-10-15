#### Technologies

NextJS, MongoDB, AWS S3, Redis

<br/>
<br/>

##### Using LocalStack/S3 with Docker Compose

[Localstack docs](https://docs.localstack.cloud/localstack/persistence-mechanism/): "_...please note that persistence in LocalStack, as currently intended, is a Pro only feature..._" 😕

<br/>
Requirements: LocalStack CLI, Docker Compose, Python 3:
<br/>
<br/>

```bash
> pip install awscli-local
> docker compose down && docker compose up --build
> python3 ls_s3_setup.py
```

<br/>

##### See:

- [AWS-CLI documentation](https://docs.localstack.cloud/integrations/aws-cli/#aws-cli)
- [Commands](https://alojea.com/how-to-create-an-aws-local-bucket/)
