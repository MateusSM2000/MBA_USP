# Configurações para ambiente QA
environment = "qa"

# Configurações de rede
vpc_cidr = "10.1.0.0/16"
availability_zones = [
  "us-east-1a",
  "us-east-1b"
]
public_subnet_cidrs = [
  "10.1.1.0/24",
  "10.1.2.0/24"
]

# Configurações de EC2
ec2_count     = 2
#ec2_count     = 1
instance_type = "t2.small"
#instance_type = "t2.medium"
key_name      = "qa-key"
