import json

def exibir_menu():
    print("\n=== Sistema de Cadastro de Produtos ===")
    print("1 - Cadastrar produto")
    print("2 - Listar produtos")
    print("3 - Exportar dados para JSON")
    print("4 - Sair")

def cadastrar_produto(produtos):
    nome = input("Nome do produto: ")
    categoria = input("Categoria: ")
    preco = float(input("Preço (R$): "))
    produto = {
        "nome": nome,
        "categoria": categoria,
        "preco": preco
    }
    produtos.append(produto)
    print("Produto cadastrado com sucesso!")

def listar_produtos(produtos):
    if not produtos:
        print("Nenhum produto cadastrado.")
        return

    print("\nProdutos cadastrados:")
    for i, p in enumerate(produtos, start=1):
        print(f"{i}. Nome: {p['nome']} | Categoria: {p['categoria']} | Preço: R$ {p['preco']:.2f}")

def exportar_para_json(produtos):
    if not produtos:
        print("Nenhum produto para exportar.")
        return

    with open("produtos.json", "w", encoding="utf-8") as f:
        json.dump(produtos, f, ensure_ascii=False, indent=4)
    print("Dados exportados com sucesso para 'produtos.json'.")

def main():
    produtos = []

    while True:
        exibir_menu()
        opcao = input("Escolha uma opção: ")

        if opcao == "1":
            cadastrar_produto(produtos)
        elif opcao == "2":
            listar_produtos(produtos)
        elif opcao == "3":
            exportar_para_json(produtos)
        elif opcao == "4":
            print("Saindo do sistema. Até mais!")
            break
        else:
            print("Opção inválida. Tente novamente.")

if __name__ == "__main__":
    main()
