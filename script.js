
document.addEventListener('DOMContentLoaded', function () {

    // Polyfill for older browsers (NodeList.forEach)
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }

    var gallery = document.querySelector('.gallery');
    var galleryItems = gallery ? Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item')) : [];
    var categoryLinks = document.querySelectorAll('.category-link');
    var searchBar = document.querySelector('.search-bar');
    var noItemsFound = document.querySelector('.no-items-found');
    var cartImg = document.querySelector('.moving-cart');
    var orderBtn = document.querySelector('.button');

    var cartItems = [];
    var total = 0;
    var restaurantNames = [];

    function shuffleGallery() {
        if (!gallery || galleryItems.length === 0) return;
        for (var i = galleryItems.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = galleryItems[i];
            galleryItems[i] = galleryItems[j];
            galleryItems[j] = temp;
        }
        galleryItems.forEach(function (item) {
            gallery.appendChild(item);
        });
    }

    shuffleGallery(); // Shuffle early

    // Category filtering
    categoryLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            categoryLinks.forEach(function (l) { l.classList.remove('active'); });
            this.classList.add('active');
            var selectedCategory = this.getAttribute('data-category');
            galleryItems.forEach(function (item) {
                var itemCategory = item.getAttribute('data-category') || '';
                var show = selectedCategory === 'All' || itemCategory.split(' ').indexOf(selectedCategory) !== -1;
                item.style.display = show ? 'block' : 'none';
            });
        });
    });

    // Search bar filtering
    if (searchBar) {
        searchBar.addEventListener('input', function () {
            var query = this.value.toLowerCase().trim();
            var words = query.split(/\s+/);
            var visibleCount = 0;

            galleryItems.forEach(function (item) {
                var name = (item.querySelector('.image-name-box') || {}).textContent || '';
                var rest = (item.querySelector('.item-info span') || {}).textContent || '';
                var syns = (item.querySelector('.synonyms') || {}).textContent || '';
                var combined = (name + ' ' + rest + ' ' + syns).toLowerCase();
                var matches = words.every(function (w) { return combined.indexOf(w) !== -1; });
                item.style.display = matches ? 'block' : 'none';
                if (matches) visibleCount++;
            });

            noItemsFound.style.display = visibleCount === 0 ? 'block' : 'none';

            // Reset category highlight
            categoryLinks.forEach(function (link) { link.classList.remove('active'); });
            var allLink = document.querySelector('.category-link[data-category="All"]');
            if (allLink) allLink.classList.add('active');
        });
    }

    // Info toggle buttons
    var infoButtons = document.querySelectorAll('.more-info');
    infoButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var info = this.closest('.gallery-item').querySelector('.info-container');
            if (info) {
                info.style.display = (info.style.display === 'block') ? 'none' : 'block';
            }
        });
    });

    // Add to cart
    var addToCartBtns = document.querySelectorAll('.add-to-cart');
    var orderedSpan = document.querySelector('.order-info p:nth-child(1) span');
    var fromSpan = document.querySelector('.order-info p:nth-child(2) span');
    var totalSpan = document.querySelector('.order-info p:nth-child(3) span');

    function updateCartUI() {
        var ordered = [];
        var froms = [];

        cartItems.forEach(function (item) {
            ordered.push(item.quantity > 1 ? item.itemName + ' *' + item.quantity : item.itemName);
            froms.push(item.restaurantName);
        });

        total = cartItems.reduce(function (sum, item) {
            return sum + item.priceAmount * item.quantity;
        }, 0);

        if (orderedSpan) orderedSpan.textContent = ordered.join(', ');
        if (fromSpan) fromSpan.textContent = Array.from(new Set(froms)).join(', ');
        if (totalSpan) totalSpan.textContent = total.toLocaleString();

        // Session storage
        sessionStorage.setItem('cartItems', ordered.join(', '));
        sessionStorage.setItem('totalAmount', total.toLocaleString());
        sessionStorage.setItem('from', froms.join(', '));
    }

    function createRemoveBtn(addBtn, itemName, restaurantName, galleryItem) {
        var removeBtn = document.createElement('button');
        removeBtn.textContent = '-';
        removeBtn.className = 'remove-from-cart';
        removeBtn.style.cssText = 'margin-left:2px;background:#610000;color:white;padding:0 4px;cursor:pointer;';
        removeBtn.addEventListener('click', function () {
            for (var i = 0; i < cartItems.length; i++) {
                var item = cartItems[i];
                if (item.itemName === itemName && item.restaurantName === restaurantName) {
                    item.quantity--;
                    if (item.quantity <= 0) {
                        cartItems.splice(i, 1);
                        removeBtn.parentElement.removeChild(removeBtn);
                    }
                    break;
                }
            }
            updateCartUI();
        });
        addBtn.parentElement.appendChild(removeBtn);
    }

    addToCartBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = this.closest('.gallery-item');
            var itemName = (item.querySelector('.image-name-box') || {}).textContent;
            var restName = (item.querySelector('.item-info span') || {}).textContent;
            var priceText = (item.querySelector('.info-container pre') || {}).textContent;
            var price = parseInt((priceText.match(/Price:\s*(\d+(?:,\d{3})*)/) || [])[1].replace(',', '') || 0, 10);

            var found = false;
            for (var i = 0; i < cartItems.length; i++) {
                if (cartItems[i].itemName === itemName && cartItems[i].restaurantName === restName) {
                    cartItems[i].quantity++;
                    found = true;
                    break;
                }
            }

            if (!found) {
                cartItems.push({ itemName: itemName, restaurantName: restName, priceAmount: price, quantity: 1 });
                createRemoveBtn(this, itemName, restName, item);
            }

            updateCartUI();
        });
    });

    // Moving cart animation
    if (cartImg) {
        setTimeout(function () {
            cartImg.style.left = '9px';
            setTimeout(function () {
                cartImg.style.left = 'calc(10% + 100px)';
            }, 1500);
        }, 500);
    }

    // Final order button click
    if (orderBtn) {
        orderBtn.addEventListener('click', function () {
            // store user textarea input
            var inputs = cartItems.map(function (cartItem) {
                var match = Array.prototype.find.call(document.querySelectorAll('.gallery-item'), function (el) {
                    return (el.querySelector('.image-name-box') || {}).textContent === cartItem.itemName &&
                           (el.querySelector('.item-info span') || {}).textContent === cartItem.restaurantName;
                });
                return match ? (match.querySelector('.tellchef') || {}).value.trim() : '';
            });
            sessionStorage.setItem('userInputs', inputs.join(', '));
            window.location.href = 'form.html';
        });
    }

    // Restaurant filter
    var restLinks = document.querySelectorAll('.restaurant-name, .item-info');
    restLinks.forEach(function (el) {
        el.addEventListener('click', function () {
            var rest = this.closest('.gallery-item').querySelector('.item-info span').textContent;
            galleryItems.forEach(function (item) {
                item.style.display = (item.querySelector('.item-info span').textContent === rest) ? 'block' : 'none';
            });

            categoryLinks.forEach(function (link) { link.classList.remove('active'); });
            var allLink = document.querySelector('.category-link[data-category="All"]');
            if (allLink) allLink.classList.add('active');
        });
    });
});

