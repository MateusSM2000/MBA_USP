#!/usr/bin/env python3
"""
Exemplo 2: Arquitetura de Microsserviços
Demonstra uma arquitetura de microsserviços com API Gateway, service mesh e múltiplos serviços
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import ECS, Lambda
from diagrams.aws.database import Dynamodb, RDS
from diagrams.aws.integration import SQS, SNS
from diagrams.aws.network import APIGateway, ELB
from diagrams.aws.storage import S3
from diagrams.onprem.client import Users
from diagrams.onprem.inmemory import Redis
from diagrams.k8s.network import Service

def create_microservices_architecture():
    """Cria diagrama de arquitetura de microsserviços """
    
    with Diagram(
        "02 - Arquitetura de Microsserviços",
        filename="/app/output/02-microservices",
        show=False,
        direction="TB",
        graph_attr={
            "fontsize": "16",
            "bgcolor": "white",
            "pad": "0.5",
            "splines": "ortho"
        }
    ):
        # Usuários e clientes
        users = Users("Usuários")
        
        # API Gateway
        api_gateway = APIGateway("API Gateway")
        
        # Load Balancer interno
        internal_lb = ELB("Internal LB")
        
        # Cluster de microsserviços
        with Cluster("Microsserviços"):
            # Serviço de usuários
            with Cluster("User Service"):
                user_service = ECS("User API")
                user_db = RDS("User DB")
                user_service - user_db
            
            # Serviço de produtos
            with Cluster("Product Service"):
                product_service = ECS("Product API")
                product_db = Dynamodb("Product DB")
                product_service - product_db
            
            # Serviço de pedidos
            with Cluster("Order Service"):
                order_service = ECS("Order API")
                order_db = RDS("Order DB")
                order_service - order_db
            
            # Serviço de pagamento
            with Cluster("Payment Service"):
                payment_service = ECS("Payment API")
                payment_db = RDS("Payment DB")
                payment_service - payment_db
            
            # Serviço de notificações
            notification_service = Lambda("Notification Service")
        
        # Service Mesh / Service Discovery
        service_mesh = Service("Service Mesh")
        
        # Mensageria
        with Cluster("Mensageria"):
            message_queue = SQS("Message Queue")
            event_bus = SNS("Event Bus")
        
        # Cache compartilhado
        shared_cache = Redis("Shared Cache")
        
        # Storage para arquivos
        file_storage = S3("File Storage")
        
        # Conexões principais
        users >> Edge(label="HTTPS") >> api_gateway
        api_gateway >> Edge(label="Route") >> internal_lb
        
        # Roteamento para microsserviços
        internal_lb >> Edge(label="Users") >> user_service
        internal_lb >> Edge(label="Products") >> product_service
        internal_lb >> Edge(label="Orders") >> order_service
        internal_lb >> Edge(label="Payments") >> payment_service
        
        # Service mesh conecta todos os serviços
        service_mesh >> [user_service, product_service, order_service, payment_service]
        
        # Comunicação assíncrona
        order_service >> Edge(label="Order Created") >> event_bus
        payment_service >> Edge(label="Payment Processed") >> event_bus
        
        event_bus >> Edge(label="Notifications") >> message_queue
        message_queue >> notification_service
        
        # Cache compartilhado
        [user_service, product_service] >> shared_cache
        
        # Storage de arquivos
        [user_service, product_service] >> file_storage
        
        # Comunicação entre serviços (exemplos)
        order_service >> Edge(label="Get User", style="dashed") >> user_service
        order_service >> Edge(label="Get Product", style="dashed") >> product_service
        order_service >> Edge(label="Process Payment", style="dashed") >> payment_service

if __name__ == "__main__":
    print("Gerando diagrama: Arquitetura de Microsserviços...")
    create_microservices_architecture()
    print("Diagrama gerado: /app/output/02-microservices.png")
