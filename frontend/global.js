
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

