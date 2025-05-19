import { renderizarProdutos } from './showProducts.js';

export function ativarBusca(produtos) {
  const input = document.getElementById("searchInput");

  input.addEventListener("input", (event) => {
    const busca = event.target.value.toLowerCase();
    const filtrados = produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(busca)
    );
    renderizarProdutos(filtrados);
  });
}
