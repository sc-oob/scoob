document.addEventListener('DOMContentLoaded', () => {
    shuffleGallery(); // Shuffle before the content becomes visible
});



    // Shuffle the gallery items each time the page reloads
    function shuffleGallery() {
        const gallery = document.querySelector('.gallery');
        const items = Array.from(gallery.querySelectorAll('.gallery-item'));
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        items.forEach(item => gallery.appendChild(item)); // Re-append the shuffled items
    }

    

  
// Handle category selection and filter gallery items based on selected category
const categoryLinks = document.querySelectorAll('.category-link');
const galleryItems = document.querySelectorAll('.gallery-item');

categoryLinks.forEach(link => {
    link.addEventListener('click', function() {
        // Remove 'active' class from all category links
        categoryLinks.forEach(link => link.classList.remove('active'));

        // Add 'active' class to the clicked category link
        this.classList.add('active');

        // Get the selected category
        const selectedCategory = this.getAttribute('data-category');

        // Show and hide gallery items based on the selected category
        galleryItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');

            // Show items that match the selected category (checking if category exists in itemCategory)
            if (selectedCategory === 'All' || itemCategory.split(' ').includes(selectedCategory)) {
                item.style.display = 'block';  // Show item
            } else {
                item.style.display = 'none';  // Hide item
            }
        });
    });
});
 

  
 // Smooth scroll effect for header and categories
 let lastScrollTop = 0; // To store the last scroll position

window.addEventListener("scroll", function() {
    let header = document.querySelector("header");
    let categories = document.querySelector(".categories");
    let cart = document.querySelector(".cart");

    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // If scrolling down, hide the header and categories
    if (currentScroll > lastScrollTop) {
        header.style.top = "-70px"; // Adjust according to your header height
        categories.style.top = "-50px"; // Adjust according to your category bar height
        cart.style.height = "100vh"; // Full height of screen
        cart.style.top = "0";
        
    } else {
        // Scrolling up, show header and categories again
        header.style.top = "0";
        categories.style.top = "50px"; // Original position
        cart.style.height = "calc(100vh - 100px)"; // Adjust according to header + category height
        cart.style.top = "88px";
        
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll value
});

    // Toggle info on button click
    const infoButtons = document.querySelectorAll('.more-info');
    infoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const infoContainer = this.closest('.gallery-item').querySelector('.info-container');
            if (infoContainer.style.display === 'none' || infoContainer.style.display === '') {
                infoContainer.style.display = 'block'; // Show info
            } else {
                infoContainer.style.display = 'none'; // Hide info
            }
        });
    });

    // Animate cart image
    setTimeout(() => {
        const movingCart = document.querySelector('.moving-cart');
        movingCart.style.left = '9px'; // Move cart image to the right
    }, 500); // 0.5 seconds delay before animation starts



 // Search Functionality
 document.querySelector('.search-bar').addEventListener('input', function () {
    let searchQuery = this.value.toLowerCase().trim();
    let galleryItems = document.querySelectorAll('.gallery-item');
    let noItemsFoundMessage = document.querySelector('.no-items-found');
    let visibleItemsCount = 0;

    galleryItems.forEach(item => {
        let itemName = item.querySelector('.image-name-box').textContent.toLowerCase();
        let restaurantName = item.querySelector('.item-info span').textContent.toLowerCase();

        // Check for <pre class="synonyms"> if present
        let synonymBlock = item.querySelector('.synonyms');
        let synonymsText = synonymBlock ? synonymBlock.textContent.toLowerCase() : '';

        // Match against name, restaurant, or synonyms
        if (
            itemName.includes(searchQuery) ||
            restaurantName.includes(searchQuery) ||
            synonymsText.includes(searchQuery)
        ) {
            item.style.display = 'block';
            visibleItemsCount++;
        } else {
            item.style.display = 'none';
        }
    });

    if (visibleItemsCount === 0) {
        noItemsFoundMessage.style.display = 'block';
    } else {
        noItemsFoundMessage.style.display = 'none';
    }

    // Reset category highlighting to "All"
    document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.category-link[data-category="All"]').classList.add('active');
});






// Add to Cart functionality
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const orderedElement = document.querySelector('.order-info p:nth-child(1) span');
const fromElement = document.querySelector('.order-info p:nth-child(2) span');
const totalElement = document.querySelector('.order-info p:nth-child(3) span');

let cartItems = []; // To store cart items
let total = 0; // To track total price
let restaurantNames = []; // To track unique restaurant names

addToCartButtons.forEach(button => {
    button.addEventListener('click', function () {
        const galleryItem = this.closest('.gallery-item');
        const itemName = galleryItem.querySelector('.image-name-box').textContent;
        const restaurantName = galleryItem.querySelector('.item-info span').textContent;
        const priceText = galleryItem.querySelector('.info-container pre').textContent;
        const priceAmount = parseInt(priceText.match(/Price:\s*(\d+(?:,\d{3})*)/)[1].replace(',', ''));

        const existingItemIndex = cartItems.findIndex(item =>
            item.itemName === itemName && item.restaurantName === restaurantName
        );

        if (existingItemIndex !== -1) {
            cartItems[existingItemIndex].quantity++;
        } else {
            cartItems.push({ itemName, restaurantName, priceAmount, quantity: 1 });

            // 🔥 Inject "Remove from Cart" button after first addition
            createRemoveButton(this, itemName, restaurantName, galleryItem);
        }

        updateCartUI();
    


        // Update ordered items in the cart display (with quantity if > 1)
        orderedElement.textContent = cartItems.map(item => 
            item.quantity > 1 ? `${item.itemName} *${item.quantity}` : item.itemName
        ).join(', ');

        // Add unique restaurant name to "From"
        restaurantNames = [...new Set(cartItems.map(item => item.restaurantName))]; // Remove duplicates
        fromElement.textContent = restaurantNames.join(', ');

        // Update total
        total = cartItems.reduce((sum, item) => sum + (item.priceAmount * item.quantity), 0);
        totalElement.textContent = total.toLocaleString(); // Update the total in the parent cart display

        // Populate hidden form fields with updated cart info
        updateFormFields();
    });
});


function createRemoveButton(addBtn, itemName, restaurantName, galleryItem) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '-';
    removeBtn.classList.add('remove-from-cart');
    removeBtn.style.marginLeft = '2px';
    removeBtn.style.backgroundColor = '#610000';
    removeBtn.style.color = 'white';
    removeBtn.style.padding = '0px 4px';
    removeBtn.style.cursor = 'pointer';

    removeBtn.addEventListener('click', function () {
        const existingItemIndex = cartItems.findIndex(item =>
            item.itemName === itemName && item.restaurantName === restaurantName
        );

        if (existingItemIndex !== -1) {
            cartItems[existingItemIndex].quantity--;

            if (cartItems[existingItemIndex].quantity <= 0) {
                cartItems.splice(existingItemIndex, 1);
                removeBtn.remove();
            }

            updateCartUI();
        }
    });

    addBtn.parentElement.appendChild(removeBtn);
}



function updateCartUI() {
    // Update displayed cart items
    orderedElement.textContent = cartItems.map(item =>
        item.quantity > 1 ? `${item.itemName} *${item.quantity}` : item.itemName
    ).join(', ');

    // Unique restaurant names
    restaurantNames = [...new Set(cartItems.map(item => item.restaurantName))];
    fromElement.textContent = restaurantNames.join(', ');

    // Update total
    total = cartItems.reduce((sum, item) => sum + (item.priceAmount * item.quantity), 0);
    totalElement.textContent = total.toLocaleString();

    // Update hidden fields for form
    updateFormFields();

    // Update session storage for redirect
    const cartItemsText = cartItems.map(item =>
        item.quantity > 1 ? `${item.itemName} *${item.quantity}` : item.itemName
    ).join(', ');
    const userInputs = cartItems.map(item => item.userInput).join(', ');

    sessionStorage.setItem('cartItems', cartItemsText);
    sessionStorage.setItem('totalAmount', total.toLocaleString());
    const allRestaurantNames = cartItems.map(item => item.restaurantName);
    sessionStorage.setItem('from', allRestaurantNames.join(', '));
        sessionStorage.setItem('userInputs', userInputs);
}






document.querySelector('.button').addEventListener('click', function() {
    // Prepare cart data
    const cartItemsText = cartItems.map(item => 
        item.quantity > 1 ? `${item.itemName} *${item.quantity}` : item.itemName
    ).join(', ');

    // Store the cart data and total
    sessionStorage.setItem('cartItems', cartItemsText);
    sessionStorage.setItem('totalAmount', total.toLocaleString());
    sessionStorage.setItem('from', cartItems.map(item => item.restaurantName).join('\n'));

    // Now gather textarea input for items in cart
    const userInputs = cartItems.map(cartItem => {
        // Find the gallery-item that matches this item name and restaurant
        const match = Array.from(document.querySelectorAll('.gallery-item')).find(item => {
            const name = item.querySelector('.image-name-box').textContent;
            const restaurant = item.querySelector('.item-info span').textContent;
            return cartItem.itemName === name && cartItem.restaurantName === restaurant;
        });

        // If found, get the tellchef input
        if (match) {
            return match.querySelector('.tellchef').value.trim();
        }
        return '';
    });

    sessionStorage.setItem('userInputs', userInputs.join(', '));


// Update form hidden fields
function updateFormFields() {
    const formattedCartItems = cartItems.map(item => {
        const totalForItem = item.priceAmount * item.quantity;
        return `${item.itemName}\n- Price: $${item.priceAmount.toLocaleString()}\n- Quantity: x${item.quantity}\n- Total: $${totalForItem.toLocaleString()}\n- From: ${item.restaurantName}\n`;
    }).join('\n');

    document.getElementById('cartItemsInput').value = formattedCartItems;
    document.getElementById('totalInput').value = total.toLocaleString();

    // Include full restaurant list with duplicates
    const allRestaurants = cartItems.map(item => item.restaurantName).join('\n');
    document.getElementById('fromInput').value = allRestaurants;

    // Save to sessionStorage for the form page
    sessionStorage.setItem('cartItems', formattedCartItems);
    sessionStorage.setItem('totalAmount', total.toLocaleString());
    sessionStorage.setItem('from', allRestaurants);
}


    // Redirect to form page
    window.location.href = 'form.html';
});


    // Call the updateFormFields function to make sure the form is populated correctly before submission
    updateFormFields();
         
        // Final movement of cart image
        document.querySelector('.moving-cart').style.left = 'calc(10% + 100px)';


    
// Handle restaurant filtering when clicking restaurant name or image
const restaurantLinks = document.querySelectorAll('.restaurant-name, .item-info'); // Select restaurant names and gallery images


// Adding event listeners for restaurant name or image click
restaurantLinks.forEach(link => {
    link.addEventListener('click', function() {
        // Get the restaurant name
        const restaurantName = this.closest('.gallery-item').querySelector('.item-info span').textContent;

        // Filter gallery items based on selected restaurant
        galleryItems.forEach(item => {
            const itemRestaurantName = item.querySelector('.item-info span').textContent;

            // Show only items that belong to the selected restaurant
            if (itemRestaurantName === restaurantName) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Highlight the active restaurant and clear search results
        document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
        document.querySelector('.category-link[data-category="All"]').classList.add('active');
    });
});

