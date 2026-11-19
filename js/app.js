/* =========================================================
   VSH TANK CLEANING - MAIN JAVASCRIPT
========================================================= */

const CART_KEY = "vsh_tank_cart";


/* =========================================================
   CART STORAGE
========================================================= */

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem(CART_KEY)
        ) || [];

    } catch (error) {

        return [];

    }

}


function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   ADD TO CART
   Supports BOTH:

   addToCart({
       name: "...",
       price: 499
   })

   AND

   addToCart("Tank Cleaning", 499)
========================================================= */

function addToCart(item, price) {

    let name;
    let itemPrice;


    /* Old / current prices.html format */

    if (typeof item === "string") {

        name = item;

        itemPrice = Number(price);

    }


    /* Object format */

    else if (
        typeof item === "object" &&
        item !== null
    ) {

        name = item.name;

        itemPrice = Number(item.price);

    }


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


    const existingItem =
        cart.find(
            product =>
                product.name === name
        );


    if (existingItem) {

        existingItem.quantity += 1;

    }

    else {

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


    if (
        document.getElementById(
            "cart-root"
        )
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

function changeQuantity(
    index,
    change
) {

    let cart = getCart();


    if (!cart[index]) {

        return;

    }


    cart[index].quantity += change;


    if (
        cart[index].quantity <= 0
    ) {

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
   CREATE FOOTER CART
   Automatically adds Cart to every page
========================================================= */

function addFooterCart() {

    const footer =
        document.querySelector(
            ".footer"
        );


    if (!footer) {

        return;

    }


    /* Prevent duplicate */

    if (
        document.querySelector(
            ".footer-cart"
        )
    ) {

        return;

    }


    const cart =
        getCart();


    let totalItems = 0;


    cart.forEach(item => {

        totalItems += Number(
            item.quantity
        );

    });


    const cartColumn =
        document.createElement(
            "div"
        );


    cartColumn.className =
        "footer-cart";


    cartColumn.innerHTML = `

        <h3>
            Your Booking
        </h3>

        <p>
            Ready to book your tank cleaning?
        </p>

        <a
            href="cart.html"
            class="footer-cart-button"
        >

            <span>
                🛒 View Cart
            </span>

            <span
                class="cart-count"
            >
                ${totalItems}
            </span>

        </a>

    `;


    const footerGrid =
        footer.querySelector(
            ".footer-grid"
        );


    if (footerGrid) {

        footerGrid.appendChild(
            cartColumn
        );

    }

    else {

        footer.appendChild(
            cartColumn
        );

    }


    updateCartCount();

}


/* =========================================================
   CART MESSAGE
========================================================= */

function showCartMessage(
    message
) {

    let messageBox =
        document.getElementById(
            "cart-message"
        );


    if (!messageBox) {

        messageBox =
            document.createElement(
                "div"
            );

        messageBox.id =
            "cart-message";


        messageBox.style.position =
            "fixed";

        messageBox.style.bottom =
            "30px";

        messageBox.style.left =
            "50%";

        messageBox.style.transform =
            "translateX(-50%)";

        messageBox.style.background =
            "#071b33";

        messageBox.style.color =
            "#ffffff";

        messageBox.style.padding =
            "14px 22px";

        messageBox.style.borderRadius =
            "999px";

        messageBox.style.fontWeight =
            "700";

        messageBox.style.fontSize =
            "14px";

        messageBox.style.zIndex =
            "99999";

        messageBox.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.25)";


        document.body.appendChild(
            messageBox
        );

    }


    messageBox.textContent =
        message;


    messageBox.style.display =
        "block";


    clearTimeout(
        window.cartMessageTimer
    );


    window.cartMessageTimer =
        setTimeout(() => {

            messageBox.style.display =
                "none";

        }, 2200);

}


/* =========================================================
   DISCOUNT RULES
========================================================= */

function getDiscountRate(
    totalItems
) {

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
    paymentMethod =
        "after-service"
) {

    const cart =
        getCart();


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
        getDiscountRate(
            totalItems
        );


    const quantityDiscount =
        subtotal *
        discountRate;


    let onlineDiscount = 0;


    if (
        paymentMethod ===
        "online"
    ) {

        onlineDiscount =
            (
                subtotal -
                quantityDiscount
            ) * 0.05;

    }


    const total =
        subtotal -
        quantityDiscount -
        onlineDiscount;


    return {

        subtotal,

        totalItems,

        quantityDiscount,

        onlineDiscount,

        total

    };

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const root =
        document.getElementById(
            "cart-root"
        );


    if (!root) {

        return;

    }


    const cart =
        getCart();


    if (!cart.length) {

        root.innerHTML = `

            <div
                class="card"
                style="
                    text-align:center;
                    padding:60px 25px;
                "
            >

                <div
                    style="
                        font-size:55px;
                        margin-bottom:15px;
                    "
                >
                    🛒
                </div>

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Choose a tank size from
                    our pricing page and add
                    it to your booking.
                </p>

                <a
                    class="btn btn-blue"
                    href="prices.html"
                >
                    View Prices →
                </a>

            </div>

        `;


        updateCartCount();


        return;

    }


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
        getDiscountRate(
            totalItems
        );


    const quantityDiscount =
        subtotal *
        discountRate;


    const afterDiscount =
        subtotal -
        quantityDiscount;


    root.innerHTML = `

        <div
            class="cart-layout"
        >


            <!-- ITEMS -->

            <div
                class="card"
            >

                <h2>
                    Your Booking
                </h2>


                <p>
                    ${totalItems}
                    item${totalItems === 1 ? "" : "s"}
                    selected
                </p>


                <div
                    class="cart-list"
                >

                    ${cart.map(
                        (item, index) => `

                        <div
                            class="cart-item"
                        >

                            <div
                                class="cart-item-info"
                            >

                                <h3>
                                    ${item.name}
                                </h3>

                                <p>
                                    ₹${Number(
                                        item.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                    per tank
                                </p>

                            </div>


                            <div
                                class="cart-controls"
                            >

                                <button
                                    type="button"
                                    onclick="changeQuantity(${index}, -1)"
                                >
                                    −
                                </button>


                                <strong>
                                    ${item.quantity}
                                </strong>


                                <button
                                    type="button"
                                    onclick="changeQuantity(${index}, 1)"
                                >
                                    +
                                </button>

                            </div>


                            <div
                                class="cart-item-total"
                            >

                                <strong>
                                    ₹${(
                                        Number(
                                            item.price
                                        ) *
                                        Number(
                                            item.quantity
                                        )
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>


                                <button
                                    type="button"
                                    onclick="removeFromCart(${index})"
                                >
                                    Remove
                                </button>

                            </div>

                        </div>

                    `).join("")}

                </div>

            </div>



            <!-- SUMMARY -->

            <div
                class="card cart-summary"
            >

                <h2>
                    Booking Summary
                </h2>


                <div
                    class="summary-row"
                >

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ₹${subtotal.toLocaleString(
                            "en-IN"
                        )}
                    </strong>

                </div>


                <div
                    class="summary-row"
                >

                    <span>
                        Multi-tank discount
                    </span>

                    <strong
                        style="
                            color:#078d54;
                        "
                    >
                        −₹${quantityDiscount.toLocaleString(
                            "en-IN",
                            {
                                maximumFractionDigits:
                                    0
                            }
                        )}
                    </strong>

                </div>


                <hr>


                <div
                    class="summary-row total-row"
                >

                    <span>
                        Total
                    </span>

                    <strong>
                        ₹${afterDiscount.toLocaleString(
                            "en-IN",
                            {
                                maximumFractionDigits:
                                    0
                            }
                        )}
                    </strong>

                </div>


                <a
                    href="cart.html"
                    class="btn btn-blue"
                    style="
                        width:100%;
                        margin-top:20px;
                    "
                >
                    Continue to Booking →
                </a>


                <a
                    href="prices.html"
                    class="btn btn-light"
                    style="
                        width:100%;
                        margin-top:10px;
                    "
                >
                    Add Another Tank
                </a>

            </div>

        </div>

    `;


    updateCartCount();

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    const paymentElement =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    const paymentMethod =
        paymentElement
            ? paymentElement.value
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
            `₹${totals.subtotal.toLocaleString(
                "en-IN"
            )}`;

    }


    if (discountElement) {

        discountElement.textContent =
            `−₹${totals.quantityDiscount.toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits:
                        0
                }
            )}`;

    }


    if (onlineDiscountElement) {

        onlineDiscountElement.textContent =
            `−₹${totals.onlineDiscount.toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits:
                        0
                }
            )}`;

    }


    if (totalElement) {

        totalElement.textContent =
            `₹${totals.total.toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits:
                        0
                }
            )}`;

    }


    const onlineRow =
        document.getElementById(
            "online-discount-row"
        );


    if (onlineRow) {

        onlineRow.style.display =
            paymentMethod === "online"
                ? "flex"
                : "none";

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        addFooterCart();

        updateCartCount();

        renderCart();

        updateSummary();

    }
);
