// Estado da aplicação
const AppState = {
    stores: [
        { id: 1, name: 'TechStore', password: '123456' },
        { id: 2, name: 'EletroMax', password: 'eletro123' },
        { id: 3, name: 'InfoCenter', password: 'info456' },
        { id: 4, name: 'DigitalWorld', password: 'digital789' }
    ],
    products: [
        {
            id: 1,
            name: 'BB 4000 II MID X NASA MASCULINO',
            defect: 'QUEIMADO DO SOL',
            rct: 'SMG-001-2024',
            originalPrice: 1500.00,
            promotionalPrice: 900.00,
            finalPrice: 200.00,
            storeId: 1,
            image: 'https://reebokbr.vtexassets.com/arquivos/ids/172567/JPG-100206315_FLT_eCom.jpg?v=638749679613000000'
        },
        {
            id: 1,
            name: 'TÊNIS REEBOK CLASSIC LEATHER HEXALITE X NASA UNISSEX',
            defect: 'RASGADO NAS LATERAIS',
            rct: 'SMG-001-2024',
            originalPrice: 899.00,
            promotionalPrice: 399.00,
            finalPrice: 159.00,
            storeId: 1,
            image: 'https://reebokbr.vtexassets.com/arquivos/ids/171099/100207043_FLT_eCom.tif-crop.jpg?v=638785090714100000'
        },
        {
            id: 1,
            name: 'TÊNIS REEBOK HEXALITE LEGACY 1.5 MASCULINO',
            defect: 'DESCOLANDO O SOLADO',
            rct: 'SMG-001-2024',
            originalPrice: 499.00,
            promotionalPrice: 329.00,
            finalPrice: 149.00,
            storeId: 1,
            image: 'https://reebokbr.vtexassets.com/arquivos/ids/165834/100033852--4-.jpg?v=638331694532430000'
        },
        {
            id: 4,
            name: 'TÊNIS REEBOK HEXALITE LEGACY 1.5 FEMININO',
            defect: 'DESCOLANDO O SOLADO',
            rct: 'FN-004-2024',
            originalPrice: 350.00,
            promotionalPrice: 280.00,
            finalPrice: 99.00,
            storeId: 1,
            image: 'https://reebokbr.vtexassets.com/arquivos/ids/165859/100033853--5-.jpg?v=638331719399200000'
        }
    ],
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

// Gerenciamento de Estado
const StateManager = {
    saveToLocalStorage: () => {
        localStorage.setItem('storeAppState', JSON.stringify({
            products: AppState.products,
            currentStore: AppState.currentStore,
            isLoggedIn: AppState.isLoggedIn
        }));
    },

    loadFromLocalStorage: () => {
        const saved = localStorage.getItem('storeAppState');
        if (saved) {
            const state = JSON.parse(saved);
            AppState.products = state.products || AppState.products;
            AppState.currentStore = state.currentStore;
            AppState.isLoggedIn = state.isLoggedIn || false;
        }
    },

    getStoreById: (id) => {
        return AppState.stores.find(store => store.id === id);
    },

    getProductsByStore: (storeId) => {
        return AppState.products.filter(product => product.storeId === storeId);
    },

    addProduct: (productData) => {
        const newProduct = {
            id: Utils.generateId(),
            ...productData,
            storeId: AppState.currentStore.id
        };
        AppState.products.push(newProduct);
        StateManager.saveToLocalStorage();
        return newProduct;
    },

    updateProduct: (id, productData) => {
        const index = AppState.products.findIndex(p => p.id === id);
        if (index !== -1) {
            AppState.products[index] = { ...AppState.products[index], ...productData };
            StateManager.saveToLocalStorage();
            return AppState.products[index];
        }
        return null;
    },

    deleteProduct: (id) => {
        const index = AppState.products.findIndex(p => p.id === id);
        if (index !== -1) {
            AppState.products.splice(index, 1);
            StateManager.saveToLocalStorage();
            return true;
        }
        return false;
    }
};

// Renderização
const Renderer = {
    renderStoresSelect: () => {
        elements.storeSelect.innerHTML = '<option value="">Selecione uma loja</option>';
        AppState.stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store.id;
            option.textContent = store.name;
            if (AppState.currentStore && AppState.currentStore.id === store.id) {
                option.selected = true;
            }
            elements.storeSelect.appendChild(option);
        });
    },

    renderStoreFilter: () => {
        elements.storeFilter.innerHTML = '<option value="">Todas as lojas</option>';
        AppState.stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store.id;
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
            const store = StateManager.getStoreById(product.storeId);
            const card = Renderer.createProductCard(product, store);
            elements.productsGrid.appendChild(card);
        });
    },

    createProductCard: (product, store) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const canManage = AppState.isLoggedIn && AppState.currentStore && 
                         AppState.currentStore.id === product.storeId;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjZTJlOGYwIi8+PHRleHQgeD0iMTUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+'">
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <a href="#" class="product-store" data-store-id="${store.id}">${store.name}</a>
                <p class="product-defect">${product.defect}</p>
                <div class="product-rct">RCT: ${product.rct}</div>
                <div class="product-prices">
                    <span class="original-price">${Utils.formatPrice(product.originalPrice)}</span>
                    ${product.promotionalPrice ? `<span class="promotional-price">${Utils.formatPrice(product.promotionalPrice)}</span>` : ''}
                    <span class="final-price">${Utils.formatPrice(product.finalPrice)}</span>
                </div>
                <div class="product-actions">
                    <button class="buy-btn" onclick="ProductActions.buyProduct(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Comprar
                    </button>
                    ${canManage ? `
                        <button class="edit-btn" onclick="ProductActions.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="ProductActions.deleteProduct(${product.id})">
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
            Navigation.selectStore(parseInt(e.target.dataset.storeId));
        });

        return card;
    },

    filterAndSortProducts: (products) => {
        let filtered = [...products];
        
        // Filtrar por loja (apenas na visualização "todos os produtos")
        if (AppState.currentView === 'all-products') {
            const selectedStoreId = elements.storeFilter.value;
            if (selectedStoreId) {
                filtered = filtered.filter(product => product.storeId === parseInt(selectedStoreId));
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
                    const storeA = StateManager.getStoreById(a.storeId);
                    const storeB = StateManager.getStoreById(b.storeId);
                    return storeA.name.localeCompare(storeB.name);
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
    showAllProducts: () => {
        AppState.currentView = 'all-products';
        // Não resetar currentStore nem isLoggedIn - manter sessão ativa
        Renderer.updateUI();
        Renderer.renderProducts();
        StateManager.saveToLocalStorage();
    },

    selectStore: (storeId) => {
        const store = StateManager.getStoreById(storeId);
        if (!store) return;

        // Se já está logado na mesma loja, manter login
        if (AppState.currentStore && AppState.currentStore.id === storeId && AppState.isLoggedIn) {
            AppState.currentView = 'store-products';
            const storeProducts = StateManager.getProductsByStore(storeId);
            Renderer.renderProducts(storeProducts);
            Renderer.updateUI();
            return;
        }

        AppState.currentStore = store;
        AppState.currentView = 'store-products';
        // Não resetar isLoggedIn automaticamente
        
        // Limpar senha apenas se mudou de loja
        elements.storePassword.value = '';

        // Renderizar produtos da loja
        const storeProducts = StateManager.getProductsByStore(storeId);
        Renderer.renderProducts(storeProducts);
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

    showManageProducts: () => {
        if (!AppState.isLoggedIn || !AppState.currentStore) {
            Utils.showToast('Você precisa estar logado em uma loja para gerenciar produtos.', 'error');
            return;
        }
        
        AppState.currentView = 'manage-products';
        const storeProducts = StateManager.getProductsByStore(AppState.currentStore.id);
        Renderer.renderProducts(storeProducts);
        Renderer.updateUI();
    }
};

// Autenticação
const Auth = {
    login: () => {
        const password = elements.storePassword.value;
        if (!AppState.currentStore) return;

        if (password === AppState.currentStore.password) {
            AppState.isLoggedIn = true;
            Utils.showToast(`Login realizado com sucesso na ${AppState.currentStore.name}!`, 'success');
            Renderer.updateUI();
            StateManager.saveToLocalStorage();
        } else {
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

    submitForm: (event) => {
        event.preventDefault();
        
        if (!ProductForm.validateForm()) return;

        const productData = {
            name: elements.productName.value.trim(),
            defect: elements.productDefect.value.trim(),
            rct: elements.productRCT.value.trim(),
            originalPrice: parseFloat(elements.originalPrice.value),
            promotionalPrice: elements.promotionalPrice.value ? 
                parseFloat(elements.promotionalPrice.value) : null,
            finalPrice: parseFloat(elements.finalPrice.value)
        };

        // Lidar com imagem
        const imageFile = elements.productImage.files[0];
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                productData.image = e.target.result;
                ProductForm.saveProduct(productData);
            };
            reader.readAsDataURL(imageFile);
        } else if (AppState.editingProduct) {
            // Manter imagem existente se editando
            productData.image = AppState.editingProduct.image;
            ProductForm.saveProduct(productData);
        }
    },

    saveProduct: (productData) => {
        try {
            if (AppState.editingProduct) {
                // Editar produto existente
                StateManager.updateProduct(AppState.editingProduct.id, productData);
                Utils.showToast('Produto atualizado com sucesso!', 'success');
            } else {
                // Adicionar novo produto
                StateManager.addProduct(productData);
                Utils.showToast('Produto adicionado com sucesso!', 'success');
            }

            // Voltar para a visualização da loja
            Navigation.selectStore(AppState.currentStore.id);
        } catch (error) {
            Utils.showToast('Erro ao salvar produto. Tente novamente.', 'error');
            console.error('Erro ao salvar produto:', error);
        }
    },

    cancelForm: () => {
        if (AppState.currentStore) {
            Navigation.selectStore(AppState.currentStore.id);
        } else {
            Navigation.showAllProducts();
        }
    }
};

// Ações de Produto
const ProductActions = {
    buyProduct: (productId) => {
        const product = AppState.products.find(p => p.id === productId);
        if (product) {
            Utils.showToast(`Redirecionando para compra do produto: ${product.name}`, 'success');
            // Aqui seria implementada a integração com sistema de pagamento
        }
    },

    editProduct: (productId) => {
        const product = AppState.products.find(p => p.id === productId);
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
        elements.imagePreview.innerHTML = `<img src="${product.image}" alt="Preview atual">`;
        
        Renderer.updateUI();
    },

    deleteProduct: (productId) => {
        const product = AppState.products.find(p => p.id === productId);
        if (!product) return;

        Modal.show(
            `Tem certeza que deseja excluir o produto "${product.name}"?`,
            () => {
                if (StateManager.deleteProduct(productId)) {
                    Utils.showToast('Produto excluído com sucesso!', 'success');
                    // Atualizar visualização
                    if (AppState.currentView === 'manage-products') {
                        Navigation.showManageProducts();
                    } else {
                        Navigation.selectStore(AppState.currentStore.id);
                    }
                } else {
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
            const storeId = parseInt(e.target.value);
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
                const storeProducts = StateManager.getProductsByStore(AppState.currentStore.id);
                Renderer.renderProducts(storeProducts);
            }
        });

        elements.searchInput.addEventListener('input', Utils.debounce(() => {
            if (AppState.currentView === 'all-products') {
                Renderer.renderProducts();
            } else if (AppState.currentView === 'store-products' && AppState.currentStore) {
                const storeProducts = StateManager.getProductsByStore(AppState.currentStore.id);
                Renderer.renderProducts(storeProducts);
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
    init: () => {
        // Carregar estado salvo
        StateManager.loadFromLocalStorage();
        
        // Inicializar event listeners
        EventListeners.init();
        
        // Renderização inicial
        Navigation.showAllProducts();
        
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

