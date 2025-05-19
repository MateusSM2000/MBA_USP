export async function carregarProdutos() {
    const response = await fetch('data/data.json');
    const produtos = await response.json();
    return produtos;
}