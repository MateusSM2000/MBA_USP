variable "environment" {
  description = "Nome do ambiente (dev, qa, prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block para a VPC"
  type        = string
}

variable "availability_zones" {
  description = "Lista de availability zones"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "Lista de CIDR blocks para subnets públicas"
  type        = list(string)
}

variable "ec2_count" {
  description = "Número de instâncias EC2 a serem criadas"
  type        = number
}

variable "instance_type" {
  description = "Tipo da instância EC2"
  type        = string
}

variable "ami_id" {
  description = "ID da AMI para as instâncias EC2"
  type        = string
  default     = "ami-0abcdef1234567890"  # AMI genérica para LocalStack
}

variable "key_name" {
  description = "Nome da chave SSH para acesso às instâncias"
  type        = string
  default     = "my-key"
}
