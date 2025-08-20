// Sistema de Carros - JavaScript Principal

document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alerts após 5 segundos
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Validação de formulários
    const forms = document.querySelectorAll('form[novalidate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Validação de senha no cadastro
    const senhaInput = document.querySelector('input[name="senha"]');
    const confirmarSenhaInput = document.querySelector('input[name="confirmar_senha"]');
    
    if (senhaInput && confirmarSenhaInput) {
        function validatePasswords() {
            if (senhaInput.value !== confirmarSenhaInput.value) {
                confirmarSenhaInput.setCustomValidity('As senhas não coincidem');
            } else {
                confirmarSenhaInput.setCustomValidity('');
            }
        }
        
        senhaInput.addEventListener('input', validatePasswords);
        confirmarSenhaInput.addEventListener('input', validatePasswords);
    }

    // Formatação de preço
    const precoInputs = document.querySelectorAll('input[name="preco"]');
    precoInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value) {
                const value = parseFloat(this.value);
                if (!isNaN(value)) {
                    this.value = value.toFixed(2);
                }
            }
        });
    });

    // Validação de ano
    const anoInputs = document.querySelectorAll('input[name="ano_fabricacao"]');
    const currentYear = new Date().getFullYear();
    anoInputs.forEach(input => {
        input.addEventListener('input', function() {
            const year = parseInt(this.value);
            if (year && (year < 1900 || year > currentYear + 1)) {
                this.setCustomValidity(`Ano deve estar entre 1900 e ${currentYear + 1}`);
            } else {
                this.setCustomValidity('');
            }
        });
    });

    // Confirmação de exclusão
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm-delete') || 'Tem certeza que deseja excluir este item?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // Busca em tempo real (se existir campo de busca)
    const searchInput = document.querySelector('input[name="busca"]');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 3 || this.value.length === 0) {
                    // Submeter busca automaticamente
                    this.form.submit();
                }
            }, 500);
        });
    }

    // Tooltips do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Popovers do Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

// Funções globais
function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
}

function showLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
    button.disabled = true;
    
    // Re-habilitar após 10 segundos como fallback
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 10000);
}

function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Função para imprimir relatórios
function printReport() {
    window.print();
}

// Validação personalizada de formulários
function validateCarForm(formData) {
    const errors = [];
    
    if (!formData.get('modelo')?.trim()) {
        errors.push('Modelo é obrigatório');
    }
    
    if (!formData.get('fabricante')?.trim()) {
        errors.push('Fabricante é obrigatório');
    }
    
    if (!formData.get('tipo')?.trim()) {
        errors.push('Tipo é obrigatório');
    }
    
    if (!formData.get('marca_modelo')?.trim()) {
        errors.push('Marca/Modelo é obrigatório');
    }
    
    const ano = formData.get('ano_fabricacao');
    if (!ano || isNaN(ano) || ano < 1900 || ano > new Date().getFullYear() + 1) {
        errors.push('Ano de fabricação inválido');
    }
    
    const preco = formData.get('preco');
    if (preco && (isNaN(preco) || preco < 0)) {
        errors.push('Preço deve ser um número positivo');
    }
    
    return errors;
}
