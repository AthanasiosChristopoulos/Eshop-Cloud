
const overlay = document.getElementById("overlay");
const alertModalBody = document.getElementById("alertModalBody");

// ================================================================================

function initializeCloseModalEventListeners() {
    const closeModalButtons = document.querySelectorAll(".close-button");

    closeModalButtons.forEach(button => {
        button.addEventListener("click", () => {
            const modal = button.closest(".modal");
            closeModal(modal);
        });
    });
}

initializeCloseModalEventListeners();

let initializeCloseModalEventListener = (modal, button) => {

    button.addEventListener('click', () => {
        closeModal(modal);
    });
};

// ================================================================================

let initializeOverlayModalEventListeners = () => {
    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active')
        modals.forEach(modal => {
            closeModal(modal)
        })
    })
}

initializeOverlayModalEventListeners();

// ================================================================================

function initializeRedirectToLoginEventListener(button) {
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
// Modal Handling

function showAlertModal(message) {
    openModal(alertModal);
    alertModalBody.innerHTML = message;
}

function openModal(targetModal) {
    if (!targetModal) {
        return;
    }

    targetModal.classList.add("active");
    overlay.classList.add("active");
}

function closeModal(targetModal) {
    if (!targetModal) {
        return;
    }

    targetModal.classList.remove("active");

    const activeModals = document.querySelectorAll(".modal.active");

    if (activeModals.length === 0) {
        overlay.classList.remove("active");
    }
}
