export function showProducts(dataJson) {
    let productsSection = document.querySelector('.produtos')
    productsSection.innerHTML = ''

    if (dataJson === undefined) {
        productsSection.innerHTML = '<p>Nenhum produto encontrado...</p>'
        return
    }

    for (let produto of dataJson) {
        let div = document.createElement('div')
        div.classList.add('card')
        div.innerHTML = `
            <img src=${produto.imagem} alt=${produto.nome} />
            <h2>${produto.nome}</h2>
            <p>R$ ${produto.preco}</p>
            <button>Comprar</button>
        `
        productsSection.appendChild(div)
    }

}