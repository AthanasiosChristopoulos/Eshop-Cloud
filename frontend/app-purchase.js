let url = "http://127.0.0.1:5000/products";
let url_orders = "http://127.0.0.1:5001/orders";
const url_All = "http://127.0.0.1:5000/products/allUsers";

const token = localStorage.getItem("decodedToken");
const decodedToken = token ? JSON.parse(token) : null;

if (decodedToken) {
    const username = decodedToken.username;

    url = `http://127.0.0.1:5000/products/${username}`;
    url_orders = `http://127.0.0.1:5001/orders/${username}`;
} else {
    console.log("No token");
}

console.log(url);
console.log(url_orders);

// =====================================================================================
// DOM Elements

const allProductsDiv = document.getElementById("allProducts");
const cartButton = document.getElementById("cart1");

const modal = document.getElementById("modal");
const ModalHeader = document.getElementById("ModalHeader");
const ModalBody = document.getElementById("ModalBody");

const alertModal = document.getElementById("alertModal");
const alertModalBody = document.getElementById("alertModalBody");

const overlay = document.getElementById("overlay");
const homeButton = document.getElementById("homeButton");
const searchButton = document.querySelector(".search-button");

let basket = JSON.parse(localStorage.getItem("data")) || [];

// =====================================================================================
// Page Load

document.addEventListener("DOMContentLoaded", async () => {
    checkUserRole();
    await loadAllProducts();
});

// =====================================================================================
// User Role

function checkUserRole() {
    try {
        if (!decodedToken || decodedToken.user_role !== "customer") {
            showWrongRoleModal();
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

function showWrongRoleModal() {
    openModal(modal);

    ModalHeader.innerHTML = "Wrong User Role";
    ModalBody.innerHTML = `
        <div class="buttons">
            <button class="submit-button" style="margin-top: 10px; margin-right: 5px;" id="go_back">Go Back</button>
            <button class="quit-button" id="logout">Logout</button>
        </div>
    `;

    const goBackButton = document.getElementById("go_back");
    const logoutButton = document.getElementById("logout");

    initializeGoBackButtonEventListener(goBackButton);
    initializeLogoutEventListener(logoutButton);
}

function initializeGoBackButtonEventListener(button) {
    button.addEventListener("click", () => {
        redirect_to_login();
    });
}

function initializeLogoutEventListener(button) {
    button.addEventListener("click", () => {
        logout();
    });
}

// =====================================================================================
// Products

async function loadAllProducts() {
    try {
        const response = await fetch(url_All);

        if (!response.ok) {
            console.error("Error fetching products");
            return;
        }

        const products = await response.json();

        renderProducts(products);
        initializeOpenModalEventListeners();
    } catch (error) {
        console.log("Error:", error);
    }
}

searchButton.addEventListener("click", async () => {
    const searchValue = document.getElementById("idSearch").value;

    if (!searchValue) {
        location.reload();
        return;
    }

    try {
        const response = await fetch(`${url_All}/${searchValue}`);

        if (!response.ok) {
            showAlertModal("Product not found.");
            return;
        }

        const products = await response.json();

        renderProducts(products);
        initializeOpenModalEventListeners();
    } catch (error) {
        console.log("Error:", error);
    }
});

function renderProducts(products) {
    allProductsDiv.innerHTML = "";

    products.forEach((product) => {
        if (product.quantity === 0) {
            return;
        }

        const basketItem = basket.find((item) => item.id === product.id);
        const amountOfProducts = basketItem ? basketItem.amount : 0;

        const productContent = `
            <div class="product">
                <img src="${product.img}" class="image"/>

                <div class="content">
                    <p>Title: ${product.title}</p>
                    <p>Price: $${product.price}</p>
                    <p>Quantity: ${product.quantity}</p>

                    <div class="amountButtons">
                        <i onclick="decrement(${product.id})" class="bi bi-dash-lg"></i>
                        <div id="${product.id}" class="quantity">${amountOfProducts}</div>
                        <i onclick="increment(${product.id}, '${product.title}', ${product.price})" class="bi bi-plus-lg"></i>
                    </div>
                </div>
            </div>
        `;

        allProductsDiv.innerHTML += productContent;
    });
}

// =====================================================================================
// Basket

async function increment(id, title, price) {
    try {
        const response = await fetch(`${url_All}/${id}`);

        if (!response.ok) {
            showAlertModal("Product Id not found.");
            return;
        }

        const productArray = await response.json();
        const product = productArray[0];

        const basketItem = basket.find((item) => item.id === id);

        if (!basketItem) {
            if (product.quantity <= 0) {
                showAlertModal("This product is out of stock!");
                return;
            }

            basket.push({
                id,
                amount: 1,
                title,
                price,
            });
        } else {
            basketItem.amount += 1;
        }

        updateBasketItem(id);
        saveBasket();
    } catch (error) {
        console.log("Error fetching product data:", error);
    }
}

async function decrement(id) {
    const basketItem = basket.find((item) => item.id === id);

    if (!basketItem || basketItem.amount === 0) {
        return;
    }

    basketItem.amount -= 1;

    updateBasketItem(id);

    basket = basket.filter((item) => item.amount !== 0);

    saveBasket();
}

function updateBasketItem(id) {
    const basketItem = basket.find((item) => item.id === id);

    if (basketItem) {
        document.getElementById(id).innerHTML = basketItem.amount;
    }

    updateCartAmount();
}

function updateCartAmount() {
    const cartIcon = document.getElementById("cartAmount");

    cartIcon.innerHTML = basket
        .map((item) => item.amount)
        .reduce((total, amount) => total + amount, 0);
}

function saveBasket() {
    localStorage.setItem("data", JSON.stringify(basket));
}

updateCartAmount();

// =====================================================================================
// Home Button

homeButton.addEventListener("click", () => {
    if (basket.length === 0) {
        localStorage.removeItem("data");
        window.location.href = "customer.html";
        return;
    }

    showLeaveShoppingModal();
});

function showLeaveShoppingModal() {
    ModalHeader.innerHTML = "Leave Shopping";
    ModalBody.innerHTML = `
        <div class="yesNoBody">
            <p>Are you sure you want to leave the site? All your shopping progress will be lost.</p>

            <div class="buttons">
                <button class="yes-button">Yes</button>
                <button class="no-button">No</button>
            </div>
        </div>
    `;

    openModal(modal);

    const yesButton = document.querySelector(".yes-button");
    const noButton = document.querySelector(".no-button");

    initializeYesButtonEventListener(yesButton);
    initializeCloseModalEventListener(modal, noButton);
}

function initializeYesButtonEventListener(button) {
    button.addEventListener("click", () => {
        closeModal(modal);

        localStorage.removeItem("data");

        window.location.href = "customer.html";
    });
}

// =====================================================================================
// Purchase

cartButton.addEventListener("click", () => {
    if (basket.length === 0) {
        showAlertModal("You haven't purchased anything.");
        return;
    }

    showPurchaseModal();
});

function showPurchaseModal() {
    openModal(modal);

    ModalHeader.innerHTML = "Confirm your Purchase";
    ModalBody.innerHTML = "";

    let totalOrderPrice = 0;

    basket.forEach((item) => {
        totalOrderPrice += item.price * item.amount;

        ModalBody.innerHTML += `
            <div class="productOrder">
                <i class="bi bi-bag-check"></i>
                <p>${item.title}: $${item.price} x ${item.amount}</p>
            </div>
        `;
    });

    ModalBody.innerHTML += `
        <div class="totalPrice">
            <p class="totalPriceHeader">Total Price:</p>
            <p>$${totalOrderPrice}</p>

            <div class="buttons">
                <button class="submit-button" style="margin-top: 10px; margin-right: 5px;" id="confirmPurchaseButton">Purchase</button>
                <button class="quit-button">Cancel</button>
            </div>
        </div>
    `;

    const confirmPurchaseButton = document.getElementById("confirmPurchaseButton");
    const cancelPurchaseButton = document.querySelector(".quit-button");

    initializePurchaseButtonEventListener(confirmPurchaseButton, totalOrderPrice);
    initializeCloseModalEventListener(modal, cancelPurchaseButton);
}

function initializePurchaseButtonEventListener(button, totalOrderPrice) {
    button.addEventListener("click", async () => {
        const products = basket.map((item) => ({
            title: item.title,
            amount: item.amount,
            product_id: item.id,
        }));

        const orderData = {
            products,
            total_price: totalOrderPrice,
            status: "Pending",
        };

        try {
            const response = await fetch(url_orders, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });

            const responseData = await response.json();

            if (response.ok) {
                closeModal(modal);
                localStorage.removeItem("data");
                location.reload();
                return;
            }

            if (responseData.error) {
                showAlertModal(responseData.error);
            } else {
                showAlertModal("Error adding product. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            showAlertModal("Error");
        }
    });
}

// =====================================================================================
// Modal Handling

function showAlertModal(message) {
    openModal(alertModal);
    alertModalBody.innerHTML = message;
}

function initializeOpenModalEventListeners() {
    const openModalButtons = document.querySelectorAll("[data-modal-target]");

    openModalButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            openModal(modal);
        });
    });
}

function initializeCloseModalEventListener(modal, button) {
    button.addEventListener("click", () => {
        closeModal(modal);
    });
}

function openModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.add("active");
    overlay.classList.add("active");
}

function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    const activeModals = document.querySelectorAll(".modal.active");

    if (activeModals.length === 0) {
        overlay.classList.remove("active");
    }
}

initializeOpenModalEventListeners();