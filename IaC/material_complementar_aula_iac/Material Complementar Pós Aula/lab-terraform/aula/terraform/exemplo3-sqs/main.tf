# Fila SQS - Topico1
resource "aws_sqs_queue" "topico1" {
  name                      = "Topico1"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 0
  visibility_timeout_seconds = 30

  tags = {
    Name        = "Topico1"
    Environment = "lab"
    Example     = "exemplo7-sqs"
  }
}

# Fila SQS - Topico2
resource "aws_sqs_queue" "topico2" {
  name                      = "Topico2"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 0
  visibility_timeout_seconds = 30

  tags = {
    Name        = "Topico2"
    Environment = "lab"
    Example     = "exemplo7-sqs"
  }
}

# Fila SQS - Topico3
resource "aws_sqs_queue" "topico3" {
  name                      = "Topico3"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 0
  visibility_timeout_seconds = 30

  tags = {
    Name        = "Topico3"
    Environment = "lab"
    Example     = "exemplo7-sqs"
  }
}

# Outputs para mostrar as URLs das filas
output "topico1_url" {
  description = "URL da fila Topico1"
  value       = aws_sqs_queue.topico1.url
}

output "topico2_url" {
  description = "URL da fila Topico2"
  value       = aws_sqs_queue.topico2.url
}

output "topico3_url" {
  description = "URL da fila Topico3"
  value       = aws_sqs_queue.topico3.url
}

output "topico1_arn" {
  description = "ARN da fila Topico1"
  value       = aws_sqs_queue.topico1.arn
}

output "topico2_arn" {
  description = "ARN da fila Topico2"
  value       = aws_sqs_queue.topico2.arn
}

output "topico3_arn" {
  description = "ARN da fila Topico3"
  value       = aws_sqs_queue.topico3.arn
}
