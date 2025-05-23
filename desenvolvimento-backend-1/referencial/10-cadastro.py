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

print("\nProdutos cadastrados:")
for produto in produtos:
    print(f"Nome: {produto['nome']} | Categoria: {produto['categoria']} | Preço: R$ {produto['preco']:.2f}")
