
// config.js
const PORT_products = process.env.PORT_products || 5000;
const PORT_orders = process.env.PORT_orders || 5001;

module.exports = {
    // Ports
    PORT_products,
    PORT_orders,

    // PRODUCTS_URL: `http://localhost:${PORT_products}/products`,
    // ORDERS_URL: `http://localhost:${PORT_orders}/orders`
};



// config.js
// const config = {
//     PORT_products: 5000,
//     PORT_orders:5001,
// };

// export default config;


// config.js
// module.exports = {
//     PORT_products: process.env.PORT_products || 5000,
//     PORT_orders: process.env.PORT_orders || 5001
// };

