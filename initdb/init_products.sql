-- init.sql

-- CREATE DATABASE products
-- \c products

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    img VARCHAR(255),
    price DECIMAL(10, 2),
    quantity INT
);

INSERT INTO products (title, img, price, quantity) 
VALUES ('keyboard', 'https://media.wired.com/photos/667df9e694f18abc72ad4adb/3:2/w_1600%2Cc_limit/Logitech%2520MX%2520Mechanical%2520Mini%2520for%2520Mac%2520Abstract%2520Background%2520SOURCE%2520Amazon.jpg', 40, 23),
       ('earbuds', 'https://assets.rha-audio.com/j0lci/c/TrueControl-thumb.jpg', 60, 5),
       ('gamepad', 'https://bbpcdn.pstatic.gr/bpimg52/9FvF2/1SYzV1_SX1200Y630/1728492731/microsoft-xbox-series-wireless-controller-pc-xbox-x-xbox-one-velocity-green-white.jpg', 45, 31);


