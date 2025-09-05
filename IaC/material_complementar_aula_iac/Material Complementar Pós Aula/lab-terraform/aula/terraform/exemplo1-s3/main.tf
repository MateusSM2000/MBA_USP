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


#resource "aws_s3_bucket" "segundo_bucket" {
#  bucket = "meu-segundo-bucket-localstack"
  #block_public_acls       = false
  #block_public_policy     = false
  #ignore_public_acls      = false
  #restrict_public_buckets = false
#}


#resource "aws_s3_object" "exemplo_objeto" {
#  bucket = aws_s3_bucket.exemplo_bucket.id
#  key    = "hello.txt"
#  content = "Olá, mundo do Terraform!"
#}


output "bucket_name" {
  value = aws_s3_bucket.exemplo_bucket.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.exemplo_bucket.arn
}

output "bucket_name" {
  value = meu-segundo-bucket-localstack
}

#output "bucket_arn" {
#  value = meu-segundo-bucket-localstack
#}

#output "bucket_name" {
#  value = aws_s3_bucket.exemplo_bucket.id
#}

#output "bucket_arn" {
#  value = aws_s3_bucket.exemplo_bucket.id
#}

# Cria múltiplos buckets de uma lista
#resource "aws_s3_bucket" "buckets" {
#  for_each = toset([
#    "meu-bucket-exemplo-localstack",
#    "meu-segundo-bucket-localstack"
#  ])

#  bucket = each.value
#}

# Output com loop para nomes
#output "bucket_names" {
#  value = { for k, b in aws_s3_bucket.buckets : k => b.bucket }
#}

# Output com loop para ARNs
#output "bucket_arns" {
#  value = { for k, b in aws_s3_bucket.buckets : k => b.arn }
#}

