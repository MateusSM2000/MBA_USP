// crianos um array de produtos e exibindo na tela
const produtos = [
  {
    nome: "Produto 1",
    preco: 99.9,
    imagem: "img.jpeg",
  },
  {
    nome: "Produto 2",
    preco: 129.9,
    imagem: "img.jpeg",
  },
  {
    nome: "Produto 3",
    preco: 89.9,
    imagem: "img.jpeg",
  }
]
// selecionando o container onde os produtos serão exibidos
const container = document.querySelector(".produtos");
// criando os cards de produtos
// e adicionando a lista de produtos
for (const produto of produtos) {
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