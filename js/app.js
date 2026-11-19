const CART_KEY = "vsh_tank_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(name, price) {

  let cart = getCart();

  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      name: name,
      price: price,
      quantity: 1
    });
  }

  saveCart(cart);

  alert("Service added to cart.");

  window.location.href = "cart.html";
}

function removeFromCart(index) {

  let cart = getCart();

  cart.splice(index, 1);

  saveCart(cart);

  renderCart();
}

function changeQuantity(index, change) {

  let cart = getCart();

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);

  renderCart();
}

function getTotalItems(cart) {

  return cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}

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

function calculateTotals(paymentMethod = "online") {

  const cart = getCart();

  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  const totalItems = getTotalItems(cart);

  const multiTankRate = getDiscountRate(totalItems);

  const multiTankDiscount =
    subtotal * multiTankRate;

  const afterMultiTank =
    subtotal - multiTankDiscount;

  let onlineDiscount = 0;

  if (paymentMethod === "online") {
    onlineDiscount = afterMultiTank * 0.05;
  }

  const finalTotal =
    afterMultiTank - onlineDiscount;

  return {
    subtotal,
    totalItems,
    multiTankRate,
    multiTankDiscount,
    onlineDiscount,
    finalTotal
  };
}

function updateCartCount() {

  const cart = getCart();

  const count = getTotalItems(cart);

  const elements =
    document.querySelectorAll("#cart-count");

  elements.forEach(element => {
    element.textContent = count;
  });
}

function renderCart() {

  const root =
    document.getElementById("cart-root");

  if (!root) {
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {

    root.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add a tank cleaning service to continue.</p>

        <a href="prices.html" class="checkout-btn">
          View Prices
        </a>
      </div>
    `;

    return;
  }

  let html = `
    <div class="cart-items">
  `;

  cart.forEach((item, index) => {

    html += `
      <div class="cart-item">

        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>₹${item.price} per tank</p>
        </div>

        <div class="quantity-control">

          <button
            onclick="changeQuantity(${index}, -1)">
            −
          </button>

          <span>${item.quantity}</span>

          <button
            onclick="changeQuantity(${index}, 1)">
            +
          </button>

        </div>

        <div class="item-total">
          ₹${item.price * item.quantity}
        </div>

        <button
          class="remove-btn"
          onclick="removeFromCart(${index})">
          Remove
        </button>

      </div>
    `;

  });

  html += `
    </div>
  `;

  root.innerHTML = html;
}

function renderOrderSummary() {

  const summary =
    document.getElementById("order-summary");

  if (!summary) {
    return;
  }

  const paymentMethod =
    document.querySelector(
      'input[name="payment-method"]:checked'
    )?.value || "online";

  const totals =
    calculateTotals(paymentMethod);

  if (totals.totalItems === 0) {

    summary.innerHTML = "";

    return;
  }

  let discountText =
    `${Math.round(totals.multiTankRate * 100)}%`;

  summary.innerHTML = `

    <div class="summary-box">

      <h2>Order Summary</h2>

      <div class="summary-row">
        <span>Number of Tanks</span>
        <strong>${totals.totalItems}</strong>
      </div>

      <div class="summary-row">
        <span>Subtotal</span>
        <strong>₹${totals.subtotal.toFixed(2)}</strong>
      </div>

      ${
        totals.multiTankDiscount > 0
        ? `
          <div class="summary-row discount">
            <span>
              Multi-Tank Discount (${discountText})
            </span>

            <strong>
              -₹${totals.multiTankDiscount.toFixed(2)}
            </strong>
          </div>
        `
        : ""
      }

      ${
        paymentMethod === "online"
        ? `
          <div class="summary-row discount">
            <span>Online Payment Discount (5%)</span>

            <strong>
              -₹${totals.onlineDiscount.toFixed(2)}
            </strong>
          </div>
        `
        : `
          <div class="summary-row">
            <span>Online Discount</span>
            <strong>₹0</strong>
          </div>
        `
      }

      <div class="summary-total">
        <span>Total Amount</span>
        <strong>
          ₹${totals.finalTotal.toFixed(2)}
        </strong>
      </div>

    </div>

  `;
}

document.addEventListener("DOMContentLoaded", () => {

  updateCartCount();

  renderCart();

  renderOrderSummary();

  const paymentInputs =
    document.querySelectorAll(
      'input[name="payment-method"]'
    );

  paymentInputs.forEach(input => {

    input.addEventListener(
      "change",
      renderOrderSummary
    );

  });

  const bookingForm =
    document.getElementById("booking-form");

  if (bookingForm) {

    bookingForm.addEventListener(
      "submit",
      async function(event) {

        event.preventDefault();

        const cart = getCart();

        if (cart.length === 0) {
          alert("Your cart is empty.");
          return;
        }

        const name =
          document.getElementById(
            "customer-name"
          ).value;

        const phone =
          document.getElementById(
            "customer-phone"
          ).value;

        const address =
          document.getElementById(
            "customer-address"
          ).value;

        const serviceDate =
          document.getElementById(
            "service-date"
          ).value;

        const paymentMethod =
          document.querySelector(
            'input[name="payment-method"]:checked'
          ).value;

        const totals =
          calculateTotals(paymentMethod);

        const bookingData = {

          customer: {
            name,
            phone,
            address
          },

          serviceDate,

          items: cart,

          pricing: totals,

          paymentMethod

        };

        /*
          IMPORTANT:

          Razorpay and Resend should be called
          from your backend server.

          Do NOT put your Razorpay secret key
          or Resend API key inside this file.

          The backend endpoint below will handle
          the secure payment/email process.
        */

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
                  JSON.stringify(bookingData)
              }
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
              "Unable to create booking."
            );
          }

          if (
            paymentMethod === "online" &&
            result.order
          ) {

            const options = {

              key: result.key,

              amount:
                result.order.amount,

              currency: "INR",

              name:
                "VSH Tank Cleaning",

              description:
                "Tank Cleaning Service",

              order_id:
                result.order.id,

              handler: function(payment) {

                window.location.href =
                  "index.html?payment=success";

              },

              prefill: {
                name: name,
                contact: phone
              },

              theme: {
                color: "#0ea5e9"
              }

            };

            const razorpay =
              new Razorpay(options);

            razorpay.open();

          } else {

            alert(
              "Booking confirmed successfully!"
            );

            localStorage.removeItem(
              CART_KEY
            );

            window.location.href =
              "index.html?booking=success";

          }

        } catch (error) {

          console.error(error);

          alert(
            error.message ||
            "Something went wrong while creating your booking."
          );

        }

      }
    );

  }

});
