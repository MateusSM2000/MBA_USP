# Importa a classe HttpUser do módulo Locust e outras funcionalidades necessárias
from locust import HttpUser, task, between

# Define uma classe chamada TesteDeCarga que herda de HttpUser
class TesteDeCarga(HttpUser):

    # Define o tempo de espera entre as solicitações (entre 1 e 3 segundos)
    wait_time = between(1, 3)

    # Define uma tarefa (task) que o usuário realizará durante o teste
    @task(1)
    def usuario_fazendo_requisicao(self):
        # Realiza uma solicitação HTTP GET para a rota "/"
        self.client.get("/")