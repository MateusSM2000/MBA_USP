let produtos = [
    {
        nome: 'Tênis 1',
        preco: 319.99,
        imagem: 'img.jpeg',
    },
    {
        nome: 'Tênis 2',
        preco: 219.99,
        imagem: 'img.jpeg',
    },
    {
        nome: 'Tênis 3',
        preco: 178.19,
        imagem: 'img.jpeg',
    }
]

console.log(produtos)

let secaoProdutos = document.querySelector('.produtos')
for (let produto of produtos) {
    let div = document.createElement('div')
    div.classList.add('card')
    div.innerHTML = `
        <img src=${produto.imagem} alt=${produto.nome} />
        <h2>${produto.nome}</h2>
        <p>R$ ${produto.preco}</p>
        <button>Comprar</button>
    `
secaoProdutos.appendChild(div)
}
