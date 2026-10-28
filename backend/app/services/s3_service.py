import os
import uuid
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

class S3Service:
    def __init__(self):
        self.use_mock = settings.USE_MOCK_S3 or not (settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY)
        if not self.use_mock:
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
        else:
            self.s3_client = None

    def generate_presigned_upload_url(self, file_name: str, roll_number: str) -> dict:
        file_ext = os.path.splitext(file_name)[1] or ".pdf"
        s3_key = f"resumes/{roll_number}_{uuid.uuid4().hex[:8]}{file_ext}"

        if self.use_mock:
            # Simulated pre-signed URL for development / testing without live AWS credentials
            return {
                "upload_url": f"http://localhost:8000/api/v1/students/mock-s3-upload?s3_key={s3_key}",
                "s3_key": s3_key,
                "fields": {}
            }

        try:
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': settings.S3_BUCKET_NAME,
                    'Key': s3_key,
                    'ContentType': 'application/pdf'
                },
                ExpiresIn=900  # 15 minutes
            )
            return {
                "upload_url": presigned_url,
                "s3_key": s3_key,
                "fields": {}
            }
        except ClientError as e:
            raise Exception(f"Failed to generate S3 presigned upload URL: {str(e)}")

    def generate_presigned_download_url(self, s3_key: str) -> str:
        if not s3_key:
            return ""

        if self.use_mock:
            return f"http://localhost:8000/api/v1/students/mock-s3-download?s3_key={s3_key}"

        try:
            return self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': settings.S3_BUCKET_NAME,
                    'Key': s3_key
                },
                ExpiresIn=3600  # 1 hour
            )
        except ClientError as e:
            raise Exception(f"Failed to generate S3 download URL: {str(e)}")

s3_service = S3Service()
