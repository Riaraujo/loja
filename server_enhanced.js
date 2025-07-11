const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS mais permissiva
const corsOptions = {
    origin: [
        'https://riaraujo.github.io',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos'), false);
        }
    }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Configuração do MongoDB
const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || 'mongodb://localhost:27017';
const DB_NAME = 'rede_lojas_db';

let db;
let client;

// Conectar ao MongoDB
async function connectToMongoDB() {
    try {
        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('Conectado ao MongoDB com sucesso!');
        
        // Inicializar dados se necessário
        await initializeData();
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        // Se não conseguir conectar ao MongoDB, usar dados em memória
        console.log('Usando dados em memória como fallback');
        initializeInMemoryData();
    }
}

// Dados em memória como fallback
let inMemoryData = {
    stores: [],
    products: [],
    usingMemory: false
};

// Inicializar dados padrão no MongoDB
async function initializeData() {
    try {
        // Verificar e criar coleção de lojas
        const storesCollection = db.collection('stores');
        const storesCount = await storesCollection.countDocuments();
        
        if (storesCount === 0) {
            const storesPadrao = [
                { 
                    _id: new ObjectId(),
                    name: 'TechStore', 
                    password: '123456',
                    createdAt: new Date()
                },
                { 
                    _id: new ObjectId(),
                    name: 'EletroMax', 
                    password: 'eletro123',
                    createdAt: new Date()
                },
                { 
                    _id: new ObjectId(),
                    name: 'InfoCenter', 
                    password: 'info456',
                    createdAt: new Date()
                },
                { 
                    _id: new ObjectId(),
                    name: 'DigitalWorld', 
                    password: 'digital789',
                    createdAt: new Date()
                }
            ];
            
            await storesCollection.insertMany(storesPadrao);
            console.log('Lojas padrão inseridas no banco de dados');
        }

        // Verificar e criar coleção de produtos com defeito
        const productsCollection = db.collection('defective_products');
        const productsCount = await productsCollection.countDocuments();
        
        if (productsCount === 0) {
            const stores = await storesCollection.find({}).toArray();
            const produtosPadrao = [
                {
                    _id: new ObjectId(),
                    name: 'Smartphone Samsung Galaxy',
                    defect: 'Tela com pequeno risco na parte superior',
                    rct: 'SMG-001-2024',
                    originalPrice: 1200.00,
                    promotionalPrice: 900.00,
                    finalPrice: 750.00,
                    storeId: stores[0]._id,
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U21hcnRwaG9uZSBTYW1zdW5nPC90ZXh0Pjwvc3ZnPg==',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: new ObjectId(),
                    name: 'Notebook Dell Inspiron',
                    defect: 'Bateria com autonomia reduzida (2-3 horas)',
                    rct: 'NTB-002-2024',
                    originalPrice: 2500.00,
                    promotionalPrice: null,
                    finalPrice: 1800.00,
                    storeId: stores[1]._id,
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm90ZWJvb2sgRGVsbDwvdGV4dD48L3N2Zz4=',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: new ObjectId(),
                    name: 'Smart TV LG 55"',
                    defect: 'Controle remoto não funciona (TV funciona normalmente)',
                    rct: 'TV-003-2024',
                    originalPrice: 3200.00,
                    promotionalPrice: 2800.00,
                    finalPrice: 2400.00,
                    storeId: stores[2]._id,
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U21hcnQgVFYgTEc8L3RleHQ+PC9zdmc+',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: new ObjectId(),
                    name: 'Fone Bluetooth JBL',
                    defect: 'Caixa original danificada, produto novo',
                    rct: 'FN-004-2024',
                    originalPrice: 350.00,
                    promotionalPrice: 280.00,
                    finalPrice: 220.00,
                    storeId: stores[0]._id,
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Rm9uZSBCbHVldG9vdGg8L3RleHQ+PC9zdmc+',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            
            await productsCollection.insertMany(produtosPadrao);
            console.log('Produtos padrão inseridos no banco de dados');
        }

        // Manter dados originais do estoque
        const tabelaTotalCollection = db.collection('tabelaTotalDeProdutos');
        const count = await tabelaTotalCollection.countDocuments();
        
        if (count === 0) {
            const produtosPadrao = [
                {
                    codigo: "4066756633288",
                    rct: "002760MWTPPT44",
                    precoPromocao: 100.00,
                    precoTabela: 349.99,
                    saldo: 5,
                    localizacao: ""
                },
                {
                    codigo: "0196464441616",
                    rct: "100000103FSHBC34",
                    precoPromocao: 399.99,
                    precoTabela: 499.99,
                    saldo: null,
                    localizacao: ""
                },
                {
                    codigo: "0054871712197",
                    rct: "002240WFSHPT34",
                    precoPromocao: 0.00,
                    precoTabela: 499.99,
                    saldo: null,
                    localizacao: ""
                },
                {
                    codigo: "0054871712203",
                    rct: "002240WFSHPT35",
                    precoPromocao: 0.00,
                    precoTabela: 499.99,
                    saldo: null,
                    localizacao: ""
                },
                {
                    codigo: "0054871712227",
                    rct: "002240WFSHPT36",
                    precoPromocao: 0.00,
                    precoTabela: 499.99,
                    saldo: null,
                    localizacao: ""
                },
                {
                    codigo: "0054871712234",
                    rct: "meu ovo",
                    precoPromocao: 6.00,
                    precoTabela: 49.99,
                    saldo: 8888,
                    localizacao: ""
                },
                {
                    codigo: "0054871712241",
                    rct: "002240WFSHPT38",
                    precoPromocao: 0.00,
                    precoTabela: 499.99,
                    saldo: null,
                    localizacao: ""
                },
                {
                    codigo: "0054871712258",
                    rct: "002240WFSHPT39",
                    precoPromocao: 0.00,
                    precoTabela: 499.99,
                    saldo: null,
                    localizacao: ""
                }
            ];
            
            await tabelaTotalCollection.insertMany(produtosPadrao);
            console.log('Dados iniciais inseridos na tabelaTotalDeProdutos');
        }
    } catch (error) {
        console.error('Erro ao inicializar dados:', error);
    }
}

// Inicializar dados em memória como fallback
function initializeInMemoryData() {
    inMemoryData.usingMemory = true;
    
    inMemoryData.stores = [
        { id: 1, name: 'TechStore', password: '123456' },
        { id: 2, name: 'EletroMax', password: 'eletro123' },
        { id: 3, name: 'InfoCenter', password: 'info456' },
        { id: 4, name: 'DigitalWorld', password: 'digital789' }
    ];

    inMemoryData.products = [
        {
            id: 1,
            name: 'Smartphone Samsung Galaxy',
            defect: 'Tela com pequeno risco na parte superior',
            rct: 'SMG-001-2024',
            originalPrice: 1200.00,
            promotionalPrice: 900.00,
            finalPrice: 750.00,
            storeId: 1,
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U21hcnRwaG9uZSBTYW1zdW5nPC90ZXh0Pjwvc3ZnPg=='
        },
        {
            id: 2,
            name: 'Notebook Dell Inspiron',
            defect: 'Bateria com autonomia reduzida (2-3 horas)',
            rct: 'NTB-002-2024',
            originalPrice: 2500.00,
            promotionalPrice: null,
            finalPrice: 1800.00,
            storeId: 2,
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm90ZWJvb2sgRGVsbDwvdGV4dD48L3N2Zz4='
        },
        {
            id: 3,
            name: 'Smart TV LG 55"',
            defect: 'Controle remoto não funciona (TV funciona normalmente)',
            rct: 'TV-003-2024',
            originalPrice: 3200.00,
            promotionalPrice: 2800.00,
            finalPrice: 2400.00,
            storeId: 3,
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U21hcnQgVFYgTEc8L3RleHQ+PC9zdmc+'
        },
        {
            id: 4,
            name: 'Fone Bluetooth JBL',
            defect: 'Caixa original danificada, produto novo',
            rct: 'FN-004-2024',
            originalPrice: 350.00,
            promotionalPrice: 280.00,
            finalPrice: 220.00,
            storeId: 1,
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Rm9uZSBCbHVldG9vdGg8L3RleHQ+PC9zdmc+'
        }
    ];
}

// Middleware para log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
    next();
});

// ==================== ROTAS DA API PARA LOJAS E PRODUTOS COM DEFEITO ====================

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Servidor funcionando corretamente',
        database: inMemoryData.usingMemory ? 'memory' : 'mongodb'
    });
});

// ==================== ROTAS PARA LOJAS ====================

// Buscar todas as lojas
app.get('/api/stores', async (req, res) => {
    try {
        if (inMemoryData.usingMemory) {
            const stores = inMemoryData.stores.map(store => ({
                id: store.id,
                name: store.name
            }));
            res.json(stores);
        } else {
            const stores = await db.collection('stores').find({}, { projection: { password: 0 } }).toArray();
            res.json(stores);
        }
    } catch (error) {
        console.error('Erro ao buscar lojas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Autenticar loja
app.post('/api/stores/auth', async (req, res) => {
    try {
        const { storeId, password } = req.body;
        
        if (inMemoryData.usingMemory) {
            const store = inMemoryData.stores.find(s => s.id === parseInt(storeId));
            if (store && store.password === password) {
                res.json({ 
                    success: true, 
                    store: { id: store.id, name: store.name }
                });
            } else {
                res.status(401).json({ error: 'Credenciais inválidas' });
            }
        } else {
            const store = await db.collection('stores').findOne({ _id: new ObjectId(storeId) });
            if (store && store.password === password) {
                res.json({ 
                    success: true, 
                    store: { id: store._id, name: store.name }
                });
            } else {
                res.status(401).json({ error: 'Credenciais inválidas' });
            }
        }
    } catch (error) {
        console.error('Erro ao autenticar loja:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== ROTAS PARA PRODUTOS COM DEFEITO ====================

// Buscar todos os produtos com defeito
app.get('/api/defective-products', async (req, res) => {
    try {
        if (inMemoryData.usingMemory) {
            res.json(inMemoryData.products);
        } else {
            const products = await db.collection('defective_products').find({}).toArray();
            res.json(products);
        }
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar produtos por loja
app.get('/api/defective-products/store/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        
        if (inMemoryData.usingMemory) {
            const products = inMemoryData.products.filter(p => p.storeId === parseInt(storeId));
            res.json(products);
        } else {
            const products = await db.collection('defective_products').find({ 
                storeId: new ObjectId(storeId) 
            }).toArray();
            res.json(products);
        }
    } catch (error) {
        console.error('Erro ao buscar produtos por loja:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Adicionar produto com defeito
app.post('/api/defective-products', upload.single('image'), async (req, res) => {
    try {
        const { name, defect, rct, originalPrice, promotionalPrice, finalPrice, storeId } = req.body;
        
        // Validar dados obrigatórios
        if (!name || !defect || !rct || !originalPrice || !finalPrice || !storeId) {
            return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
        }

        let imageData = null;
        if (req.file) {
            imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        const newProduct = {
            name,
            defect,
            rct,
            originalPrice: parseFloat(originalPrice),
            promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : null,
            finalPrice: parseFloat(finalPrice),
            storeId: inMemoryData.usingMemory ? parseInt(storeId) : new ObjectId(storeId),
            image: imageData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (inMemoryData.usingMemory) {
            newProduct.id = Date.now();
            inMemoryData.products.push(newProduct);
            res.json({ success: true, product: newProduct });
        } else {
            const result = await db.collection('defective_products').insertOne(newProduct);
            newProduct._id = result.insertedId;
            res.json({ success: true, product: newProduct });
        }
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar produto com defeito
app.put('/api/defective-products/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, defect, rct, originalPrice, promotionalPrice, finalPrice } = req.body;
        
        const updateData = {
            name,
            defect,
            rct,
            originalPrice: parseFloat(originalPrice),
            promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : null,
            finalPrice: parseFloat(finalPrice),
            updatedAt: new Date()
        };

        if (req.file) {
            updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        if (inMemoryData.usingMemory) {
            const index = inMemoryData.products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                inMemoryData.products[index] = { ...inMemoryData.products[index], ...updateData };
                res.json({ success: true, product: inMemoryData.products[index] });
            } else {
                res.status(404).json({ error: 'Produto não encontrado' });
            }
        } else {
            const result = await db.collection('defective_products').updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            
            if (result.matchedCount === 1) {
                const updatedProduct = await db.collection('defective_products').findOne({ _id: new ObjectId(id) });
                res.json({ success: true, product: updatedProduct });
            } else {
                res.status(404).json({ error: 'Produto não encontrado' });
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar produto com defeito
app.delete('/api/defective-products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (inMemoryData.usingMemory) {
            const index = inMemoryData.products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                inMemoryData.products.splice(index, 1);
                res.json({ success: true, message: 'Produto removido com sucesso' });
            } else {
                res.status(404).json({ error: 'Produto não encontrado' });
            }
        } else {
            const result = await db.collection('defective_products').deleteOne({ _id: new ObjectId(id) });
            
            if (result.deletedCount === 1) {
                res.json({ success: true, message: 'Produto removido com sucesso' });
            } else {
                res.status(404).json({ error: 'Produto não encontrado' });
            }
        }
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== ROTAS ORIGINAIS DO ESTOQUE (MANTIDAS) ====================

// Rota para buscar produto por código na tabela total
app.get('/api/produto/:codigo', async (req, res) => {
    try {
        if (inMemoryData.usingMemory) {
            return res.status(503).json({ error: 'Funcionalidade de estoque requer conexão com MongoDB' });
        }
        
        const { codigo } = req.params;
        const produto = await db.collection('tabelaTotalDeProdutos').findOne({ codigo });
        
        if (produto) {
            res.json(produto);
        } else {
            res.status(404).json({ error: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar produto por RCT na tabela total
app.get('/api/produto/rct/:rct', async (req, res) => {
    try {
        if (inMemoryData.usingMemory) {
            return res.status(503).json({ error: 'Funcionalidade de estoque requer conexão com MongoDB' });
        }
        
        const { rct } = req.params;
        const produto = await db.collection('tabelaTotalDeProdutos').findOne({ rct });
        
        if (produto) {
            res.json(produto);
        } else {
            res.status(404).json({ error: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar produto por RCT:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para adicionar produto à tabelaProdutos
app.post('/api/adicionar-produto', async (req, res) => {
    try {
        if (inMemoryData.usingMemory) {
            return res.status(503).json({ error: 'Funcionalidade de estoque requer conexão com MongoDB' });
        }
        
        const { codigo, localizacao } = req.body;
        
        // Buscar produto na tabela total
        const produtoTotal = await db.collection('tabelaTotalDeProdutos').findOne({ codigo });
        
        if (!produtoTotal) {
            return res.status(404).json({ error: 'Produto não encontrado na tabela total' });
        }
        
        // Criar novo produto para a tabela de produtos
        const novoProduto = {
            ...produtoTotal,
            localizacao,
            dataAdicao: new Date()
        };
        
        // Inserir na tabelaProdutos
        const resultado = await db.collection('tabelaProdutos').insertOne(novoProduto);
        
        res.json({ 
            success: true, 
            id: resultado.insertedId,
            produto: novoProduto 
        });
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar todos os produtos da tabelaProdutos
app.get('/api/produtos', async (req, res) => {
    try {
        if (inMemoryData.usingMemory) {
            return res.status(503).json({ error: 'Funcionalidade de estoque requer conexão com MongoDB' });
        }
        
        const produtos = await db.collection('tabelaProdutos').find({}).toArray();
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar todos os produtos da tabelaTotalDeProdutos
app.get('/api/produtos-total', async (req, res) => {
    try {
        if (inMemoryData.usingMemory) {
            return res.status(503).json({ error: 'Funcionalidade de estoque requer conexão com MongoDB' });
        }
        
        const produtos = await db.collection('tabelaTotalDeProdutos').find({}).toArray();
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos totais:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== ROTAS PARA SERVIR ARQUIVOS ESTÁTICOS ====================

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para servir arquivos estáticos
app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    if (filename.endsWith('.html') || filename.endsWith('.css') || filename.endsWith('.js') || filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
        res.sendFile(path.join(__dirname, filename));
    } else {
        res.status(404).send('Arquivo não encontrado');
    }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
async function startServer() {
    await connectToMongoDB();
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Acesse: http://localhost:${PORT}`);
        console.log(`CORS configurado para GitHub Pages: https://riaraujo.github.io`);
        console.log(`Banco de dados: ${inMemoryData.usingMemory ? 'Memória (fallback)' : 'MongoDB'}`);
    });
}

// Tratamento de encerramento gracioso
process.on('SIGINT', async () => {
    console.log('Encerrando servidor...');
    if (client) {
        await client.close();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Encerrando servidor...');
    if (client) {
        await client.close();
    }
    process.exit(0);
});

startServer().catch(console.error);

