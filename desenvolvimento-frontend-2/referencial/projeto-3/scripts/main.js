import { initProdutos } from './showProducts.js';
import { ativarBusca } from './searchProducts.js';

async function init() {
  const produtos = await initProdutos();
  ativarBusca(produtos);
}

init();