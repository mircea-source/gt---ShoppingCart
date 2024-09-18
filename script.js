// Get DOM elements
const productForm = document.getElementById('product-form');
const productNameInput = document.getElementById('product-name');
const productSuggestions = document.getElementById('product-suggestions');
const cartSection = document.getElementById('cart-section');
const cartItemTemplate = document.getElementById('cart-item-template');

// Load cart data from local storage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to fetch product suggestions from the API
async function fetchProductSuggestions(searchTerm) {
    if (searchTerm.length >= 3) {
      const response = await fetch(`https://api.escuelajs.co/api/v1/products/?title=${searchTerm}`);
      const data = await response.json();
      productSuggestions.innerHTML = ''; // Clear previous suggestions
      for (const product of data) {
        const option = document.createElement('option');
        option.value = product.title; // Use title for display
        productSuggestions.appendChild(option);
      }
    } else {
      productSuggestions.innerHTML = ''; // Clear suggestions if less than 3 chars
    }
  }

// Event listener for product name input changes
productNameInput.addEventListener('input', (event) => {
    fetchProductSuggestions(event.target.value);
  });


// Function to add a product to the cart
function addToCart(productName, quantity) {
  const existingProduct = cart.find(item => item.name === productName);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.push({ name: productName, quantity });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  refreshCart();
}

// Function to modify the quantity of a product
function modifyQuantity(index, newQuantity) {
  cart[index].quantity = newQuantity;
  localStorage.setItem('cart', JSON.stringify(cart));
  refreshCart();
}

// Function to delete a product from the cart
function deleteProduct(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  refreshCart();
}

// Function to refresh the cart section
function refreshCart() {
  cartSection.innerHTML = '';
  for (let i = 0; i < cart.length; i++) {
    const cartItem = cartItemTemplate.content.cloneNode(true);
    cartItem.querySelector('.product-image').src = cart[i].image;
    cartItem.querySelector('.product-name').textContent = cart[i].name;
    cartItem.querySelector('.product-description').textContent = cart[i].description;
    cartItem.querySelector('.quantity').textContent = cart[i].quantity;
    cartItem.querySelector('.modify-quantity').addEventListener('click', () => {
      const newQuantity = prompt('Introdu noua cantitate:', cart[i].quantity);
      if (newQuantity !== null && newQuantity > 0) {
        modifyQuantity(i, parseInt(newQuantity));
      }
    });
    cartItem.querySelector('.delete-product').addEventListener('click', () => {
      deleteProduct(i);
    });
    cartSection.appendChild(cartItem);
  }
}

// Event listener for the form submission
productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const productName = document.getElementById('product-name').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  if (productName && quantity > 0) {
    addToCart(productName, quantity);
  }
});

// Initial cart refresh
refreshCart();