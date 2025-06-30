from fastapi import FastAPI
import os

HOSTNAME = os.environ["HOSTNAME"]
DB_USUARIO = os.environ["DB_USUARIO"]
DB_SENHA = os.environ["DB_SENHA"]

app = FastAPI()


@app.get("/")
async def root():
    return {"message": f"Estou rodando dentro do pod Kubernetes de nome {HOSTNAME} em um ReplicaSet"}


@app.get("/variaveis_de_ambiente")
async def variaveis_de_ambiente():
    return {"DB_USUARIO": DB_USUARIO, "DB_SENHA": DB_SENHA}