#### Technologies

NextJS, MongoDB, AWS S3, Redis

<br/>
<br/>

##### Using LocalStack/S3 with Docker Compose

_FIXME: LS data not persisting between container restarts_ 😕

<br/>
Install localstack CLI:
<br/>

```bash
pip install awscli-local
```

<br/>
Ensure python3 and Docker Compose are installed before running:
<br/>

```bash
docker compose down && docker compose up --build
```

<br/>
To create the S3 bucket:
<br/>

```bash
python3 ls_s3_setup.py
```

<br/>
<br/>

##### See:

- [AWS-CLI documentation](https://docs.localstack.cloud/integrations/aws-cli/#aws-cli)
- [Commands](https://alojea.com/how-to-create-an-aws-local-bucket/)
