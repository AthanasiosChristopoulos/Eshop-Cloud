// import config from '../config.js';
// const url = `http://127.0.0.1:${config.PORT_products}/products`;

// const decodedToken = JSON.parse(localStorage.getItem("decodedToken"));
// console.log(decodedToken.username);
// console.log(`http://127.0.0.1:5000/products/${decodedToken.username}`);

// const url = `http://127.0.0.1:5000/products/${decodedToken.username}`;


url = `http://127.0.0.1:5000/products/`;

const token = localStorage.getItem("decodedToken");
console.log(token);
let initializeGoBackButtonEventListener = (go_back_button) => {
  go_back_button.addEventListener('click', async () => {
    redirect_to_login();
  });
}
let initializeLogoutEventListener = (logout_button) => {
  logout_button.addEventListener('click', async () => {
    logout();
  });
}

if (token) {
    const username = JSON.parse(token).username;
    console.log(username);

    url = `http://127.0.0.1:5000/products/${username}`;
} else{
  console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCC");
}
console.log(url);

const allProductsDiv = document.getElementById("allProducts");


document.addEventListener("DOMContentLoaded", async () => {
  try {
        if(JSON.parse(token).user_role != 'seller'){
          
          openModal(modal);

          ModalHeader.innerHTML = "Wrong User Role";
          ModalBody.innerHTML = '';

          const content = `
              <div class="buttons">
                <button class="submit-button" style="margin-top: 10px; margin-right: 5px;" id="go_back">Go Back</button>
                <button class="quit-button" id="logout">Logout</button>
              </div>
          `;
          ModalBody.innerHTML += content;

          const go_back_button = document.getElementById("go_back");
          const logout_button = document.getElementById("logout");
        
          initializeGoBackButtonEventListener(go_back_button);
          initializeLogoutEventListener(logout_button);
        }
    } catch (error) {
      console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCC");
    }

  try {
    console.log(url);

    const response = await fetch(url);

    if (response.ok) {

      const addContent = `
      <div class="product" id="addproduct">
        <i onclick="addProduct()" data-modal-target="#modal" class="bi bi-plus-circle"></i>
      </div>
      `;
      allProductsDiv.innerHTML += addContent; 

      const products = await response.json();


      putProductDivs(products);
      initializeOpenModalEventListeners();

    } else {
      console.error("Error fetching products");
    }
  } catch (e) {
    console.log("Error:", e);
  }
});

//=================================================================================================================
//=================================================================================================================
// Get Product By Id

const searchButton = document.querySelector('.search-button')

searchButton.addEventListener("click", async () => {

  const searchValue = document.getElementById("idSearch").value;

  if (searchValue){

    try {

      // console/log(`${url}/${searchValue}`);
      const response = await fetch(`${url}/${searchValue}`);
  
      if (response.ok) {
        
        const products = await response.json();
        allProductsDiv.innerHTML = ``;

        putProductDivs(products);
    
        initializeOpenModalEventListeners();
  
      } else {
        showAlertModal("Product not found.");
      }
    } catch (e) {
      console.log("Error:", e);
    }
  }
  else{
    location.reload(); 

  }

});


//=================================================================================================================
//=================================================================================================================

let putProductDivs = (products) =>{

  products.forEach((x) => {
    const productContent = `
    <div class="product">
    <img src="${x.img}" class="image"/>

      <div class="content">
        <p>Title: ${x.title} </p>
        <p>Price: $${x.price}</p>
        <p>Quantity: ${x.quantity}</p>
        
        <i onclick="updateProduct(${x.id})" data-modal-target="#modal" class="bi bi-pencil"></i>
        <i onclick="deleteProduct(${x.id})" data-modal-target="#modal" class="bi bi-trash3"></i>  
      </div>      
    </div>
    `;
    allProductsDiv.innerHTML += productContent;
  });
}
//=================================================================================================================
//=================================================================================================================


//AddProduct
let addProduct = () => {

  ModalHeader.innerHTML = "Add Product";
  const { submitButton, quitButton } = initializeProductForm(); 

  const modal = document.querySelector(submitButton.dataset.modalTarget);

  initializeSumbitButtonEventListener(submitButton);
  initializeNoButtonEventListener(modal, quitButton);
}


let initializeSumbitButtonEventListener = (submitButton) => {

  submitButton.addEventListener('click', async () => {
      const title = document.getElementById("title").value.trim(); 
      const img = document.getElementById("img").value;
      const quantity = document.getElementById("quantity").value;
      const price = document.getElementById("price").value;


      if (!title || !img || !quantity || !price) {
          showAlertModal("Missing required fields. Please fill out all fields.");
          return;
      }

      const titleInteger = parseInt(title);

      if (!isNaN(titleInteger) && Number.isInteger(titleInteger)) {
          showAlertModal("Title must be a valid string, not a number.");
          return;
      }

      const productData = { title, img, quantity, price };

      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(productData)
          });

          const responseData = await response.json(); 

          if (response.ok) {

              console.log("Product added successfully");
              closeModal(modal); 
              location.reload(); 

          } else if(responseData.error){

              showAlertModal(responseData.error || "Error adding product. Please try again.");
          } else {
              showAlertModal("Error adding product. Please try again.");
          }

      } catch (error) {
        
          console.error("Error:", error);
          showAlertModal("Error");
      }
  });
};



//=================================================================================================================
//=================================================================================================================
// updateProduct

let updateProduct = (id) => {

  ModalHeader.innerHTML = "Update Product";
  const {submitButton, quitButton} = initializeProductForm();

  const modal = document.querySelector(submitButton.dataset.modalTarget)

  initializeUpdateSumbitButtonEventListener(submitButton, id);
  initializeNoButtonEventListener(modal, quitButton);
}

let initializeUpdateSumbitButtonEventListener = async (submitButton, id) => {
  
  submitButton.addEventListener('click', async () => {

    const title = document.getElementById("title").value;
    const img = document.getElementById("img").value;
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;

    const titleInteger = parseInt(title);

    if (!isNaN(titleInteger) && Number.isInteger(titleInteger)) {
        showAlertModal("Title must be a valid string, not a number.");
        return;
    }

    let productData = {};

    if (title) productData.title = title;
    if (img) productData.img = img;
    if (quantity) productData.quantity = quantity;
    if (price) productData.price = price;

    if (Object.keys(productData).length === 0) {
      showAlertModal("No fields to update. Please fill at least one field.");
      return;
    }
   
    try {
      const response = await fetch(`${url}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        console.log("Product updated successfully");
        closeModal(modal); 
        location.reload(); 
        
      } else {
        console.error("Error updating product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
};

//=================================================================================================================
//=================================================================================================================
// deleteProduct

let deleteProduct = (id) => {

  ModalHeader.innerHTML = "Delete Product";
  ModalBody.innerHTML = `

  <div class="yesNoBody">
    <p>Are you sure you want to delete the product with id = ${id}?</p>
    <div class="buttons">
      <button data-modal-target="#modal" class="yes-button">Yes</button>
      <button data-modal-target="#modal" class="no-button">No</button>
    </div>
  </div>

  `;

  const yesButton = document.querySelector('.yes-button')
  const noButton = document.querySelector('.no-button');

  const modal = document.querySelector(yesButton.dataset.modalTarget)

  initializeYesButtonEventListener(id, modal,yesButton);
  initializeNoButtonEventListener(modal, noButton);

};

let initializeYesButtonEventListener = (id, modal, button) => {

  button.addEventListener('click', async () => {
    try {
      const response = await fetch(`${url}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {

        console.log(`Product with ID ${id} deleted successfully.`);
        closeModal(modal); 
        location.reload(); 

      } else {
        console.error('Error deleting product');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

};


let initializeNoButtonEventListener = (modal, button) => {

  button.addEventListener('click', () => {
    closeModal(modal); 
    
  });
};

//=================================================================================================================
//=================================================================================================================

let initializeProductForm = () => {

  ModalBody.innerHTML = `

    <div id="addProductForm">  
    
      <div class="inputValue">
        <label for="title">Title:</label><br>
        <input type="text" id="title" name="title" placeholder="Enter title" ><br><br>
      </div>

      <div class="inputValue">
        <label for="img">Image Location:</label><br>
        <input type="text" id="img" name="img" placeholder="Enter image location" ><br><br>
      </div>

      <div class="inputValue">      
        <label for="quantity">Quantity:</label><br>
        <input type="number" id="quantity" name="quantity" placeholder="Enter quantity"><br><br>
      </div>
 
      <div class="inputValue">
        <label for="price">Price:</label><br>
        <input type="number" id="price" name="price" step="0.01" placeholder="Enter price"><br><br>
      </div>
      
      <div class="buttons">
        <button data-modal-target="#modal" class="submit-button" style="margin-top: 10px; margin-right: 5px;">Submit</button>
        <button data-modal-target="#modal" class="quit-button">Quit</button>
      </div>


    </div>
  `;

  const submitButton = document.querySelector('.submit-button')
  const quitButton = document.querySelector('.quit-button')

  return {submitButton, quitButton}
}

//=================================================================================================================
//=================================================================================================================

let showAlertModal = (str) => {

  const alertModal = document.getElementById('alertModal')

  openModal(alertModal)
  alertModalBody.innerHTML = str

  return

}


//=================================================================================================================
//=================================================================================================================
// Modal handling

const ModalHeader = document.getElementById("ModalHeader");
const ModalBody = document.getElementById("ModalBody"); 

const overlay = document.getElementById("overlay")

let initializeOpenModalEventListeners = () => {
  const openModalButtons = document.querySelectorAll('[data-modal-target]')
  openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = document.querySelector(button.dataset.modalTarget)
      openModal(modal)
    })
  })
}

let initializeCloseModalEventListeners = () => {
  const closeModalButtons = document.querySelectorAll('[data-close-button]')
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal')
      closeModal(modal)
    })
  })
  
}

let initializeOverlayModalEventListeners = () => {
  overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active')
    modals.forEach(modal => {
      closeModal(modal)
    })
  })
}


initializeOpenModalEventListeners();
initializeCloseModalEventListeners();
initializeOverlayModalEventListeners();

function openModal(modal) {
  if (modal == null) {
    return
  }

  modal.classList.add('active')

  overlay.classList.add('active')

}

function closeModal(modal) {

  if (modal == null) {
    return
  }  

  modal.classList.remove('active')

  const activeModals = document.querySelectorAll('.modal.active');
  
  if (activeModals.length === 0) {
    overlay.classList.remove('active');
  }

}

//=================================================================================================================
//=================================================================================================================
