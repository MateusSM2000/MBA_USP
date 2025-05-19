import { carregarProdutos } from './productService.js';

export async function renderizarProdutos(produtos) {
  const container = document.querySelector(".produtos");
  container.innerHTML = "";

  if (produtos.length === 0) {
    container.innerHTML = "<p class='mensagem-vazia'>Nenhum produto encontrado...</p>";
    return;
  }

  for (let produto of produtos) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}" />
      <h2>${produto.nome}</h2>
      <p>R$ ${produto.preco.toFixed(2)}</p>
      <button>Comprar</button>
    `;
    container.appendChild(card);
  }
}

// função principal de carregamento
export async function initProdutos() {
  const produtos = await carregarProdutos();
  renderizarProdutos(produtos);
  return produtos; // para uso na busca
}
