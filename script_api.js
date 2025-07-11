// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado da aplicação
const AppState = {
    stores: [],
    products: [],
    currentStore: null,
    currentView: 'all-products',
    isLoggedIn: false,
    editingProduct: null
};

// Elementos DOM
const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    todosProductsBtn: document.getElementById('todosProductsBtn'),
    addProductBtn: document.getElementById('addProductBtn'),
    manageProductsBtn: document.getElementById('manageProductsBtn'),
    storeSelect: document.getElementById('storeSelect'),
    storeLogin: document.getElementById('storeLogin'),
    storePassword: document.getElementById('storePassword'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    pageTitle: document.getElementById('pageTitle'),
    storeFilter: document.getElementById('storeFilter'),
    sortFilter: document.getElementById('sortFilter'),
    searchInput: document.getElementById('searchInput'),
    productsSection: document.getElementById('productsSection'),
    productsGrid: document.getElementById('productsGrid'),
    productFormSection: document.getElementById('productFormSection'),
    formTitle: document.getElementById('formTitle'),
    productForm: document.getElementById('productForm'),
    productImage: document.getElementById('productImage'),
    imagePreview: document.getElementById('imagePreview'),
    productName: document.getElementById('productName'),
    productDefect: document.getElementById('productDefect'),
    productRCT: document.getElementById('productRCT'),
    originalPrice: document.getElementById('originalPrice'),
    promotionalPrice: document.getElementById('promotionalPrice'),
    finalPrice: document.getElementById('finalPrice'),
    cancelFormBtn: document.getElementById('cancelFormBtn'),
    saveProductBtn: document.getElementById('saveProductBtn'),
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    confirmOkBtn: document.getElementById('confirmOkBtn'),
    addProductMenuItem: document.getElementById('addProductMenuItem'),
    manageProductsMenuItem: document.getElementById('manageProductsMenuItem')
};

// Utilitários
const Utils = {
    formatPrice: (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    },

    generateId: () => {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showToast: (message, type = 'info') => {
        // Implementação simples de toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
            background-color: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#2563eb'};
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
};

// API Service
const ApiService = {
    async request(endpoint, options = {}) {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    },

    // Métodos para lojas
    async getStores() {
        return this.request('/stores');
    },

    async authenticateStore(storeId, password) {
        return this.request('/stores/auth', {
            method: 'POST',
            body: JSON.stringify({ storeId, password })
        });
    },

    // Métodos para produtos
    async getProducts() {
        return this.request('/defective-products');
    },

    async getProductsByStore(storeId) {
        return this.request(`/defective-products/store/${storeId}`);
    },

    async addProduct(productData) {
        const formData = new FormData();
        
        // Adicionar campos de texto
        Object.keys(productData).forEach(key => {
            if (key !== 'image' && productData[key] !== null && productData[key] !== undefined) {
                formData.append(key, productData[key]);
            }
        });

        // Adicionar imagem se existir
        if (productData.image instanceof File) {
            formData.append('image', productData.image);
        }

        return this.request('/defective-products', {
            method: 'POST',
            headers: {}, // Remover Content-Type para FormData
            body: formData
        });
    },

    async updateProduct(id, productData) {
        const formData = new FormData();
        
        // Adicionar campos de texto
        Object.keys(productData).forEach(key => {
            if (key !== 'image' && productData[key] !== null && productData[key] !== undefined) {
                formData.append(key, productData[key]);
            }
        });

        // Adicionar imagem se existir
        if (productData.image instanceof File) {
            formData.append('image', productData.image);
        }

        return this.request(`/defective-products/${id}`, {
            method: 'PUT',
            headers: {}, // Remover Content-Type para FormData
            body: formData
        });
    },

    async deleteProduct(id) {
        return this.request(`/defective-products/${id}`, {
            method: 'DELETE'
        });
    }
};

// Gerenciamento de Estado
const StateManager = {
    saveToLocalStorage: () => {
        localStorage.setItem('storeAppState', JSON.stringify({
            currentStore: AppState.currentStore,
            isLoggedIn: AppState.isLoggedIn
        }));
    },

    loadFromLocalStorage: () => {
        const saved = localStorage.getItem('storeAppState');
        if (saved) {
            const state = JSON.parse(saved);
            AppState.currentStore = state.currentStore;
            AppState.isLoggedIn = state.isLoggedIn || false;
        }
    },

    getStoreById: (id) => {
        return AppState.stores.find(store => {
            const storeId = store._id || store.id;
            return storeId.toString() === id.toString();
        });
    },

    getProductsByStore: (storeId) => {
        return AppState.products.filter(product => {
            const productStoreId = product.storeId || product.store_id;
            return productStoreId.toString() === storeId.toString();
        });
    },

    async loadStores() {
        try {
            AppState.stores = await ApiService.getStores();
        } catch (error) {
            console.error('Erro ao carregar lojas:', error);
            Utils.showToast('Erro ao carregar lojas', 'error');
        }
    },

    async loadProducts() {
        try {
            AppState.products = await ApiService.getProducts();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            Utils.showToast('Erro ao carregar produtos', 'error');
        }
    },

    async addProduct(productData) {
        try {
            const result = await ApiService.addProduct(productData);
            if (result.success) {
                AppState.products.push(result.product);
                StateManager.saveToLocalStorage();
                return result.product;
            }
            throw new Error('Falha ao adicionar produto');
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            throw error;
        }
    },

    async updateProduct(id, productData) {
        try {
            const result = await ApiService.updateProduct(id, productData);
            if (result.success) {
                const index = AppState.products.findIndex(p => {
                    const productId = p._id || p.id;
                    return productId.toString() === id.toString();
                });
                if (index !== -1) {
                    AppState.products[index] = result.product;
                }
                StateManager.saveToLocalStorage();
                return result.product;
            }
            throw new Error('Falha ao atualizar produto');
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    },

    async deleteProduct(id) {
        try {
            const result = await ApiService.deleteProduct(id);
            if (result.success) {
                const index = AppState.products.findIndex(p => {
                    const productId = p._id || p.id;
                    return productId.toString() === id.toString();
                });
                if (index !== -1) {
                    AppState.products.splice(index, 1);
                }
                StateManager.saveToLocalStorage();
                return true;
            }
            throw new Error('Falha ao remover produto');
        } catch (error) {
            console.error('Erro ao remover produto:', error);
            throw error;
        }
    }
};

// Renderização
const Renderer = {
    renderStoresSelect: () => {
        elements.storeSelect.innerHTML = '<option value="">Selecione uma loja</option>';
        AppState.stores.forEach(store => {
            const option = document.createElement('option');
            const storeId = store._id || store.id;
            option.value = storeId;
            option.textContent = store.name;
            if (AppState.currentStore && (AppState.currentStore._id || AppState.currentStore.id).toString() === storeId.toString()) {
                option.selected = true;
            }
            elements.storeSelect.appendChild(option);
        });
    },

    renderStoreFilter: () => {
        elements.storeFilter.innerHTML = '<option value="">Todas as lojas</option>';
        AppState.stores.forEach(store => {
            const option = document.createElement('option');
            const storeId = store._id || store.id;
            option.value = storeId;
            option.textContent = store.name;
            elements.storeFilter.appendChild(option);
        });
    },

    renderProducts: (products = null) => {
        const productsToRender = products || AppState.products;
        const filteredProducts = Renderer.filterAndSortProducts(productsToRender);
        
        elements.productsGrid.innerHTML = '';
        
        if (filteredProducts.length === 0) {
            elements.productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Não há produtos disponíveis no momento.</p>
                </div>
            `;
            return;
        }

        filteredProducts.forEach(product => {
            const productStoreId = product.storeId || product.store_id;
            const store = StateManager.getStoreById(productStoreId);
            const card = Renderer.createProductCard(product, store);
            elements.productsGrid.appendChild(card);
        });
    },

    createProductCard: (product, store) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const productId = product._id || product.id;
        const productStoreId = product.storeId || product.store_id;
        const currentStoreId = AppState.currentStore ? (AppState.currentStore._id || AppState.currentStore.id) : null;
        
        const canManage = AppState.isLoggedIn && currentStoreId && 
                         currentStoreId.toString() === productStoreId.toString();

        card.innerHTML = `
            <img src="${product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjZTJlOGYwIi8+PHRleHQgeD0iMTUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+'}" alt="${product.name}" class="product-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjZTJlOGYwIi8+PHRleHQgeD0iMTUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+'">
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <a href="#" class="product-store" data-store-id="${productStoreId}">${store ? store.name : 'Loja não encontrada'}</a>
                <p class="product-defect">${product.defect}</p>
                <div class="product-rct">RCT: ${product.rct}</div>
                <div class="product-prices">
                    <span class="original-price">${Utils.formatPrice(product.originalPrice)}</span>
                    ${product.promotionalPrice ? `<span class="promotional-price">${Utils.formatPrice(product.promotionalPrice)}</span>` : ''}
                    <span class="final-price">${Utils.formatPrice(product.finalPrice)}</span>
                </div>
                <div class="product-actions">
                    <button class="buy-btn" onclick="ProductActions.buyProduct('${productId}')">
                        <i class="fas fa-shopping-cart"></i> Comprar
                    </button>
                    ${canManage ? `
                        <button class="edit-btn" onclick="ProductActions.editProduct('${productId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="ProductActions.deleteProduct('${productId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Adicionar event listener para o link da loja
        const storeLink = card.querySelector('.product-store');
        storeLink.addEventListener('click', (e) => {
            e.preventDefault();
            Navigation.selectStore(e.target.dataset.storeId);
        });

        return card;
    },

    filterAndSortProducts: (products) => {
        let filtered = [...products];
        
        // Filtrar por loja (apenas na visualização "todos os produtos")
        if (AppState.currentView === 'all-products') {
            const selectedStoreId = elements.storeFilter.value;
            if (selectedStoreId) {
                filtered = filtered.filter(product => {
                    const productStoreId = product.storeId || product.store_id;
                    return productStoreId.toString() === selectedStoreId.toString();
                });
            }
        }
        
        // Filtrar por busca
        const searchTerm = elements.searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.defect.toLowerCase().includes(searchTerm) ||
                product.rct.toLowerCase().includes(searchTerm)
            );
        }

        // Ordenar
        const sortBy = elements.sortFilter.value;
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.finalPrice - b.finalPrice;
                case 'store':
                    const storeA = StateManager.getStoreById(a.storeId || a.store_id);
                    const storeB = StateManager.getStoreById(b.storeId || b.store_id);
                    return (storeA?.name || '').localeCompare(storeB?.name || '');
                default:
                    return 0;
            }
        });

        return filtered;
    },

    updateUI: () => {
        // Atualizar navegação ativa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Renderizar select de lojas
        Renderer.renderStoresSelect();
        
        // Renderizar filtro de lojas
        Renderer.renderStoreFilter();

        // Mostrar/esconder filtro de loja baseado na visualização
        if (AppState.currentView === 'all-products') {
            elements.storeFilter.classList.remove('hidden');
        } else {
            elements.storeFilter.classList.add('hidden');
            elements.storeFilter.value = ''; // Resetar filtro
        }

        // Atualizar visibilidade do login da loja no sidebar
        if (AppState.currentStore) {
            elements.storeLogin.classList.remove('hidden');
        } else {
            elements.storeLogin.classList.add('hidden');
        }

        // Atualizar visibilidade dos menus
        if (AppState.isLoggedIn && AppState.currentStore) {
            elements.addProductMenuItem.classList.remove('hidden');
            elements.manageProductsMenuItem.classList.remove('hidden');
            elements.loginBtn.classList.add('hidden');
            elements.logoutBtn.classList.remove('hidden');
        } else {
            elements.addProductMenuItem.classList.add('hidden');
            elements.manageProductsMenuItem.classList.add('hidden');
            elements.loginBtn.classList.remove('hidden');
            elements.logoutBtn.classList.add('hidden');
        }

        // Atualizar título da página
        switch (AppState.currentView) {
            case 'all-products':
                elements.pageTitle.textContent = 'Todos os Produtos';
                elements.todosProductsBtn.classList.add('active');
                break;
            case 'store-products':
                if (AppState.currentStore) {
                    elements.pageTitle.textContent = `Produtos - ${AppState.currentStore.name}`;
                }
                break;
            case 'add-product':
                elements.pageTitle.textContent = 'Adicionar Produto';
                elements.addProductBtn.classList.add('active');
                break;
            case 'manage-products':
                elements.pageTitle.textContent = 'Gerenciar Produtos';
                elements.manageProductsBtn.classList.add('active');
                break;
        }

        // Atualizar visibilidade das seções
        elements.productsSection.classList.toggle('hidden', 
            AppState.currentView === 'add-product');
        elements.productFormSection.classList.toggle('hidden', 
            AppState.currentView !== 'add-product');
    }
};

// Navegação
const Navigation = {
    showAllProducts: async () => {
        AppState.currentView = 'all-products';
        // Não resetar currentStore nem isLoggedIn - manter sessão ativa
        await StateManager.loadProducts();
        Renderer.updateUI();
        Renderer.renderProducts();
        StateManager.saveToLocalStorage();
    },

    selectStore: async (storeId) => {
        const store = StateManager.getStoreById(storeId);
        if (!store) return;

        // Se já está logado na mesma loja, manter login
        if (AppState.currentStore && (AppState.currentStore._id || AppState.currentStore.id).toString() === storeId.toString() && AppState.isLoggedIn) {
            AppState.currentView = 'store-products';
            try {
                const storeProducts = await ApiService.getProductsByStore(storeId);
                Renderer.renderProducts(storeProducts);
            } catch (error) {
                console.error('Erro ao carregar produtos da loja:', error);
                Utils.showToast('Erro ao carregar produtos da loja', 'error');
            }
            Renderer.updateUI();
            return;
        }

        AppState.currentStore = store;
        AppState.currentView = 'store-products';
        // Não resetar isLoggedIn automaticamente
        
        // Limpar senha apenas se mudou de loja
        elements.storePassword.value = '';

        // Renderizar produtos da loja
        try {
            const storeProducts = await ApiService.getProductsByStore(storeId);
            Renderer.renderProducts(storeProducts);
        } catch (error) {
            console.error('Erro ao carregar produtos da loja:', error);
            Utils.showToast('Erro ao carregar produtos da loja', 'error');
        }
        
        Renderer.updateUI();
        StateManager.saveToLocalStorage();
    },

    showAddProduct: () => {
        if (!AppState.isLoggedIn || !AppState.currentStore) {
            Utils.showToast('Você precisa estar logado em uma loja para adicionar produtos.', 'error');
            return;
        }
        
        AppState.currentView = 'add-product';
        AppState.editingProduct = null;
        elements.formTitle.textContent = 'Adicionar Produto';
        elements.saveProductBtn.textContent = 'Salvar Produto';
        ProductForm.clearForm();
        Renderer.updateUI();
    },

    showManageProducts: async () => {
        if (!AppState.isLoggedIn || !AppState.currentStore) {
            Utils.showToast('Você precisa estar logado em uma loja para gerenciar produtos.', 'error');
            return;
        }
        
        AppState.currentView = 'manage-products';
        try {
            const currentStoreId = AppState.currentStore._id || AppState.currentStore.id;
            const storeProducts = await ApiService.getProductsByStore(currentStoreId);
            Renderer.renderProducts(storeProducts);
        } catch (error) {
            console.error('Erro ao carregar produtos para gerenciar:', error);
            Utils.showToast('Erro ao carregar produtos', 'error');
        }
        Renderer.updateUI();
    }
};

// Autenticação
const Auth = {
    login: async () => {
        const password = elements.storePassword.value;
        if (!AppState.currentStore) return;

        try {
            const currentStoreId = AppState.currentStore._id || AppState.currentStore.id;
            const result = await ApiService.authenticateStore(currentStoreId, password);
            
            if (result.success) {
                AppState.isLoggedIn = true;
                Utils.showToast(`Login realizado com sucesso na ${AppState.currentStore.name}!`, 'success');
                Renderer.updateUI();
                StateManager.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Erro no login:', error);
            Utils.showToast('Senha incorreta!', 'error');
            elements.storePassword.value = '';
        }
    },

    logout: () => {
        AppState.isLoggedIn = false;
        Utils.showToast('Logout realizado com sucesso!', 'success');
        Renderer.updateUI();
        StateManager.saveToLocalStorage();
    }
};

// Formulário de Produto
const ProductForm = {
    clearForm: () => {
        elements.productForm.reset();
        elements.imagePreview.innerHTML = '<div class="image-preview empty">Nenhuma imagem selecionada</div>';
    },

    handleImageUpload: (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                elements.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            elements.imagePreview.innerHTML = '<div class="image-preview empty">Nenhuma imagem selecionada</div>';
        }
    },

    validateForm: () => {
        const requiredFields = [
            elements.productName,
            elements.productDefect,
            elements.productRCT,
            elements.originalPrice,
            elements.finalPrice
        ];

        for (let field of requiredFields) {
            if (!field.value.trim()) {
                Utils.showToast(`O campo "${field.previousElementSibling.textContent}" é obrigatório.`, 'error');
                field.focus();
                return false;
            }
        }

        // Validar se há imagem (para novos produtos)
        if (!AppState.editingProduct && !elements.productImage.files[0]) {
            Utils.showToast('A foto do produto é obrigatória.', 'error');
            elements.productImage.focus();
            return false;
        }

        // Validar preços
        const originalPrice = parseFloat(elements.originalPrice.value);
        const promotionalPrice = elements.promotionalPrice.value ? 
            parseFloat(elements.promotionalPrice.value) : null;
        const finalPrice = parseFloat(elements.finalPrice.value);

        if (finalPrice <= 0) {
            Utils.showToast('O preço de venda deve ser maior que zero.', 'error');
            elements.finalPrice.focus();
            return false;
        }

        if (promotionalPrice && promotionalPrice >= originalPrice) {
            Utils.showToast('O preço promocional deve ser menor que o preço original.', 'error');
            elements.promotionalPrice.focus();
            return false;
        }

        return true;
    },

    submitForm: async (event) => {
        event.preventDefault();
        
        if (!ProductForm.validateForm()) return;

        const currentStoreId = AppState.currentStore._id || AppState.currentStore.id;
        const productData = {
            name: elements.productName.value.trim(),
            defect: elements.productDefect.value.trim(),
            rct: elements.productRCT.value.trim(),
            originalPrice: parseFloat(elements.originalPrice.value),
            promotionalPrice: elements.promotionalPrice.value ? 
                parseFloat(elements.promotionalPrice.value) : null,
            finalPrice: parseFloat(elements.finalPrice.value),
            storeId: currentStoreId
        };

        // Adicionar imagem se fornecida
        const imageFile = elements.productImage.files[0];
        if (imageFile) {
            productData.image = imageFile;
        }

        try {
            if (AppState.editingProduct) {
                // Editar produto existente
                const productId = AppState.editingProduct._id || AppState.editingProduct.id;
                await StateManager.updateProduct(productId, productData);
                Utils.showToast('Produto atualizado com sucesso!', 'success');
            } else {
                // Adicionar novo produto
                await StateManager.addProduct(productData);
                Utils.showToast('Produto adicionado com sucesso!', 'success');
            }

            // Voltar para a visualização da loja
            Navigation.selectStore(currentStoreId);
        } catch (error) {
            Utils.showToast('Erro ao salvar produto. Tente novamente.', 'error');
            console.error('Erro ao salvar produto:', error);
        }
    },

    cancelForm: () => {
        if (AppState.currentStore) {
            const currentStoreId = AppState.currentStore._id || AppState.currentStore.id;
            Navigation.selectStore(currentStoreId);
        } else {
            Navigation.showAllProducts();
        }
    }
};

// Ações de Produto
const ProductActions = {
    buyProduct: (productId) => {
        const product = AppState.products.find(p => {
            const pId = p._id || p.id;
            return pId.toString() === productId.toString();
        });
        if (product) {
            Utils.showToast(`Redirecionando para compra do produto: ${product.name}`, 'success');
            // Aqui seria implementada a integração com sistema de pagamento
        }
    },

    editProduct: (productId) => {
        const product = AppState.products.find(p => {
            const pId = p._id || p.id;
            return pId.toString() === productId.toString();
        });
        if (!product) return;

        AppState.editingProduct = product;
        AppState.currentView = 'add-product';
        
        // Preencher formulário
        elements.formTitle.textContent = 'Editar Produto';
        elements.saveProductBtn.textContent = 'Atualizar Produto';
        elements.productName.value = product.name;
        elements.productDefect.value = product.defect;
        elements.productRCT.value = product.rct;
        elements.originalPrice.value = product.originalPrice;
        elements.promotionalPrice.value = product.promotionalPrice || '';
        elements.finalPrice.value = product.finalPrice;
        
        // Mostrar imagem atual
        if (product.image) {
            elements.imagePreview.innerHTML = `<img src="${product.image}" alt="Preview atual">`;
        }
        
        Renderer.updateUI();
    },

    deleteProduct: (productId) => {
        const product = AppState.products.find(p => {
            const pId = p._id || p.id;
            return pId.toString() === productId.toString();
        });
        if (!product) return;

        Modal.show(
            `Tem certeza que deseja excluir o produto "${product.name}"?`,
            async () => {
                try {
                    await StateManager.deleteProduct(productId);
                    Utils.showToast('Produto excluído com sucesso!', 'success');
                    
                    // Atualizar visualização
                    if (AppState.currentView === 'manage-products') {
                        Navigation.showManageProducts();
                    } else {
                        const currentStoreId = AppState.currentStore._id || AppState.currentStore.id;
                        Navigation.selectStore(currentStoreId);
                    }
                } catch (error) {
                    Utils.showToast('Erro ao excluir produto.', 'error');
                }
            }
        );
    }
};

// Modal
const Modal = {
    show: (message, onConfirm) => {
        elements.confirmMessage.textContent = message;
        elements.confirmModal.classList.remove('hidden');
        
        const handleConfirm = () => {
            Modal.hide();
            onConfirm();
            elements.confirmOkBtn.removeEventListener('click', handleConfirm);
        };
        
        elements.confirmOkBtn.addEventListener('click', handleConfirm);
    },

    hide: () => {
        elements.confirmModal.classList.add('hidden');
    }
};

// Event Listeners
const EventListeners = {
    init: () => {
        // Sidebar toggle (mobile)
        elements.sidebarToggle.addEventListener('click', () => {
            elements.sidebar.classList.toggle('active');
            elements.sidebarOverlay.classList.toggle('active');
        });

        elements.sidebarOverlay.addEventListener('click', () => {
            elements.sidebar.classList.remove('active');
            elements.sidebarOverlay.classList.remove('active');
        });

        // Navegação
        elements.todosProductsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Navigation.showAllProducts();
        });

        // Seleção de loja
        elements.storeSelect.addEventListener('change', (e) => {
            const storeId = e.target.value;
            if (storeId) {
                Navigation.selectStore(storeId);
            } else {
                Navigation.showAllProducts();
            }
        });

        elements.addProductBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Navigation.showAddProduct();
        });

        elements.manageProductsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Navigation.showManageProducts();
        });

        // Autenticação
        elements.loginBtn.addEventListener('click', Auth.login);
        elements.logoutBtn.addEventListener('click', Auth.logout);
        elements.storePassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') Auth.login();
        });

        // Filtros e busca
        elements.storeFilter.addEventListener('change', () => {
            if (AppState.currentView === 'all-products') {
                Renderer.renderProducts();
            }
        });

        elements.sortFilter.addEventListener('change', () => {
            if (AppState.currentView === 'all-products') {
                Renderer.renderProducts();
            } else if (AppState.currentView === 'store-products' && AppState.currentStore) {
                const currentStoreId = AppState.currentStore._id || AppState.currentStore.id;
                ApiService.getProductsByStore(currentStoreId).then(storeProducts => {
                    Renderer.renderProducts(storeProducts);
                }).catch(error => {
                    console.error('Erro ao recarregar produtos:', error);
                });
            }
        });

        elements.searchInput.addEventListener('input', Utils.debounce(() => {
            if (AppState.currentView === 'all-products') {
                Renderer.renderProducts();
            } else if (AppState.currentView === 'store-products' && AppState.currentStore) {
                const currentStoreId = AppState.currentStore._id || AppState.currentStore.id;
                ApiService.getProductsByStore(currentStoreId).then(storeProducts => {
                    Renderer.renderProducts(storeProducts);
                }).catch(error => {
                    console.error('Erro ao recarregar produtos:', error);
                });
            }
        }, 300));

        // Formulário
        elements.productImage.addEventListener('change', ProductForm.handleImageUpload);
        elements.productForm.addEventListener('submit', ProductForm.submitForm);
        elements.cancelFormBtn.addEventListener('click', ProductForm.cancelForm);

        // Modal
        elements.confirmCancelBtn.addEventListener('click', Modal.hide);
        elements.confirmModal.addEventListener('click', (e) => {
            if (e.target === elements.confirmModal) Modal.hide();
        });

        // Fechar sidebar ao clicar em links (mobile)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    elements.sidebar.classList.remove('active');
                    elements.sidebarOverlay.classList.remove('active');
                }
            });
        });
    }
};

// Inicialização
const App = {
    init: async () => {
        // Carregar estado salvo
        StateManager.loadFromLocalStorage();
        
        // Carregar dados do servidor
        await StateManager.loadStores();
        
        // Inicializar event listeners
        EventListeners.init();
        
        // Renderização inicial
        await Navigation.showAllProducts();
        
        // Adicionar estilos de animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        console.log('Aplicação inicializada com sucesso!');
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', App.init);

