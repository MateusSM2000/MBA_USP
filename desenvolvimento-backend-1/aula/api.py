import requests

response = requests.get('https://economia.awesomeapi.com.br/last/USD-BRL')

if response.status_code == 200:
    cotacao_dolar = float(response.json()['USDBRL']['bid'])
    print(f'Contação dólar atual: {cotacao_dolar}')