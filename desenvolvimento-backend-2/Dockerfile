FROM python:3.13

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip && pip install -r requirements.txt

# Mantém o container rodando (útil para dev)
ENTRYPOINT ["tail", "-f", "/dev/null"]
