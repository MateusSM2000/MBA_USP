from diagrams import Diagram
from diagrams.c4 import Person, Container, Database, SystemBoundary, Relationship

with Diagram("C4 - Internet Banking com Mobile e Notificações", filename="/app/output/C4-Internet_Banking_com_Mobile.png", show=False,  direction="TB"):
    customer = Person("Cliente", "Usuário do banco via Web e Mobile")

    with SystemBoundary("Internet Banking System"):
        webapp = Container(
            "Web Application",
            "Java Spring MVC",
            "Interface web para clientes"
        )

        api = Container(
            "API Application",
            "Java REST API",
            "Fornece endpoints JSON"
        )

        database = Database(
            "Database",
            "Oracle",
            "Armazena dados dos clientes"
        )

        notification_service = Container(
            "Notification Service",
            "Node.js",
            "Envia emails e notificações push"
        )

    mobileapp = Container(
        "Mobile App",
        "Flutter",
        "Aplicativo móvel para clientes"
    )

    customer >> Relationship("Usa Web") >> webapp
    customer >> Relationship("Usa Mobile") >> mobileapp

    webapp >> Relationship("Consome API") >> api
    mobileapp >> Relationship("Consome API") >> api

    api >> Relationship("Armazena dados") >> database
    api >> Relationship("Aciona notificações") >> notification_service
