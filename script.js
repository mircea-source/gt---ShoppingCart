// Get DOM elements
const productForm = document.getElementById('product-form');
const productNameInput = document.getElementById('product-name');
const productSuggestions = document.getElementById('product-suggestions');
const cartSection = document.getElementById('cart-section');
const cartItemTemplate = document.getElementById('cart-item-template');

// Load cart data from local storage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Optimize fetchProductSuggestions function
async function fetchProductSuggestions(searchTerm) {
  productSuggestions.innerHTML = ''; // Use innerHTML for better performance
  if (searchTerm.length < 3) return;

  try {
    const response = await fetch(`https://api.escuelajs.co/api/v1/products?title=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();

    if (data.length > 0) {
      const fragment = document.createDocumentFragment();
      data.forEach(product => {
        const option = document.createElement('option');
        option.value = product.title;
        fragment.appendChild(option);
      });
      productSuggestions.appendChild(fragment);
    } else {
      productSuggestions.innerHTML = 'Nu sunt produse cu această denumire.';
    }
  } catch (error) {
    console.error('Error fetching product suggestions:', error);
    productSuggestions.innerHTML = 'A apărut o eroare la încărcarea sugestiilor.';
  }
}

// Limit the frequency of function calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

productNameInput.addEventListener('input', debounce(event => {
  fetchProductSuggestions(event.target.value);
}, 300));

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

// Optimize refreshCart function
function refreshCart() {
  const fragment = document.createDocumentFragment();
  cart.forEach((item, index) => {
    const cartItem = cartItemTemplate.content.cloneNode(true);
    cartItem.querySelector('.product-name').textContent = item.name;
    cartItem.querySelector('.quantity').textContent = item.quantity;
    
    cartItem.querySelector('.modify-quantity').addEventListener('click', () => {
      const newQuantity = prompt('Introdu noua cantitate:', item.quantity);
      if (newQuantity !== null && newQuantity > 0) {
        modifyQuantity(index, parseInt(newQuantity, 10));
      }
    });
    
    cartItem.querySelector('.delete-product').addEventListener('click', () => {
      deleteProduct(index);
    });
    
    fragment.appendChild(cartItem);
  });
  
  cartSection.innerHTML = '';
  cartSection.appendChild(fragment);
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