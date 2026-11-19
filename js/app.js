/* =========================================================
   VSH TANK CLEANING - MAIN JAVASCRIPT
   Works with the current HTML structure
========================================================= */

const CART_KEY = "vsh_tank_cart";

/* =========================================================
   CART STORAGE
========================================================= */

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* =========================================================
   ADD TO CART
   Supports BOTH formats:

   addToCart("Tank Cleaning", 499)

   OR

   addToCart({
       name: "Tank Cleaning",
       price: 499
   })
========================================================= */

function addToCart(item, price) {

    let name;
    let itemPrice;

    /* -----------------------------------------------------
       FORMAT 1:
       addToCart("Tank Cleaning", 499)
    ----------------------------------------------------- */

    if (typeof item === "string") {

        name = item;
        itemPrice = Number(price);

    }

    /* -----------------------------------------------------
       FORMAT 2:
       addToCart({
           name: "Tank Cleaning",
           price: 499
       })
    ----------------------------------------------------- */

    else if (
        typeof item === "object" &&
        item !== null
    ) {

        name = item.name;
        itemPrice = Number(item.price);

    }

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (
        !name ||
        !itemPrice ||
        itemPrice <= 0
    ) {

        console.error(
            "Invalid cart item:",
            item,
            price
        );

        return;
    }

    let cart = getCart();

    /* -----------------------------------------------------
       CHECK IF ITEM ALREADY EXISTS
    ----------------------------------------------------- */

    const existingItem = cart.find(
        product => product.name === name
    );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({
            name: name,
            price: itemPrice,
            quantity: 1
        });

    }

    /* -----------------------------------------------------
       SAVE CART
    ----------------------------------------------------- */

    saveCart(cart);

    /* -----------------------------------------------------
       UPDATE CART COUNT
    ----------------------------------------------------- */

    updateCartCount();

    /* -----------------------------------------------------
       SHOW SUCCESS MESSAGE
    ----------------------------------------------------- */

    showCartMessage(
        `${name} added to cart`
    );

    /* -----------------------------------------------------
       IF CURRENTLY ON CART PAGE,
       REFRESH CART
    ----------------------------------------------------- */

    if (
        document.getElementById("cart-root")
    ) {

        renderCart();

    }
}

/* =========================================================
   REMOVE ITEM
========================================================= */

function removeFromCart(index) {

    let cart = getCart();

    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }

    cart.splice(index, 1);

    saveCart(cart);

    updateCartCount();

    renderCart();
}

/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(index, change) {

    let cart = getCart();

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }

    saveCart(cart);

    updateCartCount();

    renderCart();
}

/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    const cart = getCart();

    let totalItems = 0;

    cart.forEach(item => {

        totalItems += Number(
            item.quantity
        );

    });

    const counters =
        document.querySelectorAll(
            "#cart-count, .cart-count"
        );

    counters.forEach(counter => {

        counter.textContent =
            totalItems;

    });
}

/* =========================================================
   DISCOUNT RULES
========================================================= */

function getDiscountRate(totalItems) {

    if (totalItems >= 5) {

        return 0.15; // 15%

    }

    if (totalItems >= 3) {

        return 0.12; // 12%

    }

    if (totalItems >= 2) {

        return 0.10; // 10%

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
            (subtotal - quantityDiscount) *
            0.05;

    }

    const total =
        subtotal -
        quantityDiscount -
        onlineDiscount;

    return {

        subtotal: subtotal,

        quantityDiscount:
            quantityDiscount,

        onlineDiscount:
            onlineDiscount,

        total: total,

        totalItems:
            totalItems,

        discountRate:
            discountRate

    };
}

/* =========================================================
   FORMAT MONEY
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
   SHOW ADD TO CART MESSAGE
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
            "#ffffff";

        notification.style.padding =
            "14px 20px";

        notification.style.borderRadius =
            "10px";

        notification.style.fontWeight =
            "600";

        notification.style.zIndex =
            "99999";

        notification.style.boxShadow =
            "0 10px 30px rgba(0,0,0,0.2)";

        notification.style.transition =
            "opacity 0.3s ease";

        document.body.appendChild(
            notification
        );
    }

    notification.textContent =
        "✓ " + message;

    notification.style.opacity =
        "1";

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

    const cart = getCart();

    /* -----------------------------------------------------
       EMPTY CART
    ----------------------------------------------------- */

    if (cart.length === 0) {

        if (cartItemsContainer) {

            cartItemsContainer.innerHTML =
                "";

        }

        if (emptyCart) {

            emptyCart.style.display =
                "block";

        }

        if (checkoutSection) {

            checkoutSection.style.display =
                "none";

        }

        updateCartCount();

        return;
    }

    /* -----------------------------------------------------
       CART HAS ITEMS
    ----------------------------------------------------- */

    if (emptyCart) {

        emptyCart.style.display =
            "none";

    }

    if (checkoutSection) {

        checkoutSection.style.display =
            "block";

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
                        ${formatMoney(item.price)} each
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

    /* -----------------------------------------------------
       SUBTOTAL
    ----------------------------------------------------- */

    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(
                totals.subtotal
            );

    }

    /* -----------------------------------------------------
       BULK DISCOUNT
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       ONLINE DISCOUNT ROW
    ----------------------------------------------------- */

    if (onlineDiscountRow) {

        if (
            paymentMethod === "online"
        ) {

            onlineDiscountRow.style.display =
                "flex";

        } else {

            onlineDiscountRow.style.display =
                "none";

        }
    }

    /* -----------------------------------------------------
       ONLINE DISCOUNT
    ----------------------------------------------------- */

    if (onlineDiscountElement) {

        onlineDiscountElement.textContent =
            "-" +
            formatMoney(
                totals.onlineDiscount
            );

    }

    /* -----------------------------------------------------
       FINAL TOTAL
    ----------------------------------------------------- */

    if (totalElement) {

        totalElement.textContent =
            formatMoney(
                totals.total
            );

    }
}

/* =========================================================
   PAYMENT METHOD
========================================================= */

function setupPaymentMethods() {

    const paymentOptions =
        document.querySelectorAll(
            'input[name="payment"]'
        );

    paymentOptions.forEach(input => {

        input.addEventListener(
            "change",
            function () {

                updateSummary();

            }
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

            const cart = getCart();

            /* -------------------------------------------------
               CHECK CART
            ------------------------------------------------- */

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;
            }

            /* -------------------------------------------------
               SUBMIT BUTTON
            ------------------------------------------------- */

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

            /* -------------------------------------------------
               PAYMENT METHOD
            ------------------------------------------------- */

            const paymentInput =
                document.querySelector(
                    'input[name="payment"]:checked'
                );

            const paymentMethod =
                paymentInput
                    ? paymentInput.value
                    : "after-service";

            /* -------------------------------------------------
               CALCULATE TOTALS
            ------------------------------------------------- */

            const totals =
                calculateTotals(
                    paymentMethod
                );

            /* -------------------------------------------------
               FORM DATA
            ------------------------------------------------- */

            const formData =
                new FormData(form);

            const customer = {

                name:
                    formData.get(
                        "name"
                    ) || "",

                phone:
                    formData.get(
                        "phone"
                    ) || "",

                address:
                    formData.get(
                        "address"
                    ) || "",

                serviceDate:
                    formData.get(
                        "service-date"
                    ) || "",

                paymentMethod:
                    paymentMethod

            };

            /* -------------------------------------------------
               ORDER DATA
            ------------------------------------------------- */

            const orderData = {

                customer:
                    customer,

                items:
                    cart,

                pricing:
                    totals

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

                                method:
                                    "POST",

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

                    /* -------------------------------------------------
                       RAZORPAY
                    ------------------------------------------------- */

                    if (
                        typeof Razorpay !==
                        "undefined"
                    ) {

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
                                "Tank Cleaning Service",

                            order_id:
                                data.orderId,

                            prefill: {

                                name:
                                    customer.name,

                                contact:
                                    customer.phone

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

                                        /* -------------------------------------------------
                                           CLEAR CART
                                        ------------------------------------------------- */

                                        localStorage.removeItem(
                                            CART_KEY
                                        );

                                        alert(
                                            "Booking confirmed successfully!"
                                        );

                                        window.location.href =
                                            "index.html";

                                    } catch (error) {

                                        console.error(
                                            error
                                        );

                                        alert(
                                            "Payment was received, but booking confirmation failed. Please contact us."
                                        );

                                    }

                                },

                            modal: {

                                ondismiss:
                                    function () {

                                        if (
                                            submitButton
                                        ) {

                                            submitButton.disabled =
                                                false;

                                            submitButton.textContent =
                                                "Confirm Booking";

                                        }

                                    }

                            }

                        };

                        const razorpay =
                            new Razorpay(
                                options
                            );

                        razorpay.open();

                    } else {

                        throw new Error(
                            "Razorpay failed to load."
                        );

                    }

                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        error.message ||
                        "Something went wrong while processing your booking."
                    );

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Confirm Booking";

                    }

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

                            method:
                                "POST",

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

                /* -------------------------------------------------
                   CLEAR CART
                ------------------------------------------------- */

                localStorage.removeItem(
                    CART_KEY
                );

                alert(
                    "Booking confirmed successfully! We will contact you shortly."
                );

                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(
                    error
                );

                alert(
                    error.message ||
                    "Something went wrong while booking."
                );

                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Confirm Booking";

                }

            }

        }
    );
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
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

/* =========================================================
   MOBILE NAVIGATION
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
   ACTIVE NAV LINK
========================================================= */

function setActiveNav() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() ||
        "index.html";

    const links =
        document.querySelectorAll(
            ".nav-links a"
        );

    links.forEach(link => {

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

        renderCart();

        setupPaymentMethods();

        setupBookingForm();

        setupMobileMenu();

        setActiveNav();

        updateSummary();

    }
);
