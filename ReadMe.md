# eShop — Distributed E-Commerce Platform

A containerized, service-oriented e-commerce platform. The system supports two user roles — **customers** and **sellers** — each with their own dedicated views and permissions. Customers can browse products, add items to a cart, and place orders; sellers can manage product listings.

The backend exposes two independent services — a **Products service** (port 5000) and an **Orders service** (port 5001) — communicating asynchronously via **Apache Kafka**. Authentication and role-based access control are handled by **Keycloak** (OpenID Connect), with user roles embedded directly in the JWT token. All services run inside **Docker**, and data is persisted in a **PostgreSQL** database.

**Stack:** Node.js, JavaScript, SQL, Docker, Kafka, Keycloak, PostgreSQL

---

# Setup & Run Guide

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

---

## 2. Configure Keycloak

Open the Keycloak admin console at **http://localhost:8080**.

### 2.1 Create a Realm

Create a new realm named `eshop`.

### 2.2 Create a Client

Go to **Clients → Create client** and fill in:

| Field | Value |
|---|---|
| Client type | OpenID Connect |
| Client ID | `frontend-client` |

Click **Next** twice, then set the following URLs (no trailing slashes):

| Setting | Value |
|---|---|
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

### 2.5 Add a Token Mapper

This step makes the `user_role` attribute available in the decoded token so the frontend can read `decodedToken.user_role`.

Go to **Clients → frontend-client → Client scopes → Mappers → Configure a new mapper**, and select **User Attribute**:

| Field | Value |
|---|---|
| Mapper type | User Attribute |
| Name | `user_role` |
| User Attribute | `user_role` |
| Token Claim Name | `user_role` |

### 2.6 Create Users

1. Go to **Users → Create User** and fill in the details.
2. After creating the user, go to the user's **Credentials** tab and click **Set Password**.

### 2.7 Set Username Claim

Go to **Clients → frontend-client → Client scopes → profile → Mappers**, find the `username` mapper, and set the claim name to `preferred_username`.

---

## 3. Access the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:5500 |
| Kafka UI | http://localhost:9021 |

Log in using the users you created in step 2.6.

---

## 4. Stop the Services

```bash
docker compose down
```

> This does **not** delete your data — it is persisted in Docker volumes.

---

## Database Access

To connect to the PostgreSQL database directly via Docker:

```bash
docker exec -it product_db psql -U postgres -d products
```