import boto3

from ..core.config import config

s3_client = boto3.client("s3", region_name=config.aws_default_region)
