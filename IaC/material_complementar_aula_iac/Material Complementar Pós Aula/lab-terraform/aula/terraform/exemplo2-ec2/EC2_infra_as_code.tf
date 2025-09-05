
resource "aws_instance" "exemplo_ec2" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t2.micro"
  
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
