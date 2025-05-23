import json

produtos = []

while True:
    nome = input("Nome do produto: ")
    categoria = input("Categoria: ")
    preco = float(input("Preço (R$): "))

    produtos.append({
        "nome": nome,
        "categoria": categoria,
        "preco": preco
    })

    continuar = input("Deseja cadastrar outro produto? (s/n): ")
    if continuar.lower() != "s":
        break

# Salva os produtos em um arquivo JSON
with open("produtos.json", "w", encoding="utf-8") as f:
    json.dump(produtos, f, ensure_ascii=False, indent=4)
print("\nArquivo 'produtos.json' salvo com sucesso!")

print("\nProdutos cadastrados:")
for produto in produtos:
    print(f"Nome: {produto['nome']} | Categoria: {produto['categoria']} | Preço: R$ {produto['preco']:.2f}")
