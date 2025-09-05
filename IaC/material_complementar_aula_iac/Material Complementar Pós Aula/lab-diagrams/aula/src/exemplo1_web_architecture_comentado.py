#!/usr/bin/env python3
"""
Exemplo 1: Arquitetura Web Simples
Demonstra uma arquitetura web básica com load balancer, servidores web e banco de dados.
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB
from diagrams.onprem.client import Users

def create_web_architecture():
    with Diagram("Arquitetura Web Simples - USP", filename="/app/output/web_architecture", show=False):
        users = Users("Usuários")
        
        with Cluster("AWS Cloud"):
            lb = ELB("Load Balancer")
            
            with Cluster("Web Servers"):
                web_servers = [
                    EC2("Web Server 1"),
                    EC2("Web Server 2"),
                    EC2("Web Server 3")
#                   EC2("Web Server 4")
#                   EC2("Web Server 5")
                ]
            
            with Cluster("Database"):
                db = RDS("PostgreSQL")
        
        # Conexões
        users >> Edge(label="HTTPS") >> lb
        lb >> web_servers
        web_servers >> Edge(label="SQL") >> db

if __name__ == "__main__":
    create_web_architecture()
    print("Diagrama 'Arquitetura Web Simples' criado em output/web_architecture.png")
