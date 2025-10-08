document.addEventListener('DOMContentLoaded', function () {

    // Polyfill NodeList.forEach for older browsers
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

    var cartItems = []; // each: { itemName, restaurantName, priceAmount, quantity, notes: [] }
    var total = 0;

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
    shuffleGallery();

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

    /* === UPDATED SEARCH WITH GALLERY + MENU === */
    function wordsMatchAll(words, text) {
        if (!text) return false;
        text = text.toLowerCase();
        return words.every(function (w) { return text.indexOf(w) !== -1; });
    }

    if (searchBar) {
        searchBar.addEventListener('input', function () {
            var query = this.value.toLowerCase().trim();
            var words = query.split(/\s+/).filter(Boolean);
            var visibleCount = 0;

            // ✅ Close all open menus before showing new search results
            document.querySelectorAll('.menu-container').forEach(function (container) {
                container.style.display = 'none';
            });
            document.querySelectorAll('.menu-toggle').forEach(function (btn) {
                btn.textContent = 'See Menu';
            });

            galleryItems.forEach(function (item) {
                var textParts = [];
                var nameBox = item.querySelector('.image-name-box');
                var restBox = item.querySelector('.item-info span');
                var synsBox = item.querySelector('.synonyms');

                if (nameBox) textParts.push(nameBox.textContent);
                if (restBox) textParts.push(restBox.textContent);
                if (synsBox) textParts.push(synsBox.textContent);

                var itemMatches = false;
                var anyEntryMatches = false;

                // Reset highlights
                var menuEntries = item.querySelectorAll('.menu-entry');
                menuEntries.forEach(function (entry) {
                    entry.classList.remove('highlight');
                });

                // Match against gallery text
                var combined = textParts.join(' ').toLowerCase();
                if (words.length > 0 && wordsMatchAll(words, combined)) {
                    itemMatches = true;
                }

                // Match against menu entries
                menuEntries.forEach(function (entry) {
                    var name = (entry.querySelector('.menu-item-name') || {}).textContent || '';
                    var price = (entry.querySelector('.menu-price') || {}).textContent || '';
                    var desc = entry.dataset.description || (entry.querySelector('.menu-description')?.textContent || '');
                    var entrySyn = entry.dataset.synonyms || '';
                    var descSyn = entry.dataset.descriptionSynonyms || '';
                    var entryRestaurant = entry.dataset.restaurant || (restBox ? restBox.textContent : '');

                    var entryText = [name, price, desc, entrySyn, descSyn, entryRestaurant].join(' ').toLowerCase();

                    var entryMatches = words.length > 0 && wordsMatchAll(words, entryText);
                    if (entryMatches) {
                        entry.classList.add('highlight'); // highlight only menu entries
                        anyEntryMatches = true;
                    }
                });

                // Decide if gallery item should be shown
                var show = (words.length === 0) || itemMatches || anyEntryMatches;
                item.style.display = show ? 'block' : 'none';
                if (show) visibleCount++;
            });

            // Toggle "no items found"
            noItemsFound.style.display = visibleCount === 0 ? 'block' : 'none';

            // Reset category selection
            categoryLinks.forEach(function (link) { link.classList.remove('active'); });
            var allLink = document.querySelector('.category-link[data-category="All"]');
            if (allLink) allLink.classList.add('active');
        });
    }

    // Info toggle
    var infoButtons = document.querySelectorAll('.more-info');
    infoButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var info = this.closest('.gallery-item').querySelector('.info-container');
            if (info) {
                info.style.display = (info.style.display === 'block') ? 'none' : 'block';
            }
        });
    });

    // Utility: parse price string like "13,000" or "13000"
    function parsePrice(priceText) {
        if (!priceText) return 0;
        var cleaned = priceText.replace(/[^\d.,]/g, '').replace(/,/g, '');
        var parsed = parseInt(cleaned, 10);
        return isNaN(parsed) ? 0 : parsed;
    }

    // Cart UI
    var orderedSpan = document.querySelector('.order-info p:nth-child(1) span');
    var fromSpan = document.querySelector('.order-info p:nth-child(2) span');
    var totalSpan = document.querySelector('.order-info p:nth-child(3) span');

    function updateCartUI() {
        var ordered = [];
        var froms = [];
        var notesList = [];
        total = cartItems.reduce(function (sum, item) {
            return sum + (item.priceAmount * item.quantity);
        }, 0);

        cartItems.forEach(function (item) {
            ordered.push(item.quantity > 1 ? item.itemName + ' *' + item.quantity : item.itemName);
            froms.push(item.restaurantName);
            var joinedNotes = (item.notes && item.notes.length) ? item.notes.join(' | ') : '';
            notesList.push(joinedNotes);
        });

        if (orderedSpan) orderedSpan.textContent = ordered.join(', ');
        if (fromSpan) fromSpan.textContent = Array.from(new Set(froms)).join(', ');
        if (totalSpan) totalSpan.textContent = total.toLocaleString();

        sessionStorage.setItem('cartItems', ordered.join(', '));
        sessionStorage.setItem('totalAmount', total.toLocaleString());
        sessionStorage.setItem('from', froms.join(', '));
        sessionStorage.setItem('userInputs', notesList.join('||'));
    }

    function createRemoveBtn(addBtn, key) {
        if (addBtn.parentElement.querySelector('.remove-from-cart')) return;
        var removeBtn = document.createElement('button');
        removeBtn.textContent = '-';
        removeBtn.className = 'remove-from-cart';
        removeBtn.style.cssText = 'margin-left:2px;background:#610000;color:white;padding:0 6px;cursor:pointer;';
        removeBtn.addEventListener('click', function () {
            for (var i = 0; i < cartItems.length; i++) {
                var item = cartItems[i];
                var compound = item.itemName + '||' + item.restaurantName;
                if (compound === key) {
                    item.quantity--;
                    if (item.notes && item.notes.length) item.notes.pop();
                    if (item.quantity <= 0) {
                        cartItems.splice(i, 1);
                        if (removeBtn.parentElement) removeBtn.parentElement.removeChild(removeBtn);
                    }
                    break;
                }
            }
            updateCartUI();
        });
        addBtn.parentElement.appendChild(removeBtn);
    }

    // Gallery click delegation
    if (gallery) {
        gallery.addEventListener('click', function (e) {
            var target = e.target;

            if (target.classList.contains('menu-tab')) {
                var tab = target.getAttribute('data-tab');
                var galleryItem = target.closest('.gallery-item');
                if (!galleryItem) return;
                var tabs = galleryItem.querySelectorAll('.menu-tab');
                tabs.forEach(function (t) { t.classList.remove('active'); });
                target.classList.add('active');
                var sections = galleryItem.querySelectorAll('.menu-section');
                sections.forEach(function (sec) {
                    sec.style.display = (sec.getAttribute('data-tab') === tab) ? 'block' : 'none';
                });
                return;
            }

            if (target.classList.contains('add-to-cart')) {
                var addBtn = target;
                var galleryItem = addBtn.closest('.gallery-item');
                if (!galleryItem) return;
                var restName = (galleryItem.querySelector('.item-info span') || {}).textContent || '';
                var menuEntry = addBtn.closest('.menu-entry');
                var itemName = '';
                var price = 0;
                var note = '';

                if (menuEntry) {
                    itemName = (menuEntry.querySelector('.menu-item-name') || {}).textContent || '';
                    price = parsePrice((menuEntry.querySelector('.menu-price') || {}).textContent || '');
                    note = (menuEntry.querySelector('.tellchef') || {}).value.trim() || '';
                } else {
                    itemName = (galleryItem.querySelector('.image-name-box') || {}).textContent || '';
                    var priceText = (galleryItem.querySelector('.info-container pre') || {}).textContent || '';
                    var m = priceText.match(/Price:\s*([\d,]+)/);
                    price = m ? parsePrice(m[1]) : 0;
                    note = (galleryItem.querySelector('.tellchef') || {}).value.trim() || '';
                }

                if (!itemName) return;
                var compoundKey = itemName + '||' + restName;
                var found = false;
                for (var i = 0; i < cartItems.length; i++) {
                    if (cartItems[i].itemName === itemName && cartItems[i].restaurantName === restName) {
                        cartItems[i].quantity++;
                        if (note) cartItems[i].notes.push(note);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var notesArray = [];
                    if (note) notesArray.push(note);
                    cartItems.push({ itemName, restaurantName: restName, priceAmount: price, quantity: 1, notes: notesArray });
                    createRemoveBtn(addBtn, compoundKey);
                }
                updateCartUI();
                return;
            }
        });
    }

    // moving cart
    if (cartImg) {
        setTimeout(function () {
            cartImg.style.left = '100px';
            setTimeout(function () {
                cartImg.style.left = 'calc(10% + 10px)';
            }, 3500);
        }, 1000);
    }

    if (orderBtn) {
        orderBtn.addEventListener('click', function () {
            updateCartUI();
            window.location.href = 'form.html';
        });
    }

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

    (function restoreFromSession() {
        var cartItemsStored = sessionStorage.getItem('cartItems') || '';
        var totalStored = sessionStorage.getItem('totalAmount') || '';
        var fromStored = sessionStorage.getItem('from') || '';
        if (orderedSpan) orderedSpan.textContent = cartItemsStored;
        if (fromSpan) fromSpan.textContent = fromStored;
        if (totalSpan) totalSpan.textContent = totalStored;
    })();

});

/* === MENU TOGGLE WITH HIGHLIGHT SCROLL === */
document.querySelectorAll('.menu-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var galleryItem = btn.closest('.gallery-item');
        if (!galleryItem) return;
        var container = galleryItem.querySelector('.menu-container');
        if (!container) return;
        var isOpen = container.style.display !== 'none' && container.style.display !== '';
        if (isOpen) {
            container.style.display = 'none';
            btn.textContent = 'See Menu';
            return;
        }
        container.style.display = 'block';
        btn.textContent = 'Hide Menu';

        var firstHighlighted = galleryItem.querySelector('.menu-entry.highlight');
        if (firstHighlighted) {
            var section = firstHighlighted.closest('.menu-section');
            var tabName = section ? section.getAttribute('data-tab') : null;
            if (tabName) {
                var tabs = galleryItem.querySelectorAll('.menu-tab');
                tabs.forEach(function (t) {
                    if (t.getAttribute('data-tab') === tabName) t.classList.add('active');
                    else t.classList.remove('active');
                });
                var sections = galleryItem.querySelectorAll('.menu-section');
                sections.forEach(function (sec) {
                    sec.style.display = (sec.getAttribute('data-tab') === tabName) ? 'block' : 'none';
                });
            }
            setTimeout(function () {
                firstHighlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 80);
        }
    });
});
