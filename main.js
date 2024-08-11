document.addEventListener('DOMContentLoaded', function () {
    const apiURL = 'https://fakestoreapi.com';
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function sanitizeHTML(str) {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = str;
        return tempDiv.innerHTML;
    }

    function showError(message) {
        alert(message || 'An error occurred. Please try again.');
    }

    function fetchFeaturedProducts() {
        fetch(`${apiURL}/products?limit=4`)
            .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch products'))
            .then(data => {
                const featuredProductsContainer = document.getElementById('featured-products');
                let content = '';
                data.forEach(product => {
                    content += `
                        <div class="product-item">
                            <img src="${sanitizeHTML(product.image)}" alt="${sanitizeHTML(product.title)}">
                            <h3>${sanitizeHTML(product.title)}</h3>
                            <p>$${product.price}</p>
                            <a href="product.html?id=${product.id}" class="btn">View Product</a>
                        </div>
                    `;
                });
                featuredProductsContainer.innerHTML = content;
            })
            .catch(error => {
                console.error('Error fetching featured products:', error);
                showError('Could not load featured products.');
            });
    }

    function fetchProductDetails(productId) {
        if (!productId) {
            showError('Invalid product ID.');
            return;
        }

        fetch(`${apiURL}/products/${productId}`)
            .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch product details'))
            .then(product => {
                const productGallery = document.getElementById('product-gallery');
                const productDetails = document.getElementById('product-details');

                productGallery.innerHTML = `
                    <img src="${sanitizeHTML(product.image)}" alt="${sanitizeHTML(product.title)}">
                `;
                productDetails.innerHTML = `
                    <h2>${sanitizeHTML(product.title)}</h2>
                    <p>${sanitizeHTML(product.description)}</p>
                    <p>$${product.price}</p>
                    <button class="btn" id="add-to-cart" data-id="${product.id}">Add to Cart</button>
                `;
                document.getElementById('add-to-cart').addEventListener('click', function () {
                    this.disabled = true;
                    addToCart(product.id);
                });
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                showError('Could not load product details.');
            });
    }

    function addToCart(productId) {
        fetch(`${apiURL}/products/${productId}`)
            .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch product'))
            .then(product => {
                const cartItem = cart.find(item => item.id === productId);
                if (cartItem) {
                    cartItem.quantity++;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                alert(`${sanitizeHTML(product.title)} has been added to your cart.`);
                document.getElementById('add-to-cart').disabled = false;
            })
            .catch(error => {
                console.error('Error adding product to cart:', error);
                showError('Could not add product to cart.');
                document.getElementById('add-to-cart').disabled = false;
            });
    }

    function updateCartCount() {
        document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    function displayCart() {
        const cartSummary = document.getElementById('cart-summary');
        if (cart.length === 0) {
            cartSummary.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            let content = '';
            cart.forEach(item => {
                content += `
                    <div class="cart-item">
                        <img src="${sanitizeHTML(item.image)}" alt="${sanitizeHTML(item.title)}">
                        <div>
                            <h3>${sanitizeHTML(item.title)}</h3>
                            <p>$${item.price} x ${item.quantity}</p>
                            <button class="remove-btn" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `;
            });
            cartSummary.innerHTML = content;

            const removeButtons = document.querySelectorAll('.remove-btn');
            removeButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const productId = parseInt(this.getAttribute('data-id'));
                    removeFromCart(productId);
                });
            });
        }

        updateCartTotals();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
        updateCartCount();
    }

    function updateCartTotals() {
        const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `$${subtotal.toFixed(2)}`;
    }

    function displayOrderSummary() {
        const orderSummary = document.getElementById('order-summary');
        if (cart.length === 0) {
            orderSummary.innerHTML = '<p>Your cart is empty.</p>';
            document.getElementById('order-total').textContent = '$0.00';
            return;
        }

        let content = '';
        cart.forEach(item => {
            content += `
                <div class="order-item">
                    <p>${sanitizeHTML(item.title)} x ${item.quantity}</p>
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `;
        });
        orderSummary.innerHTML = content;
        document.getElementById('order-total').textContent = `$${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}`;
    }

    if (document.getElementById('featured-products')) {
        fetchFeaturedProducts();
    }

    if (document.getElementById('product-gallery')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        fetchProductDetails(productId);
    }

    if (document.getElementById('cart-summary')) {
        displayCart();
    }

    if (document.getElementById('order-summary')) {
        displayOrderSummary();
    }

    updateCartCount();

    window.addEventListener('storage', function () {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        displayCart();
        updateCartCount();
    });
});
