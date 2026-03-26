How to run:

0) npm install # npm looks in the current folder for: package.json and package-lock.json, and then installs the dependencies

1) docker compose up

2) http://localhost:8080 => Access keycloack as the administrator

Generally the frontend deals with this, so reviewing the frontend is a good idea to figure out how to configure keycloack
    - 1) create new realm "eshop"
    - 2) create client:
        Clients → Create client
        Client type: OpenID Connect
        Client ID: frontend-client
        Next
        Next
        Set ... no "/" values in the end they are dangerous:
        | Setting | Value |
        |---|---|
        | **Root URL** | `http://127.0.0.1:5500` |
        | **Home URL** | `http://127.0.0.1:5500` |
        | **Valid redirect URIs** | `http://127.0.0.1:5500/*`<br>`http://localhost:5500/*` |
        | **Valid post logout redirect URIs** | `http://127.0.0.1:5500` |
        | **Web origins** | `http://localhost:5500`<br>`http://127.0.0.1:5500` |
        | **Admin URL** | *(empty)* |
        Client authentication = Off

    - 3) create roles: Realm roles -> Create Role 
        seller
        customer

    - 4) Realm settings → User profile:
        - Create Attribute => user_role
        - user_role

    - 5) Clients → frontend-client → Client scopes (or just go directly to client scopes):
    “Take the user attribute user_role from the user profile, and include it in the token as a claim also called user_role.”
    That is why your frontend can later do:
        decodedToken.user_role
    The frontend needs this attribute to have actuall auth functionality and be included in the tokens

        - Select your frontend
        - Mappers
        - Configure a new mapper
        - User Attribute
            Mapper type: User Attribute (already)
            Name: user_role
            User Attribute: user_role
            Token Claim Name: user_role

    - 6) Users -> Create Users
        - make a new user
        - go into User -> user you just selected -> Credentials -> Set Password

    - 7) Clients → frontend-client → Client scopes 
        - profile
        - Mappers
        - find the username 
        - set preffered_username to username

3) Access the frontend in http://localhost:5500 , check kafka in http://localhost:9021/

4) Login for the users you defined

5) docker compose down (this doesnt delete the data, since it is in volumes)

## ====================================================================================
## Database running in docker interaction

```bash
# Access database through docker
docker exec -it product_db psql -U postgres -d products

```