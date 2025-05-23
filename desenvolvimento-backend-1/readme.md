# Usando o docker com Python 3.13

- Faça o download deste repositório

- Abra a paste de preferência no [Visual Studio Code](https://code.visualstudio.com/)

- Agora, suba a imagem com `docker compose up --build`

- Crie seus arquivos Python na pasta _aula_

## Como executar um arquivo Python usando o Attach Shell

Vamos utilizar a extensão do Docker no Visual Studio Code para facilitar a execução dos arquivos Python dentro do container.

### Passos:

1. Certifique-se de que o container está rodando (`docker compose up`).
2. No VS Code, clique no ícone do Docker na barra lateral esquerda.
3. Encontre o container chamado `app` (ou o nome do seu container) na lista de containers em execução.
4. Clique com o botão direito sobre o container e selecione **Attach Shell**.
5. Um terminal será aberto já dentro do container.

Agora, para executar um arquivo Python, digite no terminal:

```
python nome_do_arquivo.py
```

Substitua `nome_do_arquivo.py` pelo nome do arquivo que deseja executar.

> Dessa forma, você pode rodar quantos arquivos quiser, sem precisar reiniciar o container a cada execução.
