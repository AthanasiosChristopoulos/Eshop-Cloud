Locally: 
node ./server.js   

Local Kafka:
.\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
.\bin\windows\kafka-server-start.bat .\config\server.properties
.\kafka-topics.bat --create --bootstrap-server localhost:9092 --topic ordersTopic
.\kafka-topics.bat --delete --bootstrap-server localhost:9092 --topic ordersTopic

=========================================================================================

Docker:
docker compose up
docker compose down
	docker compose down removes networks created by Docker Compose.
	Deleting containers via Docker UI does not remove networks.

docker system prune --volumes 
	Removes unused images, stopped containers, dangling build cache, and networks and dangling volumes


docker compose down --rmi all --volumes --remove-orphans
	Completely removes all data, containers, networks, images, and orphaned containers for the project.


docker compose up --build --force-recreate
	Without --build, docker-compose up will only use an existing image if available. 
	It won’t rebuild the image unless explicitly told to do so or if the image does not exist.
	Without --force-recreate, docker-compose up will attempt to reuse existing containers if their configuration and image have not changed.
	

Test:

http://127.0.0.1
http://127.0.0.1:5500
http://127.0.0.1:5500/*

http://127.0.0.1:5500/edit.html
http://127.0.0.1:5500/customer.html
http://127.0.0.1:5500/purchase.html
http://127.0.0.1:5500/orders.html

=================================================================================================================

API Keycloack:

Login:
http://localhost:8080/realms/eshop/protocol/openid-connect/auth/?response_type=code&client_id=frontend-client&redirect_uri=http://127.0.0.1:5500
Exchange Authorization Token:
http://localhost:8080/realms/eshop/protocol/openid-connect/token?grant_type=authorization_code&code=
10532418-083d-4f18-b40a-5a0c34dafcf6.73941256-0e98-4f64-9d3f-e4f8744329c1.b009c08f-23df-4312-9880-6787773aad59&client_id=frontend-client&redirect_uri=http://127.0.0.1:5500
Logout: 
http://localhost:8080/realms/eshop/protocol/openid-connect/logout

=================================================================================================================

CLI Postgres:

psql
\c products

DROP TABLE products;
SELECT * FROM orders;
SELECT * FROM orders WHERE username = 'c' AND status = 'Accepted';

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  img VARCHAR(255),
  price DECIMAL(10, 2),
  quantity INT,
  username VARCHAR(255) 
);

INSERT INTO products (title, img, price, quantity, username) 
VALUES 
  ('keyboard', 'https://media.wired.com/photos/667df9e694f18abc72ad4adb/3:2/w_1600%2Cc_limit/Logitech%2520MX%2520Mechanical%2520Mini%2520for%2520Mac%2520Abstract%2520Background%2520SOURCE%2520Amazon.jpg', 40, 23, 'a'),
  ('earbuds', 'https://assets.rha-audio.com/j0lci/c/TrueControl-thumb.jpg', 60, 5, 'b'),
  ('gamepad', 'https://bbpcdn.pstatic.gr/bpimg52/9FvF2/1SYzV1_SX1200Y630/1728492731/microsoft-xbox-series-wireless-controller-pc-xbox-x-xbox-one-velocity-green-white.jpg', 45, 31, 'a'),
  ('smart watch', 'images/img-5.jpeg', 50, 100, 'b'),
  ('laptop', 'images/img-6.jpg', 1000, 15, 'a'),
  ('USB-Hub', 'images/img-7.jpg', 10, 10, 'b');

DELETE FROM orders; 

=================================================================================================================

On the cloud:

1. docker exec -it mysql-kc bin/bash
2. mysql -u root -p
3. password is: admin
4. `USE keycloak;`
5. update realm: `update REALM set SSL_REQUIRED = 'NONE' where NAME = 'master'`
6. verify: `SELECT NAME, SSL_REQUIRED FROM REALM WHERE NAME = 'master';`
7. exit from bash and restart keycloak `docker compose restart keycloak-w

sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker


