function initializeCloseModalEventListeners() {
    const closeModalButtons = document.querySelectorAll(".close-button");

    closeModalButtons.forEach(button => {
        button.addEventListener("click", () => {
            const modal = button.closest(".modal");
            closeModal(modal);
        });
    });
}