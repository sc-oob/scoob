

// Handle category selection and filter gallery items based on selected category
   const categoryLinks = document.querySelectorAll('.category-link');
    const galleryItems = document.querySelectorAll('.gallery-item'); document.querySelectorAll('.item-info');

    categoryLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove 'active' class from All links
            categoryLinks.forEach(link => link.classList.remove('active'));

            // Add 'active' class to the clicked category link
            this.classList.add('active');

            // Get the selected category
            const selectedCategory = this.getAttribute('data-category');

            // Show and hide gallery items based on the selected category
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');

                // Show items that match the selected category, hide others
                if (selectedCategory === 'All' || selectedCategory === itemCategory) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
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

    window.onload = () => {
        shuffleGallery(); // Shuffle content on page load
    };

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


 // Add to Cart functionality
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const orderedElement = document.querySelector('.order-info p:nth-child(1) span');
const fromElement = document.querySelector('.order-info p:nth-child(2) span');
const totalElement = document.querySelector('.order-info p:nth-child(3) span');

let cartItems = []; // To store cart items
let total = 0; // To track total price
let restaurantNames = []; // To track unique restaurant names

addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
        const galleryItem = this.closest('.gallery-item');
        const itemName = galleryItem.querySelector('.image-name-box').textContent;
        const restaurantName = galleryItem.querySelector('.item-info span').textContent;
        const priceText = galleryItem.querySelector('.info-container pre').textContent;
        const priceAmount = parseInt(priceText.match(/Price:\s*(\d+(?:,\d{3})*)/)[1].replace(',', ''));

        // Check if item is already in the cart
        const existingItemIndex = cartItems.findIndex(item => item.itemName === itemName && item.restaurantName === restaurantName);

        if (existingItemIndex !== -1) {
            // Item exists, increase quantity
            cartItems[existingItemIndex].quantity++;
        } else {
            // Add new item to cart
            cartItems.push({ itemName, restaurantName, priceAmount, quantity: 1 });
        }

        // Update ordered items in the cart display (with quantity if > 1)
        orderedElement.textContent = cartItems.map(item => 
            item.quantity > 1 ? `${item.itemName} *${item.quantity}` : item.itemName
        ).join(', ');

        // Add unique restaurant name to "From"
        restaurantNames = [...new Set(cartItems.map(item => item.restaurantName))]; // Remove duplicates
        fromElement.textContent = restaurantNames.join(', ');

        // Update total
        total = cartItems.reduce((sum, item) => sum + (item.priceAmount * item.quantity), 0);
        totalElement.textContent = total.toLocaleString();

        // Populate hidden form fields with updated cart info
        updateFormFields();
    });
});

   
   // Handle order button click to show the form page and update hidden fields
document.querySelector('.button').addEventListener('click', function() {
    // Show the form page
    document.getElementById('formPage').style.display = 'flex'; 

    // Recalculate map size when the form is displayed
    recalculateMapSize(); // This ensures the map loads properly in the form view

    // Call the updateFormFields function to make sure the form is populated correctly before submission
    updateFormFields();
         
        // Final movement of cart image
        document.querySelector('.moving-cart').style.left = 'calc(10% + 100px)';

// Update form hidden fields
function updateFormFields() {
    // Format each item with its name, quantity, and total price
    const formattedCartItems = cartItems.map(item => {
        return `${item.itemName} (x${item.quantity}) - Restaurant: ${item.restaurantName} - Price: $${(item.priceAmount * item.quantity).toFixed(2)}`;
    }).join('\n');

    // Prepare the cart items text to be used in the hidden input
    const cartItemsText = cartItems.map(item => 
        // If the quantity is greater than 1, append quantity to the item name
        item.quantity > 1 ? `${item.itemName} *${item.quantity}` : item.itemName
    ).join(', ');

    // Set the formatted cart items as the value of the hidden input
    document.getElementById('cartItemsInput').value = formattedCartItems;

    // Update the total amount in the hidden input
    document.getElementById('totalInput').value = total.toLocaleString();

    // Set the restaurant names (without duplicates) in the hidden input
    document.getElementById('fromInput').value = restaurantNames.join(', ');
}
});
    
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


 // Search Functionality
document.querySelector('.search-bar').addEventListener('input', function () {
    let searchQuery = this.value.toLowerCase().trim();
    let galleryItems = document.querySelectorAll('.gallery-item');
    let noItemsFoundMessage = document.querySelector('.no-items-found');
    let visibleItemsCount = 0;  // Counter for visible items

    galleryItems.forEach(item => {
        let itemName = item.querySelector('.image-name-box').textContent.toLowerCase();
        let restaurantName = item.querySelector('.item-info span').textContent.toLowerCase();  // Getting the restaurant name
        
        // Show only items that match the search query in either item name or restaurant name
        if (itemName.includes(searchQuery) || restaurantName.includes(searchQuery)) {
            item.style.display = 'block';
            visibleItemsCount++; // Increment count for each matching item
        } else {
            item.style.display = 'none';
        }
    });

    // If no items are visible, show the "No items found" message
    if (visibleItemsCount === 0) {
        noItemsFoundMessage.style.display = 'block';  // Show message
    } else {
        noItemsFoundMessage.style.display = 'none';  // Hide message if there are results
    }

    // Highlight "All" category when searching
    document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.category-link[data-category="All"]').classList.add('active');
});

//mapping

// Initialize the map
const map = L.map('map').setView([-3.3869, 36.6829], 13); // Coordinates for Arusha, Tanzania

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



// Function to ensure the map resizes correctly
function recalculateMapSize() {
    map.invalidateSize();
}

// When the user clicks on the map, add a marker at the clicked location
let marker;
map.on('click', function(e) {
    // Remove the previous marker
    if (marker) {
        map.removeLayer(marker);
    }

    // Add a new marker at the clicked location
    marker = L.marker(e.latlng).addTo(map);

    
    // Set the coordinates in the input field
    document.getElementById('coordinates').value = `Latitude: ${e.latlng.lat}, Longitude: ${e.latlng.lng}`;
});

// Auto-locate the user and center the map on their location
document.getElementById('autoLocate').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Center the map to the user's location
            map.setView([lat, lon], 13);

            // Optionally, place a marker at the user's location
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker([lat, lon]).addTo(map);

            // Set the coordinates in the input field
            document.getElementById('coordinates').value = `Latitude: ${lat}, Longitude: ${lon}`;
        }, function() {
            alert('Geolocation failed or permission denied.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// Handle form display and recalculate map size
document.querySelector('.button').addEventListener('click', function() {
});


// Initially recalculate map size when the page loads
window.addEventListener('load', function() {
    recalculateMapSize(); // Ensure map resizes properly when the page first loads
});






