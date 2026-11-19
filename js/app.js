/* =========================================================
   VSH TANK CLEANING
   CART + BOOKING + RAZORPAY
========================================================= */

const CART_KEY = "vsh_tank_cart";

/* =========================================================
   CART STORAGE
========================================================= */

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

/* =========================================================
   ADD TO CART
   Supports BOTH:

   addToCart("Overhead Tank Cleaning - 1000 Litres", 499)

   AND

   addToCart({
       name: "...",
       price: 499
   })
========================================================= */

function addToCart(item, price) {

    let name;
    let itemPrice;

    /* Old/current prices.html format */
    if (typeof item === "string") {
        name = item;
        itemPrice = Number(price);
    }

    /* Object format */
    else if (item && typeof item === "object") {
        name = item.name;
        itemPrice = Number(item.price);
    }

    if (!name || !itemPrice || itemPrice <= 0) {
        console.error("Invalid cart item:", item, price);
        return;
    }

    const cart = getCart();

    const existingItem = cart.find(
        product => product.name === name
    );

    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity || 0) + 1;

    } else {

        cart.push({
            name: name,
            price: itemPrice,
            quantity: 1
        });

    }

    saveCart(cart);

    updateCartCount();

    showCartMessage(
        `${name} added to cart`
    );

    /* Refresh cart if currently on cart page */
    if (document.getElementById("cart-root")) {
        renderCart();
    }
}

/* =========================================================
   REMOVE ITEM
========================================================= */

function removeFromCart(index) {

    const cart = getCart();

    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }

    cart.splice(index, 1);

    saveCart(cart);

    renderCart();
}

/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(index, change) {

    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    cart[index].quantity =
        Number(cart[index].quantity || 0) + change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);

    renderCart();
}

/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    const cart = getCart();

    let totalItems = 0;

    cart.forEach(item => {
        totalItems += Number(item.quantity || 0);
    });

    document
        .querySelectorAll(
            "#cart-count, .cart-count, [data-cart-count]"
        )
        .forEach(element => {
            element.textContent = totalItems;
        });
}

/* =========================================================
   DISCOUNT
========================================================= */

function getDiscountRate(totalItems) {

    if (totalItems >= 5) {
        return 0.15;
    }

    if (totalItems >= 3) {
        return 0.12;
    }

    if (totalItems >= 2) {
        return 0.10;
    }

    return 0;
}

/* =========================================================
   CALCULATE TOTALS
========================================================= */

function calculateTotals(
    paymentMethod = "after-service"
) {

    const cart = getCart();

    let subtotal = 0;
    let totalItems = 0;

    cart.forEach(item => {

        subtotal +=
            Number(item.price) *
            Number(item.quantity);

        totalItems +=
            Number(item.quantity);

    });

    const discountRate =
        getDiscountRate(totalItems);

    const quantityDiscount =
        subtotal * discountRate;

    let onlineDiscount = 0;

    if (
        paymentMethod === "online" &&
        subtotal - quantityDiscount > 0
    ) {

        onlineDiscount =
            (subtotal - quantityDiscount) * 0.05;

    }

    const total =
        subtotal -
        quantityDiscount -
        onlineDiscount;

    return {

        subtotal,

        quantityDiscount,

        onlineDiscount,

        total,

        totalItems,

        discountRate

    };
}

/* =========================================================
   MONEY FORMAT
========================================================= */

function formatMoney(amount) {

    return "₹" +
        Number(amount).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
}

/* =========================================================
   NOTIFICATION
========================================================= */

function showCartMessage(message) {

    let notification =
        document.getElementById(
            "cart-notification"
        );

    if (!notification) {

        notification =
            document.createElement("div");

        notification.id =
            "cart-notification";

        notification.style.position =
            "fixed";

        notification.style.top =
            "90px";

        notification.style.right =
            "20px";

        notification.style.background =
            "#16a34a";

        notification.style.color =
            "#fff";

        notification.style.padding =
            "14px 20px";

        notification.style.borderRadius =
            "12px";

        notification.style.fontWeight =
            "700";

        notification.style.zIndex =
            "99999";

        notification.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.2)";

        notification.style.transition =
            "opacity .3s ease";

        document.body.appendChild(
            notification
        );
    }

    notification.textContent =
        "✓ " + message;

    notification.style.opacity = "1";

    clearTimeout(
        window.cartNotificationTimer
    );

    window.cartNotificationTimer =
        setTimeout(() => {

            notification.style.opacity =
                "0";

        }, 2500);
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    if (
        text === undefined ||
        text === null
    ) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const cartRoot =
        document.getElementById(
            "cart-root"
        );

    if (!cartRoot) {
        return;
    }

    const cartItemsContainer =
        document.getElementById(
            "cart-items"
        );

    const emptyCart =
        document.getElementById(
            "empty-cart"
        );

    const checkoutSection =
        document.getElementById(
            "checkout-section"
        );

    const continueButton =
        document.getElementById(
            "continue-booking"
        );

    const cart =
        getCart();

    /* =========================
       EMPTY CART
    ========================= */

    if (cart.length === 0) {

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = "";
        }

        if (emptyCart) {
            emptyCart.style.display =
                "block";
        }

        if (checkoutSection) {
            checkoutSection.style.display =
                "none";
        }

        if (continueButton) {
            continueButton.style.display =
                "none";
        }

        updateCartCount();

        return;
    }

    /* =========================
       CART HAS ITEMS
    ========================= */

    if (emptyCart) {
        emptyCart.style.display =
            "none";
    }

    if (continueButton) {
        continueButton.style.display =
            "inline-flex";
    }

    let html = "";

    cart.forEach((item, index) => {

        const itemTotal =
            Number(item.price) *
            Number(item.quantity);

        html += `

        <div class="cart-item">

            <div class="cart-item-info">

                <h3>
                    ${escapeHTML(item.name)}
                </h3>

                <p>
                    ${formatMoney(item.price)}
                    each
                </p>

            </div>


            <div class="quantity-control">

                <button
                    type="button"
                    onclick="changeQuantity(${index}, -1)">
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    type="button"
                    onclick="changeQuantity(${index}, 1)">
                    +
                </button>

            </div>


            <div class="cart-item-total">

                ${formatMoney(itemTotal)}

            </div>


            <button
                type="button"
                class="remove-btn"
                onclick="removeFromCart(${index})">

                Remove

            </button>

        </div>

        `;
    });

    if (cartItemsContainer) {

        cartItemsContainer.innerHTML =
            html;

    }

    updateSummary();

    updateCartCount();
}

/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    const paymentInput =
        document.querySelector(
            'input[name="payment"]:checked'
        );

    const paymentMethod =
        paymentInput
            ? paymentInput.value
            : "after-service";

    const totals =
        calculateTotals(
            paymentMethod
        );

    const subtotalElement =
        document.getElementById(
            "summary-subtotal"
        );

    const discountElement =
        document.getElementById(
            "summary-discount"
        );

    const onlineDiscountRow =
        document.getElementById(
            "online-discount-row"
        );

    const onlineDiscountElement =
        document.getElementById(
            "summary-online-discount"
        );

    const totalElement =
        document.getElementById(
            "summary-total"
        );

    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(
                totals.subtotal
            );

    }

    if (discountElement) {

        if (
            totals.quantityDiscount > 0
        ) {

            discountElement.textContent =
                "-" +
                formatMoney(
                    totals.quantityDiscount
                ) +
                ` (${Math.round(
                    totals.discountRate * 100
                )}% bulk discount)`;

        } else {

            discountElement.textContent =
                "₹0";

        }
    }

    if (onlineDiscountRow) {

        onlineDiscountRow.style.display =
            paymentMethod === "online"
                ? "flex"
                : "none";

    }

    if (onlineDiscountElement) {

        onlineDiscountElement.textContent =
            "-" +
            formatMoney(
                totals.onlineDiscount
            );

    }

    if (totalElement) {

        totalElement.textContent =
            formatMoney(
                totals.total
            );

    }
}

/* =========================================================
   CONTINUE TO BOOKING
   IMPORTANT:
   DOES NOT CHANGE PAGE.
========================================================= */

function setupContinueBooking() {

    const button =
        document.getElementById(
            "continue-booking"
        );

    const checkoutSection =
        document.getElementById(
            "checkout-section"
        );

    if (
        !button ||
        !checkoutSection
    ) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            if (
                getCart().length === 0
            ) {

                alert(
                    "Please add a tank cleaning service first."
                );

                return;
            }

            checkoutSection.style.display =
                "block";

            checkoutSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );
}

/* =========================================================
   PAYMENT METHOD
========================================================= */

function setupPaymentMethods() {

    document
        .querySelectorAll(
            'input[name="payment"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                updateSummary
            );

        });
}

/* =========================================================
   BOOKING FORM
========================================================= */

function setupBookingForm() {

    const form =
        document.getElementById(
            "booking-form"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const cart =
                getCart();

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;
            }

            const submitButton =
                document.getElementById(
                    "booking-submit"
                );

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Processing...";

            }

            const paymentInput =
                document.querySelector(
                    'input[name="payment"]:checked'
                );

            const paymentMethod =
                paymentInput
                    ? paymentInput.value
                    : "after-service";

            const totals =
                calculateTotals(
                    paymentMethod
                );

            const formData =
                new FormData(form);

            /* IMPORTANT:
               These names match the booking API.
            */

            const customer = {

                name:
                    formData.get("name") || "",

                phone:
                    formData.get("phone") || "",

                address:
                    formData.get("address") || "",

                serviceDate:
                    formData.get("serviceDate") || "",

                serviceTime:
                    formData.get("serviceTime") || "",

                paymentMethod:
                    paymentMethod

            };

            const orderData = {

                customer,

                items: cart,

                pricing: totals

            };

            /* =================================================
               ONLINE PAYMENT
            ================================================= */

            if (
                paymentMethod === "online"
            ) {

                try {

                    const response =
                        await fetch(
                            "/api/create-booking",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        orderData
                                    )
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Unable to create payment."
                        );

                    }

                    if (
                        typeof Razorpay ===
                        "undefined"
                    ) {

                        throw new Error(
                            "Razorpay failed to load. Please refresh the page and try again."
                        );

                    }

                    const options = {

                        key:
                            data.key,

                        amount:
                            data.amount,

                        currency:
                            data.currency ||
                            "INR",

                        name:
                            "VSH Tank Cleaning",

                        description:
                            "Water Tank Cleaning Service",

                        order_id:
                            data.orderId,

                        prefill: {

                            name:
                                customer.name,

                            contact:
                                customer.phone

                        },

                        theme: {

                            color:
                                "#0878d1"

                        },

                        handler:
                            async function (
                                paymentResponse
                            ) {

                                try {

                                    const verifyResponse =
                                        await fetch(
                                            "/api/verify-payment",
                                            {
                                                method:
                                                    "POST",

                                                headers: {
                                                    "Content-Type":
                                                        "application/json"
                                                },

                                                body:
                                                    JSON.stringify(
                                                        {
                                                            ...orderData,

                                                            payment:
                                                                paymentResponse
                                                        }
                                                    )
                                            }
                                        );

                                    const verifyData =
                                        await verifyResponse.json();

                                    if (
                                        !verifyResponse.ok
                                    ) {

                                        throw new Error(
                                            verifyData.message ||
                                            "Payment verification failed."
                                        );

                                    }

                                    localStorage.removeItem(
                                        CART_KEY
                                    );

                                    updateCartCount();

                                    showBookingSuccess(
                                        "Payment successful! Your booking has been confirmed."
                                    );

                                } catch (error) {

                                    console.error(
                                        "Verification error:",
                                        error
                                    );

                                    alert(
                                        "Payment was received, but we could not complete the booking confirmation. Please contact VSH Tank Cleaning."
                                    );

                                    resetSubmitButton();

                                }

                            },

                        modal: {

                            ondismiss:
                                function () {

                                    resetSubmitButton();

                                }

                        }

                    };

                    const razorpay =
                        new Razorpay(
                            options
                        );

                    razorpay.open();

                } catch (error) {

                    console.error(
                        "Payment error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Something went wrong while processing your payment."
                    );

                    resetSubmitButton();

                }

                return;
            }

            /* =================================================
               PAY AFTER SERVICE
            ================================================= */

            try {

                const response =
                    await fetch(
                        "/api/create-booking",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    orderData
                                )
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Booking could not be completed."
                    );

                }

                localStorage.removeItem(
                    CART_KEY
                );

                updateCartCount();

                showBookingSuccess(
                    "Booking confirmed! VSH Tank Cleaning will contact you shortly."
                );

            } catch (error) {

                console.error(
                    "Booking error:",
                    error
                );

                alert(
                    error.message ||
                    "Something went wrong while booking."
                );

                resetSubmitButton();

            }

        }
    );
}

/* =========================================================
   RESET BUTTON
========================================================= */

function resetSubmitButton() {

    const button =
        document.getElementById(
            "booking-submit"
        );

    if (button) {

        button.disabled = false;

        button.textContent =
            "Pay & Book Now →";

    }
}

/* =========================================================
   SUCCESS
========================================================= */

function showBookingSuccess(message) {

    const success =
        document.getElementById(
            "bookingSuccess"
        );

    const form =
        document.getElementById(
            "booking-form"
        );

    const checkoutSection =
        document.getElementById(
            "checkout-section"
        );

    if (form) {
        form.style.display =
            "none";
    }

    if (success) {

        success.style.display =
            "block";

        success.innerHTML = `

            <div class="booking-success-box">

                <div class="success-icon">
                    ✓
                </div>

                <h2>
                    Booking Confirmed
                </h2>

                <p>
                    ${escapeHTML(message)}
                </p>

                <p>
                    Thank you for choosing
                    <strong>
                        VSH Tank Cleaning
                    </strong>.
                </p>

                <div class="success-actions">

                    <a
                        href="index.html"
                        class="btn btn-blue">

                        Back to Home

                    </a>

                    <a
                        href="https://wa.me/919599057079"
                        class="btn btn-green">

                        WhatsApp VSH

                    </a>

                </div>

            </div>

        `;

        success.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } else if (checkoutSection) {

        checkoutSection.innerHTML = `

            <div class="booking-success-box">

                <h2>
                    Booking Confirmed ✓
                </h2>

                <p>
                    ${escapeHTML(message)}
                </p>

                <a
                    href="index.html"
                    class="btn btn-blue">

                    Back to Home

                </a>

            </div>

        `;

    }
}

/* =========================================================
   PRICES PAGE
   Supports:
   data-add="..."
   AND
   onclick="addToCart('...',499)"
========================================================= */

function setupPriceButtons() {

    document
        .querySelectorAll(
            "[data-add]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    addToCart(
                        button.dataset.type ||
                        button.dataset.name,

                        Number(
                            button.dataset.price
                        )
                    );

                    button.textContent =
                        "Added ✓";

                    setTimeout(
                        () => {

                            button.textContent =
                                "Add to Cart";

                        },
                        1000
                    );

                }
            );

        });

}

/* =========================================================
   MOBILE NAV
========================================================= */

function setupMobileMenu() {

    const menuButton =
        document.querySelector(
            ".menu-toggle"
        );

    const nav =
        document.querySelector(
            ".nav-links"
        );

    if (
        !menuButton ||
        !nav
    ) {
        return;
    }

    menuButton.addEventListener(
        "click",
        function () {

            nav.classList.toggle(
                "active"
            );

        }
    );
}

/* =========================================================
   ACTIVE NAV
========================================================= */

function setActiveNav() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() ||
        "index.html";

    document
        .querySelectorAll(
            ".nav-links a"
        )
        .forEach(link => {

            const href =
                link.getAttribute(
                    "href"
                );

            if (
                href === currentPage
            ) {

                link.classList.add(
                    "active"
                );

            }

        });
}

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

        setupPriceButtons();

        renderCart();

        setupContinueBooking();

        setupPaymentMethods();

        setupBookingForm();

        setupMobileMenu();

        setActiveNav();

        updateSummary();

    }
);
/* =========================================================
   GLOBAL CART NAVIGATION
   Shows Cart on EVERY page
========================================================= */

(function addGlobalCartNav() {

    function createCartLink() {
        // Don't create duplicate cart links
        if (
            document.querySelector('.global-cart-link') ||
            document.querySelector('a[href="cart.html"]')
        ) {
            return;
        }

        const nav =
            document.querySelector('.navlinks') ||
            document.querySelector('.nav-links') ||
            document.querySelector('nav');

        if (!nav) return;

        const cartLink = document.createElement('a');

        cartLink.href = 'cart.html';
        cartLink.className = 'global-cart-link';

        cartLink.innerHTML = `
            🛒 Cart
            <span class="global-cart-count">0</span>
        `;

        nav.appendChild(cartLink);

        updateGlobalCartCount();
    }


    function updateGlobalCartCount() {

        let count = 0;

        try {
            const saved =
                JSON.parse(localStorage.getItem('vshCart') || '[]');

            count = saved.reduce(
                (total, item) =>
                    total + Number(item.qty || 0),
                0
            );

        } catch (error) {
            console.error('Cart count error:', error);
        }

        document
            .querySelectorAll('.global-cart-count')
            .forEach(el => {
                el.textContent = count;
            });
    }


    function injectCartStyles() {

        if (document.getElementById('global-cart-nav-style')) {
            return;
        }

        const style = document.createElement('style');

        style.id = 'global-cart-nav-style';

        style.textContent = `

            .global-cart-link {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 7px !important;

                padding: 9px 13px !important;

                border-radius: 999px !important;

                background: #eaf6ff !important;
                color: #0878d1 !important;

                font-weight: 900 !important;
                text-decoration: none !important;

                white-space: nowrap !important;

                transition:
                    background .2s ease,
                    color .2s ease,
                    transform .2s ease !important;
            }

            .global-cart-link:hover {
                background: #0878d1 !important;
                color: #ffffff !important;
                transform: translateY(-1px);
            }

            .global-cart-count {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;

                min-width: 23px !important;
                height: 23px !important;

                padding: 0 6px !important;

                border-radius: 999px !important;

                background: #0878d1 !important;
                color: #ffffff !important;

                font-size: 11px !important;
                font-weight: 900 !important;
                line-height: 1 !important;
            }

            .global-cart-link:hover .global-cart-count {
                background: #ffffff !important;
                color: #0878d1 !important;
            }

            @media (max-width: 900px) {

                .global-cart-link {
                    padding: 8px 11px !important;
                    font-size: 12px !important;
                }

            }

        `;

        document.head.appendChild(style);
    }


    function initGlobalCart() {

        injectCartStyles();
        createCartLink();
        updateGlobalCartCount();

        // Update count if cart changes
        window.addEventListener('storage', updateGlobalCartCount);

        // Keep count updated when navigating/interacting
        setInterval(updateGlobalCartCount, 500);
    }


    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            initGlobalCart
        );

    } else {

        initGlobalCart();

    }

})();
/* =========================================================
   ALWAYS SHOW CART LINK
   VSH TANK CLEANING
========================================================= */

(function () {

    function getCartItemCount() {
        try {
            const cart = JSON.parse(
                localStorage.getItem("vsh_tank_cart") || "[]"
            );

            return cart.reduce(function (total, item) {
                return total + Number(
                    item.quantity || item.qty || 0
                );
            }, 0);

        } catch (error) {
            return 0;
        }
    }


    function addCartToNavbar() {

        // Find the actual navigation used by your pages
        const nav =
            document.querySelector(".navlinks") ||
            document.querySelector(".nav-links") ||
            document.querySelector(".navbar nav") ||
            document.querySelector("header nav");

        if (!nav) return;


        // Don't create it twice
        if (nav.querySelector(".always-cart-link")) {
            updateCartLink();
            return;
        }


        const cartLink = document.createElement("a");

        cartLink.href = "cart.html";
        cartLink.className = "always-cart-link";

        cartLink.innerHTML = `
            <span>🛒 Cart</span>
            <span class="always-cart-count">0</span>
        `;

        nav.appendChild(cartLink);

        updateCartLink();
    }


    function updateCartLink() {

        const count = getCartItemCount();

        document
            .querySelectorAll(".always-cart-count")
            .forEach(function (element) {
                element.textContent = count;
            });
    }


    function addCartCSS() {

        if (document.getElementById("always-cart-css")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "always-cart-css";

        style.innerHTML = `

            .always-cart-link {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 7px !important;

                padding: 8px 13px !important;

                background: #e9f6ff !important;
                color: #0878d1 !important;

                border-radius: 999px !important;

                text-decoration: none !important;

                font-weight: 800 !important;
                white-space: nowrap !important;

                transition: all .2s ease !important;
            }

            .always-cart-link:hover {
                background: #0878d1 !important;
                color: #fff !important;
                transform: translateY(-1px);
            }

            .always-cart-count {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;

                min-width: 23px !important;
                height: 23px !important;

                padding: 0 6px !important;

                border-radius: 999px !important;

                background: #0878d1 !important;
                color: #fff !important;

                font-size: 11px !important;
                font-weight: 900 !important;
                line-height: 1 !important;
            }

            .always-cart-link:hover .always-cart-count {
                background: #fff !important;
                color: #0878d1 !important;
            }

        `;

        document.head.appendChild(style);
    }


    function initAlwaysCart() {

        addCartCSS();
        addCartToNavbar();
        updateCartLink();

        // Keep count synced
        window.addEventListener("storage", updateCartLink);

        // Also update after cart changes on same page
        setInterval(updateCartLink, 500);
    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initAlwaysCart
        );

    } else {

        initAlwaysCart();

    }

})();
/* =========================================================
   VSH TANK CLEANING — FLOATING CART
   Always visible on every page
========================================================= */

(function initFloatingCart() {

    function getCartCount() {
        try {
            const cart = JSON.parse(
                localStorage.getItem("vsh_tank_cart") || "[]"
            );

            return cart.reduce(function (total, item) {
                return total + Number(item.quantity || 0);
            }, 0);

        } catch (error) {
            return 0;
        }
    }

    function createFloatingCart() {

        // Prevent duplicate button
        if (document.getElementById("vsh-floating-cart")) {
            updateFloatingCart();
            return;
        }

        const button = document.createElement("a");

        button.id = "vsh-floating-cart";
        button.href = "cart.html";
        button.setAttribute("aria-label", "Open shopping cart");

        button.innerHTML = `
            <span class="vsh-cart-icon">🛒</span>

            <span class="vsh-cart-text">
                <strong>Cart</strong>
                <small>View booking</small>
            </span>

            <span class="vsh-floating-cart-count">0</span>
        `;

        document.body.appendChild(button);

        updateFloatingCart();
    }


    function updateFloatingCart() {

        const count = getCartCount();

        const countElement =
            document.querySelector(".vsh-floating-cart-count");

        if (countElement) {
            countElement.textContent = count;
        }
    }


    function addFloatingCartCSS() {

        if (document.getElementById("vsh-floating-cart-css")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "vsh-floating-cart-css";

        style.textContent = `

            #vsh-floating-cart {
                position: fixed;
                right: 24px;
                bottom: 24px;

                z-index: 999999;

                display: flex;
                align-items: center;
                gap: 11px;

                min-width: 170px;
                min-height: 62px;

                padding: 10px 13px;

                background:
                    linear-gradient(
                        135deg,
                        #0878d1 0%,
                        #075ca5 100%
                    );

                color: #ffffff !important;

                border-radius: 18px;

                text-decoration: none !important;

                box-shadow:
                    0 15px 40px rgba(0, 76, 130, .35);

                border: 2px solid rgba(255,255,255,.8);

                font-family:
                    Arial,
                    Helvetica,
                    sans-serif;

                transition:
                    transform .2s ease,
                    box-shadow .2s ease;

                animation:
                    vshCartAppear .35s ease;
            }


            #vsh-floating-cart:hover {
                transform:
                    translateY(-4px)
                    scale(1.02);

                box-shadow:
                    0 20px 50px rgba(0, 76, 130, .45);
            }


            .vsh-cart-icon {
                width: 39px;
                height: 39px;

                display: flex;
                align-items: center;
                justify-content: center;

                background: rgba(255,255,255,.16);

                border-radius: 12px;

                font-size: 21px;
            }


            .vsh-cart-text {
                display: flex;
                flex-direction: column;

                line-height: 1.1;

                flex: 1;
            }


            .vsh-cart-text strong {
                color: #ffffff;

                font-size: 15px;
                font-weight: 900;
            }


            .vsh-cart-text small {
                margin-top: 4px;

                color: rgba(255,255,255,.78);

                font-size: 10px;
                font-weight: 600;
            }


            .vsh-floating-cart-count {
                min-width: 29px;
                height: 29px;

                display: flex;
                align-items: center;
                justify-content: center;

                padding: 0 7px;

                background: #ffffff;
                color: #0878d1;

                border-radius: 50px;

                font-size: 12px;
                font-weight: 900;

                box-shadow:
                    0 4px 12px rgba(0,0,0,.12);
            }


            @keyframes vshCartAppear {

                from {
                    opacity: 0;
                    transform:
                        translateY(20px)
                        scale(.94);
                }

                to {
                    opacity: 1;
                    transform:
                        translateY(0)
                        scale(1);
                }

            }


            @media (max-width: 600px) {

                #vsh-floating-cart {
                    right: 14px;
                    bottom: 14px;

                    min-width: 145px;
                    min-height: 55px;

                    padding: 8px 10px;

                    border-radius: 15px;
                }


                .vsh-cart-icon {
                    width: 34px;
                    height: 34px;

                    font-size: 18px;

                    border-radius: 10px;
                }


                .vsh-cart-text strong {
                    font-size: 13px;
                }


                .vsh-cart-text small {
                    font-size: 9px;
                }


                .vsh-floating-cart-count {
                    min-width: 26px;
                    height: 26px;

                    font-size: 11px;
                }

            }

        `;

        document.head.appendChild(style);
    }


    function init() {

        addFloatingCartCSS();
        createFloatingCart();
        updateFloatingCart();

        // Update when another tab/window changes the cart
        window.addEventListener(
            "storage",
            updateFloatingCart
        );

        // Keep it synced with add/remove/quantity changes
        setInterval(
            updateFloatingCart,
            500
        );
    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();
