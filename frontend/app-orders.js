let ordersUrl = "http://127.0.0.1:5001/orders";

const token = localStorage.getItem("decodedToken");
const decodedToken = token ? JSON.parse(token) : null;

if (decodedToken) {
    const username = decodedToken.username;
    ordersUrl = `http://127.0.0.1:5001/orders/${username}`;
} else {
    console.log("No token");
}

// =====================================================================================
// DOM Elements

const allOrdersDiv = document.getElementById("allOrders");
const searchButton = document.querySelector(".search-button");

const modal = document.getElementById("modal");
const ModalHeader = document.getElementById("ModalHeader");
const ModalBody = document.getElementById("ModalBody");

// =====================================================================================
// Page Load

document.addEventListener("DOMContentLoaded", async () => {
    checkUserRole();
    await loadOrders();
});

// =====================================================================================
// User Role

function checkUserRole() {
    try {
        if (!decodedToken || decodedToken.user_role !== "customer") {
            showWrongRoleModal();
        }
    } catch (error) {
        console.log("Role check error:", error);
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

    initializeRedirectToLoginEventListener(goBackButton);
    initializeLogoutEventListener(logoutButton);
}

// =====================================================================================
// Orders

async function loadOrders() {
    try {
        console.log("ordersUrl:", ordersUrl);

        const response = await fetch(ordersUrl);

        if (!response.ok) {
            console.error("Error fetching orders");
            return;
        }

        const orders = await response.json();

        renderOrders(orders);
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
        const response = await fetch(`${ordersUrl}/${searchValue}`);

        if (!response.ok) {
            showAlertModal("Order not found.");
            return;
        }

        const orders = await response.json();

        renderOrders(orders);

    } catch (error) {
        console.log("Error:", error);
    }
});

function renderOrders(orders) {
    allOrdersDiv.innerHTML = "";

    if (Array.isArray(orders)) {
        orders.forEach((order) => {
            renderOrder(order);
        });

        return;
    }

    renderOrder(orders);
}

function renderOrder(order) {
    const ordersContent = `
        <div class="order">
            <p>Id: ${order.id}</p>
            <p>Total Price: $${order.total_price}</p>
            <p>Status: ${order.status}</p>
            <p>Products:</p>

            <ul style="list-style-type: none; padding: 0; margin-left: 20px;">
                ${renderOrderProducts(order.products)}
            </ul>

            <i onclick="showDeleteOrderModal(${order.id})" class="bi bi-trash3"></i>
        </div>
    `;

    allOrdersDiv.innerHTML += ordersContent;
}

function renderOrderProducts(products) {
    return products
        .map(
            (product) => `
                <li style="margin-bottom: 10px;">
                    <i class="bi bi-bag-check"></i>
                    ${product.title} x ${product.amount}
                </li>
            `
        )
        .join("");
}

// =====================================================================================
// Delete Order

function showDeleteOrderModal(id) {
    openModal(modal);

    ModalHeader.innerHTML = "Delete Order";
    ModalBody.innerHTML = `
        <div class="yesNoBody">
            <p>Are you sure you want to delete the order with id = ${id}?</p>

            <div class="buttons">
                <button class="yes-button">Yes</button>
                <button class="no-button">No</button>
            </div>
        </div>
    `;

    const yesButton = ModalBody.querySelector(".yes-button");
    const noButton = ModalBody.querySelector(".no-button");

    initializeDeleteOrderButtonEventListener(yesButton, id);
    initializeCloseModalEventListener(modal, noButton);
}

function initializeDeleteOrderButtonEventListener(button, id) {
    button.addEventListener("click", async () => {
        try {
            const response = await fetch(`${ordersUrl}/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error("Error deleting order");
                showAlertModal("Error deleting order.");
                return;
            }

            console.log(`Order with ID ${id} deleted successfully.`);

            closeModal(modal);
            location.reload();

        } catch (error) {
            console.error("Error:", error);
            showAlertModal("Error deleting order.");
        }
    });
}

