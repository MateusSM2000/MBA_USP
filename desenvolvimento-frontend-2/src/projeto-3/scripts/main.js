import {loadData} from './productService.js';
import {showProducts} from './showProducts.js'
import {activateSearch} from './searchProducts.js'

let produtos = await loadData()
console.log(produtos)

showProducts(produtos)

activateSearch(produtos)