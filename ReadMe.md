# E-Shop Local Development Setup

This project runs with Docker, uses Keycloak for authentication, Kafka for messaging, and a frontend running locally.

---

## 0) Install Dependencies

Before starting anything, install the frontend dependencies:

```bash
npm install
```

What this does:
- Looks for `package.json`
- Looks for `package-lock.json`
- Installs the required dependencies into `node_modules`

---

## 1) Start the Project

Run everything with Docker:

```bash
docker compose up
```

This starts the backend services and supporting infrastructure.

---

## 2) Configure Keycloak

Open Keycloak Admin here:

```text
http://localhost:8080
```

> The frontend usually expects a specific Keycloak setup, so if something feels unclear, checking the frontend code is a good idea.

---

# Keycloak Configuration

## Step 1 — Create Realm

Create a new realm named:

```text
eshop
```

---

## Step 2 — Create Client

Go to:

```text
Clients → Create client
```

Use these values:

```text
Client type: OpenID Connect
Client ID: frontend-client
```

Then click:

```text
Next
Next
```

### Client Settings

> Important: avoid adding trailing `/` to URL fields where it does not belong.

Use the following values:

```text
Root URL: http://127.0.0.1:5500
Home URL: http://127.0.0.1:5500

Valid redirect URIs:
http://127.0.0.1:5500/*
http://localhost:5500/*

Valid post logout redirect URIs:
http://127.0.0.1:5500

Web origins:
http://localhost:5500
http://127.0.0.1:5500

Admin URL:
(leave empty)

Client authentication:
Off
```

---

## Step 3 — Create Roles

Go to:

```text
Realm roles → Create role
```

Create these two roles:

```text
seller
customer
```

---

## Step 4 — Add Custom User Attribute

Go to:

```text
Realm settings → User profile
```

Create a new attribute called:

```text
user_role
```

This will store the role for each user.

---

## Step 5 — Add `user_role` to the Token

The frontend expects the user role to be available in the token like this:

```js
decodedToken.user_role
```

To make that work, you need to map the custom user attribute into the token.

Go to:

```text
Clients → frontend-client → Client scopes
```

Then:

```text
Mappers → Configure a new mapper
```

Choose:

```text
User Attribute
```

Use the following values:

```text
Mapper type: User Attribute
Name: user_role
User Attribute: user_role
Token Claim Name: user_role
```

### What this does

It tells Keycloak:

```text
Take the user attribute "user_role" from the user profile
and include it in the token as a claim called "user_role".
```

That way the frontend can read it directly from the decoded token.

---

## Step 6 — Create Users

Go to:

```text
Users → Create user
```

Create one or more users.

Then for each user:

```text
User → [select the user] → Credentials → Set Password
```

Make sure the user also has the correct `user_role` value if your frontend depends on it.

Example:

```text
seller
```

or

```text
customer
```

---

## Step 7 — Fix `preferred_username`

Go to:

```text
Clients → frontend-client → Client scopes
```

Then open:

```text
profile
```

Then:

```text
Mappers
```

Find:

```text
username
```

Set:

```text
preferred_username = username
```

This helps ensure the frontend receives the expected username field.

---

## 3) Open the Frontend and Kafka

Once Keycloak is configured, open:

### Frontend

```text
http://localhost:5500
```

### Kafka UI

```text
http://localhost:9021
```

---

## 4) Log In

Use the users you created in Keycloak to log into the frontend.

---

## 5) Stop Everything

To stop the services:

```bash
docker compose down
```

> This does **not** delete your data if it is stored in Docker volumes.

---

# Database Access (PostgreSQL in Docker)

If you want to access the products database directly from Docker:

```bash
docker exec -it product_db psql -U postgres -d products
```

# Troubleshooting

## Login works but role-based frontend behavior does not

Check:

```text
- user_role exists on the user
- user_role is included in the token
- the frontend is reading decodedToken.user_role
```

## Redirect issues

Double-check:

```text
- Root URL
- Home URL
- Valid redirect URIs
- Valid post logout redirect URIs
- Web origins
```

## Data still exists after restart

That is normal if Docker volumes are being used.

---
