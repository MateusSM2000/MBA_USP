from fastapi import FastAPI
from models.products import Product, ProductCreate

app = FastAPI()

@app.get('/')
def say():
    return {'Fast':'FastAPI'}

@app.get('/api/ola/{name}')
def say_hi(name:str):
    if not name:
        pass
    return {'Hello':name}

data = [
    Product(id=1, name='Tenis Nike Air', description='Calçados', price=199.99),
    Product(id=2, name='Iphone', description='Celulares', price=3928.99),
    Product(id=3, name='Notebook', description='Eletrônicos', price=4928.97),
]

@app.get('/api/products')
def get_products():
    return data

@app.get("/api/products/{product_id}")
def get_product_by_id(product_id: int):
    for product in data:
        if product.id == product_id:
            return product
    return {"message": "Nenhum produto encontrado com o ID fornecido"}

@app.put('/api/products/{product_id}')
def update_product(product_id: int, updated_product: Product):
    for i, product in enumerate(data):
        if product.id == product_id:
            data[i] = updated_product
            return {
                'message': 'Produto atualizado com sucesso',
                'product': updated_product
            }
    return {'message': 'Produto não encontrado para atualização'}

@app.delete('/api/products/{product_id}')
def delete_product(product_id: int):
    for i, product in enumerate(data):
        if product.id == product_id:
            deleted = data.pop(i)
            return {
                'message': 'Produto deletado com sucesso',
                'deleted': deleted
            }
    return {'message': 'Produto não encontrado para exclusão'}


@app.post('/api/products')
def create_product(new_product: ProductCreate):
    last_id = max([product.id for product in data], default=0)
    new_id = last_id + 1
    
    product_to_add = Product(
        id=new_id,
        name=new_product.name,
        description=new_product.description,
        price=new_product.price
    )
    
    data.append(product_to_add)
    return {
        'message': 'Produto criado com sucesso',
        'product': product_to_add
    }