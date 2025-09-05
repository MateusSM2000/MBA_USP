#!/usr/bin/env python3
"""
Exemplo 3: Arquitetura de Microserviços
Demonstra uma arquitetura de microserviços com API Gateway, serviços e mensageria.
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import APIGateway
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb
from diagrams.aws.integration import SQS
from diagrams.onprem.client import Client

def create_microservices_architecture():
    with Diagram("Arquitetura de Microserviços", filename="/app/output/03-microservices", show=False):
        client = Client("Mobile/Web App")
        
        with Cluster("AWS Cloud"):
            api_gateway = APIGateway("API Gateway")
            
            with Cluster("Microserviços"):
                user_service = Lambda("User Service")
                order_service = Lambda("Order Service")
                payment_service = Lambda("Payment Service")
                notification_service = Lambda("Notification Service")
            
            with Cluster("Databases"):
                user_db = Dynamodb("User DB")
                order_db = Dynamodb("Order DB")
                payment_db = Dynamodb("Payment DB")
            
            with Cluster("Mensageria"):
                queue = SQS("Message Queue")
        
        # Conexões
        client >> api_gateway
        
        api_gateway >> user_service >> user_db
        api_gateway >> order_service >> order_db
        api_gateway >> payment_service >> payment_db
        
        # Comunicação assíncrona
        order_service >> Edge(label="order created") >> queue
        payment_service >> Edge(label="payment processed") >> queue
        queue >> notification_service

if __name__ == "__main__":
    create_microservices_architecture()
    print("Diagrama 'Arquitetura de Microserviços' criado em output/03-microservices.png")
