
const KEYCLOAK_BASE_URL = "http://127.0.0.1:8080/realms/eshop/protocol/openid-connect"; // this is something you change to work like this through configurations
const CLIENT_ID = "frontend-client";
const REDIRECT_URI = "http://127.0.0.1:5500";

// =============================
// Login Redirect
// =============================

function redirect_to_login() {
    const params = new URLSearchParams({
        response_type: "code",  // we need this in URL, so we can get the access code from keycloack
        // this tells keycloack, “When you send the browser back, include an authorization code.”
        client_id: CLIENT_ID,   
        redirect_uri: REDIRECT_URI
    });

    window.location.href = `${KEYCLOAK_BASE_URL}/auth?${params.toString()}`;    
        // this is the login page where the user has to enter the username and password
        // Keycloak sends the user back to the frontend with a code (again window.onload will run but this time the user will have the ?code=... parameter).
        // this is the request that will lead to the ?code=... redirect (this is just a GET request)
}

// =======================================================================================
// Page Load (this trigger when this .js file is executed from the index.html)
// =======================================================================================
// When this browser tab / page / window fully loads, execute this code.

window.onload = function () {   // this runs for all the pages, even "http://127.0.0.1:5500/edit.html"
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {     // Does the URL contain ?code=...
        exchangeCodeForToken(code);
        return;
    }

    const isLoginPage =         // those are the starting pages / the login pages
        window.location.href === "http://127.0.0.1:5500/" ||
        window.location.href === "http://127.0.0.1:5500/index.html" ||
        window.location.href === "http://localhost:5500/";

    if (isLoginPage) {      // if its not a login page, then user has already logged in, this is how he went to pages different than the loging (through redirectUserByRole)
        redirect_to_login();
    }
};

// =============================
// Decode JWT
// =============================

function decodeJwt(jwtToken) {
    const payload = jwtToken.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(char => {
                return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );

    return JSON.parse(jsonPayload);
}

// ==============================================================================================
// Exchange Code For Token. This will set to the users localstorage the decodedToken JWT token 
// ==============================================================================================

async function exchangeCodeForToken(authCode) {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: authCode,
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI
    });

    try {
        const response = await fetch(`${KEYCLOAK_BASE_URL}/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: body.toString()
        });

        if (!response.ok) {
            console.error("Failed to fetch token:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        const decodedToken = decodeJwt(data.access_token);

        localStorage.setItem("decodedToken", JSON.stringify(decodedToken));

        redirectUserByRole(decodedToken);

    } catch (error) {
        console.error("Error during token exchange:", error);
    }
}

// ==========================================================
// Redirect By Role (as soon as token is confirmed)
// ==========================================================

function redirectUserByRole(decodedToken) {

    if (decodedToken.user_role === "seller") {
        
        window.location.href = "http://127.0.0.1:5500/edit.html";
    
    } else if (decodedToken.user_role === "customer") {

        window.location.href = "http://127.0.0.1:5500/customer.html";
    
    } else {
        console.log("User is not authorized or does not have a role.");
    }
}

// =============================
// Logout
// =============================

function logout() {
    localStorage.removeItem("decodedToken");    // remove ability to reconnect, need to go through login 

    const logoutRedirect = encodeURIComponent("http://127.0.0.1:5500/?logout=success");

    window.location.href = `${KEYCLOAK_BASE_URL}/logout?redirect_uri=${logoutRedirect}`;
}

// =============================
// Buttons
// =============================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}
