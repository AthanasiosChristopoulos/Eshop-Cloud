How to run:

1) docker compose up

2) http://localhost:8080 => Access keycloack
Generally the frontend deals with this, so reviewing the frontend is a good idea to figure out how to configure keycloack
    - create new realm "eshop"
    - create client:
        Clients → Create client
        Client type: OpenID Connect
        Client ID: frontend-client
        Next
        Next
        http://127.0.0.1:5500/*
        http://localhost:5500/*

    - create roles:
        seller
        customer



3) Access the frontend in http://localhost:5500 


3) docker compose down
4) Use docker app to find, frontend port on localhost
