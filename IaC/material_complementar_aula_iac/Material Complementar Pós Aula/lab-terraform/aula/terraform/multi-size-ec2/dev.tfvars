# Configurações para ambiente DEV
environment = "dev"

# Configurações de rede
vpc_cidr = "10.0.0.0/16"
availability_zones = [
  "us-east-1a",
  "us-east-1b"
]
public_subnet_cidrs = [
  "10.0.1.0/24",
  "10.0.2.0/24"
]

# Configurações de EC2
ec2_count     = 2
#ec2_count     = 2
instance_type = "t2.micro"
#instance_type = "t2.medium"
key_name      = "dev-key"
