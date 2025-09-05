resource "aws_s3_bucket" "exemplo_bucket" {
  bucket = "meu-bucket-exemplo-localstack"
}

resource "aws_s3_bucket_versioning" "exemplo_versioning" {
  bucket = aws_s3_bucket.exemplo_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "exemplo_pab" {
  bucket = aws_s3_bucket.exemplo_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" {
  value = aws_s3_bucket.exemplo_bucket.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.exemplo_bucket.arn
}
