function showModal(title, description) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");

  modalTitle.textContent = title;
  modalDescription.textContent = description;

  modal.style.display = "flex"; // Show the modal
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none"; // Hide the modal
}

function showImageModal(imageSrc) {
  const modal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");

  if (modal && modalImage) {
    modalImage.src = imageSrc; // Set the image source
    modal.style.display = "flex"; // Show the modal
  } else {
    console.error("Modal or modal image element not found.");
  }
}

function closeImageModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.style.display = "none"; // Hide the modal
  } else {
    console.error("Modal element not found.");
  }
}
