# Configurações para ambiente PROD
environment = "prod"

# Configurações de rede
vpc_cidr = "10.2.0.0/16"
availability_zones = [
  "us-east-1a",
  "us-east-1b",
  "us-east-1c",
  "us-east-1d"
]
public_subnet_cidrs = [
  "10.2.1.0/24",
  "10.2.2.0/24",
  "10.2.3.0/24",
  "10.2.4.0/24"
]

# Configurações de EC2
ec2_count     = 4
#ec2_count     = 5
instance_type = "t2.medium"
#instance_type = "t2.small"
key_name      = "prod-key"
