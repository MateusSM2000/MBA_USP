import {showProducts} from './showProducts.js'

export function activateSearch(dataJson) {
    let input = document.getElementById('searchInput')
    input.addEventListener('input', (event) => {
        let search = event.target.value.toLowerCase()
        let filteredProducts = dataJson.filter((product) => {
            return product.nome.toLowerCase().includes(search)
        })
        showProducts(filteredProducts)
    })
}