// script.js
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

    // ---------- Category filtering ----------
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

    // ---------- Search bar ----------
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

            if (noItemsFound) noItemsFound.style.display = visibleCount === 0 ? 'block' : 'none';

            // Reset category highlight
            categoryLinks.forEach(function (link) { link.classList.remove('active'); });
            var allLink = document.querySelector('.category-link[data-category="All"]');
            if (allLink) allLink.classList.add('active');
        });
    }

    // ---------- Info toggle ----------
    var infoButtons = document.querySelectorAll('.more-info');
    infoButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var info = this.closest('.gallery-item').querySelector('.info-container');
            if (info) {
                info.style.display = (info.style.display === 'block') ? 'none' : 'block';
            }
        });
    });

    // ---------- Cart logic ----------
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
            return sum + (item.priceAmount || 0) * item.quantity;
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
                        // remove button safely
                        if (removeBtn.parentElement) removeBtn.parentElement.removeChild(removeBtn);
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
            var priceText = (item.querySelector('.info-container pre') || {}).textContent || '';
            var priceMatch = priceText.match(/Price:\s*([\d,]+)/i);
            var price = 0;
            if (priceMatch && priceMatch[1]) {
                price = parseInt(priceMatch[1].replace(/,/g, ''), 10) || 0;
            }

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

    // ---------- Moving cart animation ----------
    if (cartImg) {
        setTimeout(function () {
            cartImg.style.left = '100px';
            setTimeout(function () {
                cartImg.style.left = 'calc(10% + 10px)';
            }, 3500);
        }, 1000);
    }

    // ---------- Final order ----------
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

    // ---------- Restaurant filter ----------
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

    // ---------- Category scroll buttons (top categories bar) ----------
    (function initCategoryScroller() {
        const prevBtn = document.querySelector('.cat-btn.prev');
        const nextBtn = document.querySelector('.cat-btn.next');
        const categoriesContainer = document.querySelector('.categories');
        const categoryLinksArr = Array.from(document.querySelectorAll('.category-link'));
        if (!categoriesContainer) return;
        if (categoryLinksArr.length === 0) return;

        // Width of one category (approx)
        let categoryWidth = categoryLinksArr[0].offsetWidth + 10; // margin guess

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                categoriesContainer.scrollBy({ left: -categoryWidth, behavior: 'smooth' });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                categoriesContainer.scrollBy({ left: categoryWidth, behavior: 'smooth' });
            });
        }

        // Keep your existing category click logic
        categoryLinksArr.forEach(link => {
            link.addEventListener('click', function() {
                categoryLinksArr.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const selectedCategory = this.getAttribute('data-category');

                galleryItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category') || '';
                    const show = selectedCategory === 'All' || itemCategory.split(' ').indexOf(selectedCategory) !== -1;
                    item.style.display = show ? 'block' : 'none';
                });
            });
        });

        // Swipe support for touchscreens
        let isDragging = false;
        let startX;
        let scrollLeft;

        categoriesContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].pageX - categoriesContainer.offsetLeft;
            scrollLeft = categoriesContainer.scrollLeft;
        });

        categoriesContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const x = e.touches[0].pageX - categoriesContainer.offsetLeft;
            const walk = (startX - x); // scroll-fastness
            categoriesContainer.scrollLeft = scrollLeft + walk;
        });

        categoriesContainer.addEventListener('touchend', () => {
            isDragging = false;
        });
    })();
    // ---------- NEW (fixed): Auto-generate tabs for each .info-container ----------
    (function initInfoTabs() {
        function el(tag, cls, html) {
            var e = document.createElement(tag);
            if (cls) e.className = cls;
            if (html !== undefined) e.innerHTML = html;
            return e;
        }

        var infos = document.querySelectorAll('.info-container');
        infos.forEach(function (info) {
            var pre = info.querySelector('pre');
            if (!pre) return;

            // Find spans that represent categories (your markup uses inline style "color:brown")
            var categorySpans = pre.querySelectorAll('span[style*="color:brown"], span[style*="color: brown"]');
            if (!categorySpans || categorySpans.length === 0) {
                // fallback: check all spans and match style attribute text
                var allSpans = pre.querySelectorAll('span');
                categorySpans = Array.prototype.filter.call(allSpans, function (s) {
                    return (s.getAttribute('style') || '').toLowerCase().indexOf('color:brown') !== -1;
                });
            }
            if (!categorySpans || categorySpans.length === 0) return;

            // Create tabs UI
            var tabsWrapper = el('div', 'info-tabs-wrapper');
            var leftBtn = el('button', 'info-tab-scroll-btn left', '&lt;');
            var rightBtn = el('button', 'info-tab-scroll-btn right', '&gt;');
            var tabsContainer = el('div', 'info-tabs');

            // Insert wrapper before the first child so tabs are top-most inside info
            var firstChild = info.firstElementChild;
            if (firstChild) info.insertBefore(tabsWrapper, firstChild);
            else info.appendChild(tabsWrapper);

            tabsWrapper.appendChild(leftBtn);
            tabsWrapper.appendChild(tabsContainer);
            tabsWrapper.appendChild(rightBtn);

            // After inserting, compute tabsWrapper height (needed for offset calculations)
            // Use getBoundingClientRect later when needed to include dynamic sizes

            // Create tabs
            Array.prototype.forEach.call(categorySpans, function (span, idx) {
                var name = span.textContent.trim() || ('Category ' + (idx + 1));
                var tab = el('button', 'info-tab', name);
                tab._targetSpan = span;
                tab._index = idx;

                tab.addEventListener('click', function (ev) {
                    ev.preventDefault();

                    // ensure info is visible (if it's hidden, make it visible)
                    if (getComputedStyle(info).display === 'none') {
                        info.style.display = 'block';
                    }

                    var target = this._targetSpan;
                    if (!target) return;

                    // compute offsets using bounding client rects (robust)
                    var infoRect = info.getBoundingClientRect();
                    var targetRect = target.getBoundingClientRect();
                    var tabsRect = tabsWrapper.getBoundingClientRect();

                    // If sticky control exists, include its height (because it will cover top of content)
                    var sticky = info.querySelector('.sticky-top-controls');
                    var stickyHeight = sticky ? sticky.getBoundingClientRect().height : 0;

                    // We want to scroll the info element so that target is visible below the tabsWrapper + sticky
                    // compute desired top relative to info.scrollTop
                    var delta = targetRect.top - infoRect.top;
                    var desiredScrollTop = info.scrollTop + delta - tabsRect.height - stickyHeight - 8; // 8px padding

                    // clamp desiredScrollTop
                    if (desiredScrollTop < 0) desiredScrollTop = 0;
                    info.scrollTo({ top: desiredScrollTop, behavior: 'smooth' });

                    // mark tab active
                    var siblings = tabsContainer.querySelectorAll('.info-tab');
                    siblings.forEach(function (s) { s.classList.remove('active'); });
                    tab.classList.add('active');

                    // center the tab in the tabs container (smooth)
                    // compute left offset to center
                    var tabCenter = tab.offsetLeft + tab.offsetWidth / 2;
                    var scrollLeft = Math.max(0, tabCenter - tabsContainer.clientWidth / 2);
                    tabsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                });

                tabsContainer.appendChild(tab);
            });

            // Wire left/right buttons and drag/swipe for tabs container
            (function wireTabScroller() {
                var scrollStep = 130;
                leftBtn.addEventListener('click', function () {
                    tabsContainer.scrollBy({ left: -scrollStep, behavior: 'smooth' });
                });
                rightBtn.addEventListener('click', function () {
                    tabsContainer.scrollBy({ left: scrollStep, behavior: 'smooth' });
                });

                // Touch swipe
                var isDown = false, startX = 0, startScroll = 0;
                tabsContainer.addEventListener('touchstart', function (e) {
                    isDown = true;
                    startX = e.touches[0].pageX;
                    startScroll = tabsContainer.scrollLeft;
                }, { passive: true });
                tabsContainer.addEventListener('touchmove', function (e) {
                    if (!isDown) return;
                    var x = e.touches[0].pageX;
                    var walk = startX - x;
                    tabsContainer.scrollLeft = startScroll + walk;
                }, { passive: true });
                tabsContainer.addEventListener('touchend', function () { isDown = false; });

                // Mouse drag for desktop
                var dragging = false, mdX = 0, mdScroll = 0;
                tabsContainer.addEventListener('mousedown', function (e) {
                    dragging = true;
                    mdX = e.pageX;
                    mdScroll = tabsContainer.scrollLeft;
                    tabsContainer.classList.add('dragging');
                });
                window.addEventListener('mouseup', function () { dragging = false; tabsContainer.classList.remove('dragging'); });
                tabsContainer.addEventListener('mousemove', function (e) {
                    if (!dragging) return;
                    var walk = mdX - e.pageX;
                    tabsContainer.scrollLeft = mdScroll + walk;
                });
            })();

            // Scroll observer: highlight currently visible category - optimized to avoid feedback loops
            (function observeScrollHighlight() {
                var tabs = tabsContainer.querySelectorAll('.info-tab');
                if (!tabs || tabs.length === 0) return;

                // Build positions array using offsetTop which is stable for elements in same flow
                function buildPositions() {
                    return Array.prototype.map.call(tabs, function (t) {
                        var s = t._targetSpan;
                        var top = s ? s.offsetTop : 0; // offsetTop relative to pre
                        // but we want offset relative to the scrolling container (info)
                        // calculate cumulative offset from s up to info
                        var node = s;
                        var cumulative = 0;
                        while (node && node !== info) {
                            cumulative += node.offsetTop || 0;
                            node = node.offsetParent;
                        }
                        return { tab: t, span: s, top: cumulative };
                    });
                }

                var positions = buildPositions();
                // refresh positions when layout changes
                var resizeObserver = new ResizeObserver(function () {
                    positions = buildPositions();
                });
                resizeObserver.observe(info);
                // also refresh on images load within info
                Array.from(info.querySelectorAll('img')).forEach(function(img){
                    if (!img.complete) img.addEventListener('load', function(){ positions = buildPositions(); });
                });

                var lastActiveTab = null;
                var ticking = false;
                info.addEventListener('scroll', function () {
                    if (ticking) return;
                    window.requestAnimationFrame(function () {
                        var st = info.scrollTop;
                        // include top offsets from tabsWrapper and sticky controls
                        var tabsRect = tabsWrapper.getBoundingClientRect();
                        var sticky = info.querySelector('.sticky-top-controls');
                        var stickyHeight = sticky ? sticky.getBoundingClientRect().height : 0;
                        var offset = tabsRect.height + stickyHeight + 12;

                        // find the last position whose top <= st + offset
                        var active = positions[0] && positions[0].tab;
                        for (var i = positions.length - 1; i >= 0; i--) {
                            if (st + offset >= positions[i].top) {
                                active = positions[i].tab;
                                break;
                            }
                        }

                        if (active && active !== lastActiveTab) {
                            // update visual state only if changed (prevents repeated layout changes)
                            tabs.forEach(function (t) { t.classList.remove('active'); });
                            active.classList.add('active');
                            // center the new active tab (but only when it actually changed)
                            var tabCenter = active.offsetLeft + active.offsetWidth / 2;
                            var scrollLeft = Math.max(0, tabCenter - tabsContainer.clientWidth / 2);
                            tabsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });

                            lastActiveTab = active;
                        }
                        ticking = false;
                    });
                    ticking = true;
                });

            })();

            // Make first tab active initially
            var first = tabsContainer.querySelector('.info-tab');
            if (first) first.classList.add('active');
        });
    })();


        }); // end infos.forEach



        
document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();
  const form = e.target;

  fetch(form.action, {
    method: "POST",
    body: new FormData(form)
  }).then(response => {
    if (response.ok) {
      alert("✅ Message sent successfully!");
      window.location.href = "https://scoobdelivery.com";
    } else {
      alert("❌ There was an error sending your message. Please try again|report @ 0782887188.");
    }
  }).catch(() => {
    alert("⚠️ Network error. Please check your connection|message @ 0782887188.");
  });
});

    // ---------- Auto-Locate button loading ----------
    var autoLocateBtn = document.getElementById("autoLocate");

    if (autoLocateBtn) {
        autoLocateBtn.addEventListener("click", function () {

            // Start loading animation
            autoLocateBtn.classList.add("loading");
            autoLocateBtn.textContent = "Locating...";

            if (!navigator.geolocation) {
                alert("Geolocation is not supported on this device.");
                autoLocateBtn.classList.remove("loading");
                autoLocateBtn.textContent = "Auto-Locate";
                return;
            }

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;

                    var latInput = document.getElementById("latitude");
                    var lonInput = document.getElementById("longitude");

                    if (latInput) latInput.value = lat;
                    if (lonInput) lonInput.value = lon;

                    // If your map function exists, call it
                    if (typeof updateMapLocation === "function") {
                        updateMapLocation(lat, lon);
                    }

                    // Stop loading
                    autoLocateBtn.classList.remove("loading");
                    autoLocateBtn.textContent = "Auto-Locate";
                },

                function (error) {
                    alert("Failed to locate. Please allow GPS.");
                    
                    // Stop loading
                    autoLocateBtn.classList.remove("loading");
                    autoLocateBtn.textContent = "Auto-Locate";
                }
            );
        });
    }
