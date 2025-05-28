from fastapi import FastAPI
from models.products import Product, CreateProduct

data = [
    Product(id=1, name='Tenis Nike Air', description='Calçados', price=199.99),
    Product(id=2, name='Iphone', description='Celulares', price=3928.99),
    Product(id=3, name='Notebook', description='Eletrônicos', price=4928.97)
]

api = FastAPI()

@api.get('/api/products')
def get_produtos() -> list[Product]:
    return data

@api.get('/api/products/{product_id}')
def get_product_by_id(product_id: int) -> Product | dict:
    for product in data:
        if product.id == product_id:
            return product
    return {'message': 'Product not found'}

@api.post('/api/products')
def create_product(product: CreateProduct) -> dict:
    new_product = Product(id= len(data)+1, **product.__dict__)
    data.append(new_product)
    return {'Product created': new_product}

@api.delete('/api/products/{product_id}')
def delete_product_by_id(product_id: int) -> dict:
    for product in data:
        if product.id == product_id:
            data.remove(product)
            return {'Product deleted': product}
    return {'message': 'Product has not been found'}

@api.put('/api/products/{product_id}')
def update_product_by_id(product_id: int, updated_product: Product) -> dict:
    for i, product in enumerate(data):
        if product.id == product_id:
            data[i] = updated_product
            return {'Old product parameters': product, 'New product parameters': data[i]}
    return {'message': 'Product not found'}