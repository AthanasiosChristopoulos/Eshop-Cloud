


function redirect_to_login(){

    const keycloakUrl = "http://127.0.0.1:8080/realms/eshop/protocol/openid-connect/auth";
    const params = new URLSearchParams({
        response_type: "code",
        client_id: "frontend-client",
        redirect_uri: "http://127.0.0.1:5500"
        
    });
    window.location.href = `${keycloakUrl}/?${params.toString()}`;
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        console.log('Authorization Code:', code);
        // Call the token exchange function here
        exchangeCodeForToken(code);
    } else {

        if (window.location.href === "http://127.0.0.1:5500/" || window.location.href === "http://127.0.0.1:5500/index.html" || window.location.href === "http://localhost:5500/") {
            redirect_to_login();
        }
            // redirect_to_login();

    }
};


function decodeJwt(jwtToken) {

    const base64Url = jwtToken.split('.')[1]; // Get the payload part of the JWT
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Replace Base64 URL encoding characters
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
    ); 

    return JSON.parse(jsonPayload);
}

async function exchangeCodeForToken(authCode) {
    const tokenUrl = "http://127.0.0.1:8080/realms/eshop/protocol/openid-connect/token";
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: 'frontend-client',
        redirect_uri: 'http://127.0.0.1:5500'
    });

    try {

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        if (response.ok) {

            const data = await response.json();
            // console.log("Token Response:", data);

            const accessToken = data.access_token;

            // console.log(accessToken);

            const decodedToken = decodeJwt(accessToken);
            localStorage.setItem("decodedToken", JSON.stringify(decodedToken));
            console.log(localStorage.getItem("decodedToken"));


            if (decodedToken && decodedToken.realm_access && decodedToken.user_role === "seller") { //&& decodedToken.realm_access.roles.includes("seller")
                window.location.href = "http://127.0.0.1:5500/edit.html";

            } else if (decodedToken && decodedToken.realm_access && decodedToken.user_role === "costumer") {
                window.location.href = "http://127.0.0.1:5500/costumer.html";

            } else{
                console.log("User is not authorized or doesnt have a role.");
            }
        } else {
            console.error("Failed to fetch token:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error during token exchange:", error);
    }
}

async function logout() {

    // localStorage.removeItem("decodedToken");
    // window.location.href = 'http://127.0.0.1:5500';

    console.log("Logging out...");

    const logoutUrl = "http://127.0.0.1:8080/realms/eshop/protocol/openid-connect/logout" +
        "?redirect_uri=" + encodeURIComponent("http://127.0.0.1:5500/?logout=success");

    window.location.href = logoutUrl;
}

// async function logout() {

//         const logoutUrl = "http://127.0.0.1:8080/realms/eshop/protocol/openid-connect/logout";
    

    
//         try {
//             const response = await fetch(logoutUrl);
    
//             if (response.ok) {
//                 console.log("Successfully logged out!");
//                 localStorage.removeItem("decodedToken"); // Clear token from storage
//                 window.location.href = "http://127.0.0.1:5500/"; // Redirect to your homepage
//             } else {
//                 console.error("Failed to logout:", response.status, response.statusText);
//             }
//         } catch (error) {
//             console.error("Error during logout:", error);
//         }
    
// }

document.getElementById("logoutButton").addEventListener("click", function() {
    console.log("Logging out...");
    logout();
  });




const loginButton = document.getElementById("loginButton");

if (loginButton) {

    loginButton.addEventListener("click", function() {

    redirect_to_login();
});
}



// function redirect_to_login() {
//     const keycloakUrl = "http://127.0.0.1:8080/realms/eshop/protocol/openid-connect/auth";
//     const params = new URLSearchParams({
//         response_type: "code",
//         client_id: "frontend-client",
//         redirect_uri: "http://127.0.0.1:5500",
//     });
//     window.location.href = `${keycloakUrl}/?${params.toString()}`;
// }

// window.onload = function () {
//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get("code");
//     const decodedToken = localStorage.getItem("decodedToken");

//     if (decodedToken) {
//         console.log("User is already logged in.");

//         if (code) {
//             console.log("Authorization Code found:", code);
//             // Handle token exchange if needed
//             exchangeCodeForToken(code);
//         }
//     } else {
//         console.log("No token found. Redirecting to login...");
//         // Redirect to login only if not on the login page itself
//         if (
//             window.location.href === "http://127.0.0.1:5500/" ||
//             window.location.href === "http://127.0.0.1:5500/index.html" ||
//             window.location.href === "http://127.0.0.1:5500/"
//         ) {
//             redirect_to_login();
//         }
//     }
// };

// async function exchangeCodeForToken(authCode) {
//     const tokenUrl =
//         "http://127.0.0.1:8080/realms/eshop/protocol/openid-connect/token";
//     const body = new URLSearchParams({
//         grant_type: "authorization_code",
//         code: authCode,
//         client_id: "frontend-client",
//         redirect_uri: "http://127.0.0.1:5500",
//     });

//     try {
//         const response = await fetch(tokenUrl, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//             },
//             body: body.toString(),
//         });

//         if (response.ok) {
//             const data = await response.json();
//             const accessToken = data.access_token;
//             const decodedToken = decodeJwt(accessToken);

//             localStorage.setItem("decodedToken", JSON.stringify(decodedToken));
//             console.log("Token saved:", localStorage.getItem("decodedToken"));

//             if (
//                 decodedToken &&
//                 decodedToken.realm_access &&
//                 decodedToken.user_role === "seller"
//             ) {
//                 window.location.href = "http://127.0.0.1:5500/edit.html";
//             } else if (
//                 decodedToken &&
//                 decodedToken.realm_access &&
//                 decodedToken.user_role === "costumer"
//             ) {
//                 window.location.href = "http://127.0.0.1:5500/costumer.html";
//             } else {
//                 console.log("User is not authorized or doesn't have a role.");
//             }
//         } else {
//             console.error("Failed to fetch token:", response.status, response.statusText);
//         }
//     } catch (error) {
//         console.error("Error during token exchange:", error);
//     }
// }

// function decodeJwt(jwtToken) {
//     const base64Url = jwtToken.split(".")[1]; // Get the payload part of the JWT
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace Base64 URL encoding characters
//     const jsonPayload = decodeURIComponent(
//         atob(base64)
//             .split("")
//             .map(function (c) {
//                 return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//             })
//             .join("")
//     );

//     return JSON.parse(jsonPayload);
// }

// async function logout() {
//     console.log("Clearing local session and redirecting to login...");
//     localStorage.removeItem("decodedToken"); // Remove token
//     window.location.href = "http://127.0.0.1:5500"; // Redirect to the main login page
// }
// document.addEventListener("DOMContentLoaded", function () {
//     const logoutButton = document.getElementById("logoutButton");
//     if (logoutButton) {
//         logoutButton.addEventListener("click", function () {
//             logout();
//         });
//     } else {
//         console.error("Logout button not found in the DOM.");
//     }
// });

