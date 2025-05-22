const express = require("express");
const cors = require("cors");
require('dotenv').config();

const config = require("./config");


const productService = require("./src/product_service/product_service");
const orderService = require("./src/order_service/order_service"); 

const appProducts = express();
const appOrders = express();

appProducts.use(cors());
appProducts.use(express.json());
appOrders.use(cors());
appOrders.use(express.json());

const productPort = config.PORT_products;
const orderPort = config.PORT_orders;
appProducts.get('/products/allUsers', productService.getAllProducts);

appProducts.get('/products/allUsers/:param', async (req, res) => {
    
    const param = req.params.param;

    const id = parseInt(param);
    
    if (!isNaN(id) && Number.isInteger(id)) {
        return productService.getAllProductsById(req, res);
    } else {
        return productService.getAllProductsByTitle(req, res);
    }
});

appProducts.put('/products/allUsers/:id', productService.updateAllProduct);

appProducts.get('/products/:username', productService.getProducts);

appProducts.get('/products/:username/:param', async (req, res) => {
    
    const param = req.params.param;

    const id = parseInt(param);
    
    if (!isNaN(id) && Number.isInteger(id)) {
        return productService.getProductsById(req, res);
    } else {
        return productService.getProductsByTitle(req, res);
    }
});

appProducts.post('/products/:username', productService.addProduct);
appProducts.delete('/products/:username/:id', productService.deleteProduct);
appProducts.put('/products/:username/:id', productService.updateProduct);

appOrders.get('/orders/:username', orderService.getOrders);
appOrders.get('/orders/:username/:id', orderService.getOrderById);
appOrders.post('/orders/:username', orderService.addOrder);
appOrders.delete('/orders/:username/:id', orderService.deleteOrder);

appProducts.listen(productPort, () => console.log(`Products app listening on port ${productPort}`));
appOrders.listen(orderPort, () => console.log(`Orders app listening on port ${orderPort}`));



