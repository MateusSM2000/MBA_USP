from pydantic import BaseModel


class Product(BaseModel):
    """
    Modelo de dados de um produto.
    :id : int: Id do produto.
    name: str: Nome do produto.
    description: str: Descrição do produto.
    price: float: Preço do produto.
    """
    id: int
    name: str
    description: str
    price: float


class CreateProduct(BaseModel):
    name: str
    description: str
    price: float