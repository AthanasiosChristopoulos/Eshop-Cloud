-- init_orders.sql

-- CREATE DATABASE orders
-- \c orders

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,              
    products JSONB,                       
    total_price DECIMAL(10, 2),           
    status VARCHAR(50) DEFAULT 'Pending'   
);

INSERT INTO orders (products, total_price, status)
VALUES (
    '[{"product_id": 1, "title": "keyboard", "amount": 2, "price": 23}, {"product_id": 3, "title": "gamepad", "amount": 1, "price": 45}]'::jsonb,
    91,
    'Pending'
);
