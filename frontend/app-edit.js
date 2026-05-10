
const token = localStorage.getItem("decodedToken");     // get access token from the localstorage
const BASE_URL = "http://127.0.0.1:5000/products";

let url = BASE_URL;

if (token) {
    console.log('token of the user: ' + token)
    const decodedToken = JSON.parse(token);
    url = `${BASE_URL}/${decodedToken.username}`;
}

const main_modal = document.getElementById("modal");
const allProductsDiv = document.getElementById("allProducts");
const ModalHeader = document.getElementById("ModalHeader");
const ModalBody = document.getElementById("ModalBody");
const overlay = document.getElementById("overlay");
const searchButton = document.querySelector(".search-button");

// =============================
// Page Load
// =============================

document.addEventListener("DOMContentLoaded", async () => {
    checkUserRole();
    await loadProducts();
});

// =============================
// User Role
// =============================

function checkUserRole() {
    try {
        const decodedToken = JSON.parse(token);

        if (decodedToken.user_role !== "seller") {
            showWrongRoleModal();
        }
    } catch (error) {
        console.log("No valid token found");
    }
}

function showWrongRoleModal() {
    openModal(main_modal);

    ModalHeader.innerHTML = "Wrong User Role";
    ModalBody.innerHTML = `
    <div class="buttons">
      <button class="submit-button" style="margin-top: 10px; margin-right: 5px;" id="go_back">Go Back</button>
      <button class="quit-button" id="logout">Logout</button>
    </div>
  `;

    document.getElementById("go_back").addEventListener("click", redirect_to_login);
    document.getElementById("logout").addEventListener("click", logout);
}

// =============================
// Products
// =============================

async function loadProducts() {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Error fetching products");
            return;
        }

        const products = await response.json();

        // this is the product card to add other products, rendered at the start
        allProductsDiv.innerHTML = `    
            <div class="product" id="addproduct">
                <i onclick="addProduct()" class="bi bi-plus-circle"></i>
            </div>
        `;

        displayProducts(products);
        initializeOpenModalEventListeners();

    } catch (error) {
        console.error("Error:", error);
    }
}

function displayProducts(products) {
    allProductsDiv.innerHTML += products.map(product => `
        <div class="product">
            <img src="${product.img}" class="image"/>

            <div class="content">
                <p>Title: ${product.title}</p>
                <p>Price: $${product.price}</p>
                <p>Quantity: ${product.quantity}</p>

                <i onclick="updateProduct(${product.id})" class="bi bi-pencil"></i>
                <i onclick="deleteProduct(${product.id})" class="bi bi-trash3"></i>
            </div>
        </div>
    `).join("");
}

// =============================
// Search
// =============================

searchButton.addEventListener("click", async () => {
    const searchValue = document.getElementById("idSearch").value.trim();

    if (!searchValue) {
        location.reload();
        return;
    }

    try {
        const response = await fetch(`${url}/${searchValue}`);

        if (!response.ok) {
            showAlertModal("Product not found.");
            return;
        }

        const products = await response.json();

        allProductsDiv.innerHTML = "";
        displayProducts(products);
        initializeOpenModalEventListeners();

    } catch (error) {
        console.error("Error:", error);
    }
});

// =============================
// Add Product
// =============================

function addProduct() {

    ModalHeader.innerHTML = "Add Product";
    openModal(main_modal);
    const { submitButton, quitButton } = initializeProductForm();

    submitButton.addEventListener("click", async () => {
        const productData = getProductFormData();

        if (!validateProductData(productData, true)) return;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            });

            const responseData = await response.json();

            if (response.ok) {
                closeModal(main_modal);
                location.reload();
            } else {
                showAlertModal(responseData.error || "Error adding product. Please try again.");
            }

        } catch (error) {
            console.error("Error:", error);
            showAlertModal("Error adding product.");
        }
    });

    initializeNoButtonEventListener(main_modal, quitButton);
}

// =============================
// Update Product
// =============================

function updateProduct(id) {

    ModalHeader.innerHTML = "Update Product";
    openModal(main_modal);
    const { submitButton, quitButton } = initializeProductForm();

    submitButton.addEventListener("click", async () => {
        const formData = getProductFormData();
        const productData = {};

        if (formData.title) productData.title = formData.title;
        if (formData.img) productData.img = formData.img;
        if (formData.quantity) productData.quantity = formData.quantity;
        if (formData.price) productData.price = formData.price;

        if (!validateProductData(productData, false)) return;

        try {
            const response = await fetch(`${url}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                closeModal(main_modal);
                location.reload();
            } else {
                showAlertModal("Error updating product.");
            }

        } catch (error) {
            console.error("Error:", error);
            showAlertModal("Error updating product.");
        }
    });

    initializeNoButtonEventListener(main_modal, quitButton);
}

// =============================
// Delete Product
// =============================

function deleteProduct(id) {

    openModal(main_modal)
    
    ModalHeader.innerHTML = "Delete Product";
    ModalBody.innerHTML = `
        <div class="yesNoBody">
            <p>Are you sure you want to delete the product with id = ${id}?</p>

            <div class="buttons">
                <button class="yes-button">Yes</button>
                <button class="no-button">No</button>
            </div>
        </div>
    `;

    const yesButton = document.querySelector(".yes-button");
    const noButton = document.querySelector(".no-button");
    const modal = document.querySelector(yesButton.dataset.modalTarget);

    yesButton.addEventListener("click", async () => {
        openModal(main_modal)
        try {
            const response = await fetch(`${url}/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                closeModal(modal);
                location.reload();
            } else {
                showAlertModal("Error deleting product.");
            }

        } catch (error) {
            console.error("Error:", error);
            showAlertModal("Error deleting product.");
        }
    });

    initializeNoButtonEventListener(modal, noButton);
}

// =============================
// Product Form
// =============================

function initializeProductForm() {

    ModalBody.innerHTML = `
    <div id="addProductForm">

      <div class="inputValue">
        <label for="title">Title:</label><br>
        <input type="text" id="title" name="title" placeholder="Enter title" class="formInput"><br><br>
      </div>

      <div class="inputValue">
        <label for="img">Image Location:</label><br>
        <input type="text" id="img" name="img" placeholder="Enter image location" class="formInput"><br><br>
      </div>

      <div class="inputValue">
        <label for="quantity">Quantity:</label><br>
        <input type="number" id="quantity" name="quantity" placeholder="Enter quantity" class="formInput"><br><br>
      </div>

      <div class="inputValue">
        <label for="price">Price:</label><br>
        <input type="number" id="price" name="price" step="0.01" placeholder="Enter price" class="formInput"><br><br>
      </div>

      <div class="buttons">
        <button class="submit-button" style="margin-top: 10px; margin-right: 5px;">Submit</button>
        <button class="quit-button">Quit</button>
      </div>

    </div>
  `;

    return {
        submitButton: document.querySelector(".submit-button"),
        quitButton: document.querySelector(".quit-button")
    };
}

function getProductFormData() {
    return {
        title: document.getElementById("title").value.trim(),
        img: document.getElementById("img").value.trim(),
        quantity: document.getElementById("quantity").value,
        price: document.getElementById("price").value
    };
}

function validateProductData(productData, requireAllFields) {
    if (requireAllFields) {
        if (!productData.title || !productData.img || !productData.quantity || !productData.price) {
            showAlertModal("Missing required fields. Please fill out all fields.");
            return false;
        }
    }

    if (Object.keys(productData).length === 0) {
        showAlertModal("No fields to update. Please fill at least one field.");
        return false;
    }

    if (productData.title && !isNaN(parseInt(productData.title))) {
        showAlertModal("Title must be a valid string, not a number.");
        return false;
    }

    return true;
}

// =============================
// Alert Modal
// =============================

function showAlertModal(message) {
    const alertModal = document.getElementById("alertModal");

    openModal(alertModal);
    alertModalBody.innerHTML = message;
}

// =============================
// Modal Handling
// =============================

function initializeNoButtonEventListener(modal, button) {
    button.addEventListener("click", () => {
        closeModal(modal);
    });
}

function openModal(modal) {
    if (!modal) return;

    modal.classList.add("active");
    overlay.classList.add("active");
}

function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("active");

    const activeModals = document.querySelectorAll(".modal.active");

    if (activeModals.length === 0) {
        overlay.classList.remove("active");
    }
}
