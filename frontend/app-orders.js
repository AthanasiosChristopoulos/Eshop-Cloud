// import config from '../config.js';
// const url = `http://127.0.0.1:${config.PORT_orders}/orders`;



url = `http://127.0.0.1:5001/orders`;

const token = localStorage.getItem("decodedToken");
console.log(token);
if (token) {
  const username = JSON.parse(token).username;
  
  url = `http://127.0.0.1:5001/orders/${username}`;
} else{
  console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCC");
}

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

const allOrdersDiv = document.getElementById("allOrders");


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
    console.log(url);
    const response = await fetch(url);

    if (response.ok) {
    
      allOrdersDiv.innerHTML = ``;

      const orders = await response.json();

      putOrderDivs(orders);
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
      const response = await fetch(`${url}/${searchValue}`);
  
      if (response.ok) {
        
        const orders = await response.json();
        allOrdersDiv.innerHTML = ``;

        putOrderDivs(orders);
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

let putOrderDivs = (orders) => {

    if (Array.isArray(orders)) {
        orders.forEach((order) => {
            const ordersContent = `
                <div class="order">
                    <p>Total Price: $${order.total_price}</p>
                    <p>Status: ${order.status}</p>
                    <p>Products:</p>

                    <ul style="list-style-type: none; padding: 0; margin-left:20px"> 
                        ${order.products.map(product => `
                            <li style="margin-bottom: 10px;">
                                <i class="bi bi-bag-check"></i> ${product.title} x ${product.amount}
                            </li>
                        `).join('')}
                    </ul>

                    <i onclick="deleteProduct(${order.id})" data-modal-target="#modal" class="bi bi-trash3"></i>        
                </div>
            `;
            allOrdersDiv.innerHTML += ordersContent;
        });
    } else {

        const order = orders; 
        const ordersContent = `
            <div class="order">
                <p>Id: ${order.id}</p>
                <p>Total Price: $${order.total_price}</p>
                <p>Status: ${order.status}</p>
                <p>Products:</p>
                <ul style="list-style-type: none; padding: 0;"> <!-- Remove default bullets -->
                    ${order.products.map(product => `
                        <li style="margin-bottom: 10px;"> <!-- Adjust the margin here -->
                            <i class="bi bi-bag-check"></i> ${product.title} x ${product.amount}
                        </li>
                    `).join('')}
                </ul>
                <i onclick="deleteProduct(${order.id})" data-modal-target="#modal" class="bi bi-trash3"></i>        
            </div>
        `;
        allOrdersDiv.innerHTML += ordersContent;
    }
}

//=================================================================================================================
//=================================================================================================================
// deleteProduct

let deleteProduct = (id) => {

    ModalHeader.innerHTML = "Delete Product";
    ModalBody.innerHTML = `
  
    <div class="yesNoBody">
      <p>Are you sure you want to delete the order with id = ${id}?</p>
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
// Modal handling

const ModalHeader = document.getElementById("ModalHeader");
const ModalBody = document.getElementById("ModalBody"); 
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

  
let showAlertModal = (str) => {

    const alertModal = document.getElementById('alertModal')
  
    openModal(alertModal)
    alertModalBody.innerHTML = str
  
    return
  }
  
//=================================================================================================================
//=================================================================================================================





















// const url = `http://127.0.0.1:5001/orders/c`;
// console.log(url);

// const allOrdersDiv = document.getElementById("allOrders");


// document.addEventListener("DOMContentLoaded", async () => {
//   try {

//     const response = await fetch(url);

//     if (response.ok) {
    
//       allOrdersDiv.innerHTML = ``;

//       const orders = await response.json();

//       putOrderDivs(orders);
//       initializeOpenModalEventListeners();

//     } else {
//       console.error("Error fetching products");
//     }
//   } catch (e) {
//     console.log("Error:", e);
//   }
// });

// //=================================================================================================================
// //=================================================================================================================
// // Get Product By Id

// const searchButton = document.querySelector('.search-button')

// searchButton.addEventListener("click", async () => {
    
//   const searchValue = document.getElementById("idSearch").value;

//   if (searchValue){

//     try {
//       console.log("AAAAAAAAAAAAAAAAAA: ",`${url}/${searchValue}`);
//       const response = await fetch(`${url}/${searchValue}`);
  
//       if (response.ok) {
        
//         const orders = await response.json();
//         allOrdersDiv.innerHTML = ``;

//         putOrderDivs(orders);
//         initializeOpenModalEventListeners();

//       } else {

//         showAlertModal("Product not found.");
//       }

//     } catch (e) {
//       console.log("Error:", e);
//     }
//   }
//   else{
//     location.reload(); 
//   }
// });

// //=================================================================================================================
// //=================================================================================================================

// let putOrderDivs = (orders) => {

//     if (Array.isArray(orders)) {
//         orders.forEach((order) => {
//             const ordersContent = `
//                 <div class="order">
//                     <p>Total Price: $${order.total_price}</p>
//                     <p>Status: ${order.status}</p>
//                     <p>Products:</p>

//                     <ul style="list-style-type: none; padding: 0; margin-left:20px"> 
//                         ${order.products.map(product => `
//                             <li style="margin-bottom: 10px;">
//                                 <i class="bi bi-bag-check"></i> ${product.title} x ${product.amount}
//                             </li>
//                         `).join('')}
//                     </ul>

//                     <i onclick="deleteProduct(${order.id})" data-modal-target="#modal" class="bi bi-trash3"></i>        
//                 </div>
//             `;
//             allOrdersDiv.innerHTML += ordersContent;
//         });
//     } else {

//         const order = orders; 
//         const ordersContent = `
//             <div class="order">
//                 <p>Id: ${order.id}</p>
//                 <p>Total Price: $${order.total_price}</p>
//                 <p>Status: ${order.status}</p>
//                 <p>Products:</p>
//                 <ul style="list-style-type: none; padding: 0;"> <!-- Remove default bullets -->
//                     ${order.products.map(product => `
//                         <li style="margin-bottom: 10px;"> <!-- Adjust the margin here -->
//                             <i class="bi bi-bag-check"></i> ${product.title} x ${product.amount}
//                         </li>
//                     `).join('')}
//                 </ul>
//                 <i onclick="deleteProduct(${order.id})" data-modal-target="#modal" class="bi bi-trash3"></i>        
//             </div>
//         `;
//         allOrdersDiv.innerHTML += ordersContent;
//     }
// }

// //=================================================================================================================
// //=================================================================================================================
// // deleteProduct

// let deleteProduct = (id) => {

//     ModalHeader.innerHTML = "Delete Product";
//     ModalBody.innerHTML = `
  
//     <div class="yesNoBody">
//       <p>Are you sure you want to delete the order with id = ${id}?</p>
//       <div class="buttons">
//         <button data-modal-target="#modal" class="yes-button">Yes</button>
//         <button data-modal-target="#modal" class="no-button">No</button>
//       </div>
//     </div>
  
//     `;
    
//     const yesButton = document.querySelector('.yes-button')
//     const noButton = document.querySelector('.no-button');
  
//     const modal = document.querySelector(yesButton.dataset.modalTarget)
  
//     initializeYesButtonEventListener(id, modal,yesButton);
//     initializeNoButtonEventListener(modal, noButton);
  
//   };
  

//   let initializeYesButtonEventListener = (id, modal, button) => {
  
//     button.addEventListener('click', async () => {

//       try {
//         const response = await fetch(`${url}/${id}`, {
//           method: 'DELETE',
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         });
  
//         if (response.ok) {
  
//           console.log(`Product with ID ${id} deleted successfully.`);
//           closeModal(modal); 
//           location.reload(); 
  
//         } else {
//           console.error('Error deleting product');
//         }
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     });
  
//   };
  

//   let initializeNoButtonEventListener = (modal, button) => {
  
//     button.addEventListener('click', () => {
//       closeModal(modal); 
      
//     });
//   };

  
// //=================================================================================================================
// //=================================================================================================================
// // Modal handling

// const ModalHeader = document.getElementById("ModalHeader");
// const ModalBody = document.getElementById("ModalBody"); 
// const alertModalBody = document.getElementById("alertModalBody");

// const overlay = document.getElementById("overlay")


// let initializeOpenModalEventListeners = () => {
//   const openModalButtons = document.querySelectorAll('[data-modal-target]')
//   openModalButtons.forEach(button => {
//     button.addEventListener('click', () => {
//       const modal = document.querySelector(button.dataset.modalTarget)
//       openModal(modal)
//     })
//   })
// }

// let initializeCloseModalEventListeners = () => {
//   const closeModalButtons = document.querySelectorAll('[data-close-button]')
//   closeModalButtons.forEach(button => {
//     button.addEventListener('click', () => {
//       const modal = button.closest('.modal')
//       closeModal(modal)
//     })
//   })
// }

// let initializeOverlayModalEventListeners = () => {
//   overlay.addEventListener('click', () => {
//     const modals = document.querySelectorAll('.modal.active')
//     modals.forEach(modal => {
//       closeModal(modal)
//     })
//   })
// }

// initializeOpenModalEventListeners();
// initializeCloseModalEventListeners();
// initializeOverlayModalEventListeners();

// function openModal(modal) {
//   if (modal == null) {
//     return
//   }

//   modal.classList.add('active')

//   overlay.classList.add('active')

// }

// function closeModal(modal) {

//   if (modal == null) {
//     return
//   }  

//   modal.classList.remove('active')

//   const activeModals = document.querySelectorAll('.modal.active');
  
//   if (activeModals.length === 0) {
//     overlay.classList.remove('active');
//   }

// }

  
// let showAlertModal = (str) => {

//     const alertModal = document.getElementById('alertModal')
  
//     openModal(alertModal)
//     alertModalBody.innerHTML = str
  
//     return
//   }
  
// //=================================================================================================================
// //=================================================================================================================

// document.getElementById("logoutButton").addEventListener("click", function() {
//   console.log("Logging out...");
//   logout();
// });
