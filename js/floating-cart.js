(function () {
    "use strict";

    function getCartCount() {
        let total = 0;

        // Support both versions of your cart
        const keys = ["vsh_tank_cart", "vshCart"];

        keys.forEach(function (key) {
            try {
                const cart = JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

                if (Array.isArray(cart)) {
                    cart.forEach(function (item) {
                        total += Number(
                            item.quantity ??
                            item.qty ??
                            0
                        );
                    });
                }
            } catch (e) {}
        });

        return total;
    }

    function createButton() {

        if (document.getElementById("vsh-floating-cart")) {
            return;
        }

        const cart = document.createElement("a");

        cart.id = "vsh-floating-cart";
        cart.href = "cart.html";
        cart.innerHTML = `
            <span class="vsh-fc-icon">🛒</span>

            <span class="vsh-fc-info">
                <strong>Cart</strong>
                <small>View booking</small>
            </span>

            <span class="vsh-fc-count">0</span>
        `;

        document.body.appendChild(cart);

        updateCount();
    }

    function updateCount() {

        const count = getCartCount();

        document
            .querySelectorAll(".vsh-fc-count")
            .forEach(function (el) {
                el.textContent = count;
            });
    }

    function addStyles() {

        if (document.getElementById("vsh-floating-cart-css")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "vsh-floating-cart-css";

        style.textContent = `
            #vsh-floating-cart {
                position: fixed !important;
                right: 24px !important;
                bottom: 24px !important;

                z-index: 2147483647 !important;

                width: 185px !important;
                min-height: 64px !important;

                display: flex !important;
                align-items: center !important;
                gap: 11px !important;

                padding: 10px 13px !important;

                background: linear-gradient(
                    135deg,
                    #0878d1,
                    #045b9d
                ) !important;

                color: #ffffff !important;

                border: 2px solid #ffffff !important;
                border-radius: 18px !important;

                text-decoration: none !important;

                box-shadow:
                    0 12px 35px rgba(0, 65, 110, .38) !important;

                font-family:
                    Arial,
                    Helvetica,
                    sans-serif !important;

                cursor: pointer !important;

                transition:
                    transform .2s ease,
                    box-shadow .2s ease !important;
            }

            #vsh-floating-cart:hover {
                transform: translateY(-4px) !important;

                box-shadow:
                    0 18px 45px rgba(0, 65, 110, .5) !important;
            }

            .vsh-fc-icon {
                width: 40px !important;
                height: 40px !important;

                flex: 0 0 40px !important;

                display: flex !important;
                align-items: center !important;
                justify-content: center !important;

                background: rgba(255,255,255,.18) !important;

                border-radius: 12px !important;

                font-size: 21px !important;
            }

            .vsh-fc-info {
                flex: 1 !important;

                display: flex !important;
                flex-direction: column !important;

                line-height: 1.1 !important;
            }

            .vsh-fc-info strong {
                color: #ffffff !important;
                font-size: 15px !important;
                font-weight: 900 !important;
            }

            .vsh-fc-info small {
                margin-top: 4px !important;

                color: rgba(255,255,255,.8) !important;

                font-size: 10px !important;
                font-weight: 600 !important;
            }

            .vsh-fc-count {
                min-width: 29px !important;
                height: 29px !important;

                display: flex !important;
                align-items: center !important;
                justify-content: center !important;

                padding: 0 7px !important;

                border-radius: 999px !important;

                background: #ffffff !important;
                color: #0878d1 !important;

                font-size: 12px !important;
                font-weight: 900 !important;
            }

            @media (max-width: 600px) {

                #vsh-floating-cart {
                    right: 14px !important;
                    bottom: 14px !important;

                    width: 155px !important;
                    min-height: 55px !important;

                    padding: 8px 10px !important;

                    border-radius: 15px !important;
                }

                .vsh-fc-icon {
                    width: 34px !important;
                    height: 34px !important;

                    flex-basis: 34px !important;

                    font-size: 18px !important;
                }

                .vsh-fc-info strong {
                    font-size: 13px !important;
                }

                .vsh-fc-info small {
                    font-size: 9px !important;
                }

                .vsh-fc-count {
                    min-width: 26px !important;
                    height: 26px !important;

                    font-size: 11px !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function init() {
        addStyles();
        createButton();
        updateCount();

        // Update when another tab changes cart
        window.addEventListener(
            "storage",
            updateCount
        );

        // Keep count synced with existing cart code
        setInterval(updateCount, 500);
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
