
// import { PORT_products, PORT_orders } from '../config.js';


// const url = `http://127.0.0.1:${PORT_products}/products`;

url = `http://127.0.0.1:5000/products`;
url_orders = `http://127.0.0.1:5001/orders`;
url_All = `http://127.0.0.1:5000/products/allUsers`;

const token = localStorage.getItem("decodedToken");

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
  url = `http://127.0.0.1:5000/products/${username}`;
  url_orders = `http://127.0.0.1:5001/orders/${username}`;
} else{
console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCC");
}
console.log(url);
console.log(url_orders);


const allProductsDiv = document.getElementById("allProducts");

const purchaseButton = document.getElementById("cart1"); 

const modal = document.getElementById("modal"); 
const ModalHeader = document.getElementById("ModalHeader");
const ModalBody = document.getElementById("ModalBody"); 

let basket = JSON.parse(localStorage.getItem("data")) || [];


//=================================================================================================================
//=================================================================================================================

document.addEventListener("DOMContentLoaded", async () => {

  try {
      if(JSON.parse(token).user_role != 'costumer'){
        
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

    const response = await fetch(url_All);

    if (response.ok) {

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
      const response = await fetch(`${url_All}/${searchValue}`);
  
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

let putProductDivs = (products) => {

    allProductsDiv.innerHTML = ''; 
  
    products.forEach((x) => {

      // In case there is id/title search
      let search = basket.find((purchaseProduct) => purchaseProduct.id === x.id) || [];
      let amountOfProducts = search.amount || 0;

      if(x.quantity == 0){
        return;
      }

      const productContent = `
      <div class="product">

        <img src="${x.img}" class="image"/>

        <div class="content">
          <p>Title: ${x.title}</p>
          <p>Price: $${x.price}</p>
          <p>Quantity: ${x.quantity}</p>
  
          <div class="amountButtons">
              <i onclick="decrement(${x.id})" class="bi bi-dash-lg"></i>  
              <div id=${x.id} class="quantity">${amountOfProducts}</div>
              <i onclick="increment(${x.id}, '${x.title}', ${x.price} )" class="bi bi-plus-lg"></i>
          </div>

        </div>      
      </div>
      `;
      allProductsDiv.innerHTML += productContent;
    });
  }

//=================================================================================================================
//=================================================================================================================
  
let increment = async (id, title, price) => {

  try {
    console.log(url_All);
    const response = await fetch(`${url_All}/${id}`);

    if (response.ok) {

      const productArray = await response.json(); 
      const product = productArray[0]; 

      const {quantity} = product;

      let search = basket.find((x) => x.id === id);

      if (search === undefined) {
        if (quantity > 0) {  
          basket.push({
            id: id,
            amount: 1,
            title: title,
            price: price,
          });
          update(id);
          localStorage.setItem("data", JSON.stringify(basket));
          localStorage.setItem('testKey', 'sss');

        } else {
          showAlertModal('This product is out of stock!');
        }
      } else {

        search.amount += 1;
        update(id);
        localStorage.setItem("data", JSON.stringify(basket));


      }
    } else {
      showAlertModal("Product Id not found.");
    }

  } catch (e) {
    console.log("Error fetching product data:", e);
  }
};

//=================================================================================================================
//=================================================================================================================

let decrement = async (id) => {
  let search = basket.find((x) => x.id === id);

  if (search === undefined || search.amount === 0) {
    return;
  } else {
    search.amount -= 1;
    update(id); 

    // If no more products are in the cart, remove the item from the basket
    basket = basket.filter((x) => x.amount !== 0);
    localStorage.setItem("data", JSON.stringify(basket));
  }
};

//=================================================================================================================
//=================================================================================================================


//=================================================================================================================
//=================================================================================================================

let update = (id) => {

  let search = basket.find((x) => x.id === id);
  document.getElementById(id).innerHTML = search.amount;

  calculation();
};

//=================================================================================================================
//=================================================================================================================

let calculation = () => {

  let cartIcon = document.getElementById("cartAmount");
  cartIcon.innerHTML = basket.map((x) => x.amount).reduce((x, y) => x + y, 0);
};

calculation();



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
// Home Button

const homeButton = document.getElementById('homeButton');

homeButton.addEventListener('click', async () => {

  if(basket.length === 0) {
    // localStorage.clear();
    localStorage.removeItem("data");

    window.location.href = 'costumer.html';

  }
  else{

    ModalHeader.innerHTML = "Leave Shopping";
    ModalBody.innerHTML = `
  
    <div class="yesNoBody">
      <p>Are you sure you want to leave the site ? All your shopping progress will be lost</p>
      <div class="buttons">
        <button class="yes-button">Yes</button>
        <button class="no-button">No</button>
      </div>
    </div>
    `;
  
    // const modal = document.getElementById('modal');
  
    const yesButton = document.querySelector('.yes-button')
    const noButton = document.querySelector('.no-button');
  
    initializeYesButtonEventListener(modal,yesButton);
    initializeNoButtonEventListener(modal, noButton);
  }

});

let initializeYesButtonEventListener = (modal, button) => {

  button.addEventListener('click', async () => {
    closeModal(modal); 
    // localStorage.clear();
    localStorage.removeItem("data");

    window.location.href = 'costumer.html';

  });
};

let initializeNoButtonEventListener = (modal, button) => {

  button.addEventListener('click', () => {
    closeModal(modal); 
    
  });
};

//=================================================================================================================
//=================================================================================================================
// Purchase

purchaseButton.addEventListener('click', async () => {

  if( basket.length === 0 ){
    showAlertModal("You havent purchased anything")
  }
  else {

    openModal(modal)
    ModalHeader.innerHTML = "Confirm your Purchase";
    ModalBody.innerHTML = ''; 

    let total_order_price = 0;



  basket.forEach((x) => {
      total_order_price += x.price * x.amount;

      const basketContent = `
      <div class="productOrder">
          <i class="bi bi-bag-check"></i>
          <p>${x.title}: $${x.price} x ${x.amount}</p>
      </div>
      `;
      ModalBody.innerHTML += basketContent;
  });


  const basketContent = `
  <div class="totalPrice">
      <p class="totalPriceHeader">Total Price:</p>
      <p>$${total_order_price}</p>

      <div class="buttons">
        <button class="submit-button" style="margin-top: 10px; margin-right: 5px;" id="purchaseButton">Purchase</button>
        <button class="quit-button">Cancel</button>
      </div>
  </div>
  `;
  ModalBody.innerHTML += basketContent;

  const purchaseButton = document.getElementById("purchaseButton");
  const quitButton = document.querySelector('.quit-button');

  initializePurchaseButtonEventListener(purchaseButton, total_order_price);
  initializeNoButtonEventListener(modal, quitButton);
  
  }
});

//=================================================================================================================
//=================================================================================================================

let initializePurchaseButtonEventListener = (purchaseButton, total_order_price) => {

purchaseButton.addEventListener('click', async () => {

  const products = basket.map((x) => ({
    title: x.title,
    amount: x.amount,
    product_id: x.id   
  }));

  let status = "Pending";
  let total_price = total_order_price;

  const productData = { products, total_price, status };

  try {
    const response = await fetch(url_orders, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const responseData = await response.json(); 

    if (response.ok) {

      // await updateProductQuantities(products);

      closeModal(modal);
      // localStorage.clear();
      localStorage.removeItem("data");

      location.reload(); 

    } else if(responseData.error) {
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
// update Request for products
// let updateProductQuantities = async (products) => {

// try {

//   for (const product of products) {
//     console.log(`${url_All}/${product.product_id}`);
//     const response = await fetch(`${url_All}/${product.product_id}`);
//     if (response.ok) {
//       const productDataArray = await response.json();
//       const productData = productDataArray[0]; 

//       const newQuantity = productData.quantity - product.amount;

//       await fetch(`${url_All}/${product.product_id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ quantity: newQuantity }),
//       });

//       console.log(`Updated product ${product.title} stock to ${newQuantity}`);
//     } else {
//       console.error(`Failed to fetch product with ID ${product.product_id}`);
//     }
//   }
// } catch (error) {
//   console.error("Error updating product quantities:", error);
// }
// };



//=================================================================================================================
//=================================================================================================================
// Modal handling

const alertModalBody = document.getElementById("alertModalBody");

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

