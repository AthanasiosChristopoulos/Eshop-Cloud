How to run:

1) docker compose up

2) http://localhost:8080 => Access keycloack
Generally the frontend deals with this, so reviewing the frontend is a good idea to figure out how to configure keycloack
    - 1) create new realm "eshop"
    - 2) create client:
        Clients → Create client
        Client type: OpenID Connect
        Client ID: frontend-client
        Next
        Next
        http://127.0.0.1:5500/*
        http://localhost:5500/*
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

3) Access the frontend in http://localhost:5500 


3) docker compose down
4) Use docker app to find, frontend port on localhost
