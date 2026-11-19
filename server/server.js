require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const { Resend } = require("resend");
const path = require("path");

const app = express();

app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const resend = new Resend(
  process.env.RESEND_API_KEY
);

app.use(
  express.static(
    path.join(__dirname, "..")
  )
);

app.post(
  "/api/create-booking",
  async (req, res) => {

    try {

      const {
        customer,
        serviceDate,
        items,
        pricing,
        paymentMethod
      } = req.body;

      if (
        !customer ||
        !customer.name ||
        !customer.phone ||
        !customer.address
      ) {

        return res.status(400).json({
          message:
            "Customer details are required."
        });

      }

      if (
        !items ||
        !items.length
      ) {

        return res.status(400).json({
          message:
            "Cart is empty."
        });

      }

      const amountInPaise =
        Math.round(
          pricing.finalTotal * 100
        );

      if (
        paymentMethod === "online"
      ) {

        const order =
          await razorpay.orders.create({

            amount:
              amountInPaise,

            currency: "INR",

            receipt:
              `VSH-${Date.now()}`,

            notes: {

              customerName:
                customer.name,

              phone:
                customer.phone,

              serviceDate:
                serviceDate

            }

          });

        return res.json({

          success: true,

          key:
            process.env.RAZORPAY_KEY_ID,

          order

        });

      }

      await sendBookingEmail({
        customer,
        serviceDate,
        items,
        pricing,
        paymentMethod
      });

      return res.json({
        success: true,
        message:
          "Booking created successfully."
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        message:
          "Unable to create booking."

      });

    }

  }
);

async function sendBookingEmail(data) {

  const {
    customer,
    serviceDate,
    items,
    pricing,
    paymentMethod
  } = data;

  let itemsHTML = "";

  items.forEach(item => {

    itemsHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
        <td>
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `;

  });

  await resend.emails.send({

    from:
      process.env.RESEND_FROM_EMAIL,

    to:
      process.env.BUSINESS_EMAIL,

    subject:
      "New VSH Tank Cleaning Booking",

    html: `

      <h2>New Tank Cleaning Booking</h2>

      <h3>Customer Details</h3>

      <p>
        <strong>Name:</strong>
        ${customer.name}
      </p>

      <p>
        <strong>Phone:</strong>
        ${customer.phone}
      </p>

      <p>
        <strong>Address:</strong>
        ${customer.address}
      </p>

      <p>
        <strong>Service Date:</strong>
        ${serviceDate}
      </p>

      <h3>Services</h3>

      <table
        border="1"
        cellpadding="8"
        cellspacing="0"
      >

        <tr>
          <th>Service</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>

        ${itemsHTML}

      </table>

      <h3>Payment</h3>

      <p>
        Payment Method:
        <strong>
          ${
            paymentMethod === "online"
            ? "Online"
            : "Pay After Service"
          }
        </strong>
      </p>

      <p>
        Subtotal:
        ₹${pricing.subtotal.toFixed(2)}
      </p>

      <p>
        Multi-Tank Discount:
        ₹${pricing.multiTankDiscount.toFixed(2)}
      </p>

      <p>
        Online Discount:
        ₹${pricing.onlineDiscount.toFixed(2)}
      </p>

      <h2>
        Final Amount:
        ₹${pricing.finalTotal.toFixed(2)}
      </h2>

    `

  });

}

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  () => {

    console.log(
      `VSH server running on port ${PORT}`
    );

  }
);
