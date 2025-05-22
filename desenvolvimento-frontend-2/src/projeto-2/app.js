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

console.log(`Quantidade de produtos: ${produtos.length}`)