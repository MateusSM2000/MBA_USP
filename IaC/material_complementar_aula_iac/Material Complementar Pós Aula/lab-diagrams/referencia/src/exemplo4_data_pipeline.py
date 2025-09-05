#!/usr/bin/env python3
"""
Exemplo 4: Pipeline de Dados
Demonstra um pipeline de processamento de dados com ETL e analytics.
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.storage import S3
from diagrams.aws.analytics import Glue, Athena, Quicksight
from diagrams.aws.database import Redshift
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.analytics import Spark

def create_data_pipeline():
    with Diagram("Pipeline de Dados", filename="/app/output/data_pipeline", show=False):
        
        with Cluster("Fontes de Dados"):
            postgres = PostgreSQL("PostgreSQL")
            s3_raw = S3("Raw Data\n(S3)")
        
        with Cluster("Processamento ETL"):
            glue = Glue("AWS Glue")
            spark = Spark("Spark Jobs")
        
        with Cluster("Data Lake"):
            s3_processed = S3("Processed Data\n(S3)")
        
        with Cluster("Data Warehouse"):
            redshift = Redshift("Redshift")
        
        with Cluster("Analytics"):
            athena = Athena("Athena")
            quicksight = Quicksight("QuickSight")
        
        # Fluxo de dados
        postgres >> Edge(label="extract") >> glue
        s3_raw >> Edge(label="raw data") >> glue
        
        glue >> Edge(label="transform") >> spark
        spark >> Edge(label="load") >> s3_processed
        
        s3_processed >> Edge(label="load") >> redshift
        s3_processed >> Edge(label="query") >> athena
        
        redshift >> Edge(label="visualize") >> quicksight
        athena >> Edge(label="ad-hoc queries") >> quicksight

if __name__ == "__main__":
    create_data_pipeline()
    print("Diagrama 'Pipeline de Dados' criado em output/data_pipeline.png")
