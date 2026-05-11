
## =====================================================================================
# eShop — Distributed E-Commerce Platform

A containerized, service-oriented e-commerce platform. The system supports two user roles — **customers** and **sellers** — each with their own dedicated views and permissions. Customers can browse products, add items to a cart, and place orders; sellers can manage product listings.
    - sellers: can visit edit.html (home)
    - customers: can visit customer.html (home), orders.html, purchase.html

The backend exposes two independent services — a **Products service** (port 5000) and an **Orders service** (port 5001) — communicating asynchronously via **Apache Kafka**. Authentication and role-based access control are handled by **Keycloak** (OpenID Connect), with user roles embedded directly in the JWT token. All services run inside **Docker**, and data is persisted in a **PostgreSQL** database.

**Stack:** Node.js, JavaScript, SQL, Docker, Kafka, Keycloak, PostgreSQL

---

# Setup & Run Guide =====================================================

## Prerequisites

Install dependencies before starting:

```bash
npm install
```

> npm will look for `package.json` and `package-lock.json` in the current folder.

---

## 1. Start the Services

```bash
docker compose up
```

## =====================================================================================
## 2. Configure Keycloak 

Open the Keycloak admin console at **http://localhost:8080**. To login as admin and configure stuff, use:
    - username: admin and password: admin

### 2.1 Create a Realm

Create a new realm named `eshop`.

### 2.2 Create a Client

Go to **Clients → Create client** and fill in:

| Field | Value |
| Client type | OpenID Connect |
| Client ID | `frontend-client` |

Click **Next** twice, then set the following URLs (no trailing slashes):

| Setting | Value |
| Root URL | `http://127.0.0.1:5500` |
| Home URL | `http://127.0.0.1:5500` |
| Valid redirect URIs | `http://127.0.0.1:5500/*` and `http://localhost:5500/*` |
| Valid post logout redirect URIs | `http://127.0.0.1:5500` |
| Web origins | `http://localhost:5500` and `http://127.0.0.1:5500` |
| Admin URL | *(leave empty)* |
| Client authentication | Off |

### 2.3 Create Roles

Go to **Realm roles → Create Role** and create the following two roles:

- `seller`
- `customer`

### 2.4 Create a User Attribute

Go to **Realm settings → User profile → Create Attribute** and create an attribute named `user_role`.
 - Add a options Validation, either customer or seller
 - Remove username's validator

### 2.5 Add a Token Mapper

This step makes the `user_role` attribute available in the decoded token so the frontend can read `decodedToken.user_role`.

Go to **Clients → frontend-client → Client scopes → frontend-client-dedicated → Configure a new mapper**, and select **User Attribute**:

| Field | Value |
| Mapper type | User Attribute |
| Name | `user_role` |
| User Attribute | `user_role` |
| Token Claim Name | `user_role` |

### 2.6 Create Users

1. Go to **Users → Create User** and fill in the details.
2. **Set Password**: After creating the user, go to the user's **Credentials** tab and click **Set Password**.

### 2.7 Set Username Claim

Go to **Client scopes → profile → Mappers → username**, find the `username` mapper, and set the claim name from `preferred_username` to `username`.
    - You need to restart the app for this to take effect

## Keycloack theory: 

What is a Mapper:
 - Take this value from Keycloak → put it into the login token under this name.
 - A token is the signed JSON object Keycloak gives your frontend after login. Your frontend decodes it and reads fields from it.

## Login Process explained:

1. When the page loads, it checks the URL for a code.
2. If there is no code, it sends the user to Keycloak login.
3. The user logs in through Keycloak.
4. Keycloak sends the user back to the frontend with a code. (keycloack internals)
    - to see this, go to devtools, Network tab and find 302 responses
    - then go to Headers => Headers Response => then Location
5. The JS code sends that code to Keycloak and asks for a token. (exchangeCodeForToken)
6. Keycloak returns an access token. (POST request inside exchangeCodeForToken)
7. Your code decodes the token and saves the user info in localStorage.
    If the user is a seller, they go to edit.html.
    If the user is a customer, they go to customer.html.
8. When the user clicks logout, the saved token is removed and the user is redirected to Keycloak logout.

## =====================================================================================
## 3. Access the Application

| Service | URL |
| Frontend | http://localhost:5500 |
| Kafka UI | http://localhost:9021 |

Log in using the users you created in step 2.6.

---

## 4. Stop the Services

```bash
docker compose down
```

> This does **not** delete your data — it is persisted in Docker volumes.

## =====================================================================================
## Database Access:

To connect to the PostgreSQL database directly via Docker:

```bash
docker exec -it product_db psql -U postgres -d products
```

## =====================================================================================
## Error Logging:

Use Devtools for the frontend
Use:
```bash
docker logs -f order_service    # to debug the backend services running in docker
    # Again use console.log( ... ) for printing 
```

## Kafka =======================================================

There are 2 topics: productsProducer and ordersProducer.