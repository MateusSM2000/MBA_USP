import requests

# Obtém a cotação do dólar
response = requests.get("https://economia.awesomeapi.com.br/json/last/USD-BRL")
data = response.json()
taxa_dolar = float(data["USDBRL"]["bid"])

# Entrada do usuário em reais
valor_reais = float(input("Digite o valor em reais (R$): "))

# Conversão
valor_em_dolar = valor_reais / taxa_dolar

print(f"Valor em dólar: US$ {valor_em_dolar:.2f} (cotação: R$ {taxa_dolar:.2f})")
