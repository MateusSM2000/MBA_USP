# Ambiente Python para Desenvolvimento

Este repositório contém exemplos de projetos utilizando FastAPI e Django. Siga as instruções abaixo para configurar o ambiente e executar os projetos.

---

## 1. Subindo o ambiente com Docker

Para criar e utilizar o ambiente Python com Docker, execute o comando abaixo na raiz do projeto:

```
docker-compose up -d --build
```

Para parar e remover os containers, redes, volumes e todas as imagens associadas ao serviço definido no Docker Compose:

```
docker compose down --rmi all -v
```

---

## 2. Como subir o projeto com FastAPI

Para rodar o projeto FastAPI localmente, utilize o comando abaixo no terminal, dentro da pasta do projeto:

```
uvicorn app:app --host 0.0.0.0 --port 4000 --reload
```

- `uvicorn` é um servidor ASGI (Asynchronous Server Gateway Interface) leve e rápido, utilizado para rodar aplicações Python assíncronas. Ele permite que sua aplicação responda a múltiplas requisições simultaneamente, aproveitando recursos de programação assíncrona para melhor desempenho e escalabilidade. Uvicorn é frequentemente usado em ambientes de desenvolvimento e produção para servir APIs modernas escritas em Python.
- `app:app` indica o arquivo e a aplicação FastAPI.
- `--host 0.0.0.0 --port 4000` define o endereço e a porta do servidor.
- `--reload` ativa o modo de recarregamento automático durante o desenvolvimento.
- O serviço ficará disponível em [http://localhost:4000](http://localhost:4000).

---

## 3. Como subir o projeto com Django

Para rodar o projeto Django, siga os passos abaixo no terminal, dentro da pasta do projeto:

1. Aplique as migrações do banco de dados:
   ```
   python manage.py migrate
   ```
2. Inicie o servidor de desenvolvimento:
   ```
   python manage.py runserver 0.0.0.0:8000
   ```
> O arquivo manage.py é um utilitário padrão criado automaticamente em projetos Django. Ele serve como uma interface de linha de comando para várias tarefas administrativas do projeto, como rodar o servidor de desenvolvimento, aplicar migrações no banco de dados, criar usuários, executar testes e outros comandos úteis para gerenciar o ciclo de vida da aplicação Django.

---