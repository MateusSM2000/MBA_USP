# base da imagem Docker a ser utilizada
FROM python:3.9

# copiar os arquivos da pasta src (source) para diretório padrão do container
COPY . .

# rodar um comando para instalar os pacotes necessários 
RUN pip install -r requirements.txt

# executar o container como um arquivo executável
ENTRYPOINT [ "sh", "start.sh" ]