data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_security_group" "ec2_sg" {
  name_prefix = "ec2-exemplo-sg"
  description = "Security group para EC2 exemplo"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "exemplo_ec2" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t2.micro"
  
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd
              systemctl start httpd
              systemctl enable httpd
              echo "<h1>Servidor Web LocalStack</h1>" > /var/www/html/index.html
              EOF

  tags = {
    Name = "EC2-Exemplo-LocalStack"
  }
}

output "instance_id" {
  value = aws_instance.exemplo_ec2.id
}

output "instance_public_ip" {
  value = aws_instance.exemplo_ec2.public_ip
}

output "security_group_id" {
  value = aws_security_group.ec2_sg.id
}
