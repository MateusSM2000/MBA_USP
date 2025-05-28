from django.contrib import admin
from produtos.models import Product


admin.site.register(Product)
admin.site.site_header = 'Administração de Produtos'