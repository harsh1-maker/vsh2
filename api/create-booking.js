const crypto = require("crypto");

const RAZORPAY_KEY_ID =
    process.env.RAZORPAY_KEY_ID;

const RAZORPAY_KEY_SECRET =
    process.env.RAZORPAY_KEY_SECRET;

const RESEND_API_KEY =
    process.env.RESEND_API_KEY;

const OWNER_EMAIL =
    process.env.OWNER_EMAIL;

const FROM_EMAIL =
    process.env.FROM_EMAIL;


/* =========================================================
   SEND EMAIL
========================================================= */

async function sendEmail({
    to,
    subject,
    html
}) {

    if (
        !RESEND_API_KEY ||
        !to ||
        !FROM_EMAIL
    ) {
        console.error(
            "Email configuration missing."
        );

        return false;
    }

    try {

        const response =
            await fetch(
                "https://api.resend.com/emails",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${RESEND_API_KEY}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            from:
                                FROM_EMAIL,

                            to: [to],

                            subject:
                                subject,

                            html:
                                html
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Resend error:",
                data
            );

            return false;
        }


        console.log(
            "Email sent:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "Email sending failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   FORMAT MONEY
========================================================= */

function money(amount) {

    return `₹${Number(amount || 0)
        .toLocaleString("en-IN")}`;
}


/* =========================================================
   CREATE BOOKING EMAIL
========================================================= */

function createBookingEmail(data) {

    const customer =
        data.customer || {};

    const items =
        data.items || [];

    const pricing =
        data.pricing || {};


    let itemRows = "";


    items.forEach(item => {

        itemRows += `
            <tr>

                <td style="
                    padding:10px;
                    border-bottom:1px solid #eee;
                ">
                    ${item.name}
                </td>

                <td style="
                    padding:10px;
                    border-bottom:1px solid #eee;
                    text-align:center;
                ">
                    ${item.quantity}
                </td>

                <td style="
                    padding:10px;
                    border-bottom:1px solid #eee;
                    text-align:right;
                ">
                    ${money(
                        Number(item.price) *
                        Number(item.quantity)
                    )}
                </td>

            </tr>
        `;
    });


    return `

<!DOCTYPE html>

<html>

<body style="
    margin:0;
    padding:0;
    background:#f4f7fb;
    font-family:Arial,Helvetica,sans-serif;
">

<div style="
    max-width:700px;
    margin:30px auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    border:1px solid #e5eaf0;
">

    <div style="
        background:#071b33;
        padding:25px;
        color:white;
    ">

        <h1 style="
            margin:0;
            font-size:24px;
        ">
            New VSH Tank Cleaning Booking
        </h1>

        <p style="
            margin:8px 0 0;
            color:#c9def0;
        ">
            A new booking has been submitted.
        </p>

    </div>


    <div style="
        padding:25px;
    ">

        <h2 style="
            color:#071b33;
        ">
            Customer Details
        </h2>


        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
                border-collapse:collapse;
            "
        >

            <tr>
                <td style="padding:7px 0;">
                    <strong>Name</strong>
                </td>

                <td style="padding:7px 0;">
                    ${customer.name || "-"}
                </td>
            </tr>


            <tr>
                <td style="padding:7px 0;">
                    <strong>Phone</strong>
                </td>

                <td style="padding:7px 0;">
                    ${customer.phone || "-"}
                </td>
            </tr>


            <tr>
                <td style="padding:7px 0;">
                    <strong>Address</strong>
                </td>

                <td style="padding:7px 0;">
                    ${customer.address || "-"}
                </td>
            </tr>


            <tr>
                <td style="padding:7px 0;">
                    <strong>Service Date</strong>
                </td>

                <td style="padding:7px 0;">
                    ${customer.serviceDate || "-"}
                </td>
            </tr>


            <tr>
                <td style="padding:7px 0;">
                    <strong>Payment</strong>
                </td>

                <td style="padding:7px 0;">
                    ${customer.paymentMethod || "-"}
                </td>
            </tr>

        </table>


        <h2 style="
            color:#071b33;
            margin-top:30px;
        ">
            Services
        </h2>


        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
                border-collapse:collapse;
                border:1px solid #e5eaf0;
            "
        >

            <thead>

                <tr style="
                    background:#f4f7fb;
                ">

                    <th style="
                        padding:10px;
                        text-align:left;
                    ">
                        Service
                    </th>

                    <th style="
                        padding:10px;
                        text-align:center;
                    ">
                        Qty
                    </th>

                    <th style="
                        padding:10px;
                        text-align:right;
                    ">
                        Amount
                    </th>

                </tr>

            </thead>


            <tbody>

                ${itemRows}

            </tbody>

        </table>


        <div style="
            margin-top:25px;
            padding:18px;
            background:#eef7ff;
            border-radius:8px;
        ">

            <p style="
                margin:5px 0;
            ">
                Subtotal:
                <strong>
                    ${money(pricing.subtotal)}
                </strong>
            </p>


            <p style="
                margin:5px 0;
            ">
                Discount:
                <strong style="color:#16a34a;">
                    -${money(pricing.quantityDiscount)}
                </strong>
            </p>


            <p style="
                margin:5px 0;
            ">
                Online Discount:
                <strong style="color:#16a34a;">
                    -${money(pricing.onlineDiscount)}
                </strong>
            </p>


            <hr style="
                border:0;
                border-top:1px solid #d8e5ef;
                margin:12px 0;
            ">


            <p style="
                margin:5px 0;
                font-size:20px;
            ">

                <strong>
                    Total:
                </strong>

                <strong style="
                    color:#0878d1;
                ">
                    ${money(pricing.total)}
                </strong>

            </p>

        </div>


        <p style="
            margin-top:25px;
            color:#68778c;
            font-size:13px;
        ">
            This booking was submitted through the
            VSH Tank Cleaning website.
        </p>

    </div>

</div>

</body>

</html>

`;
}


/* =========================================================
   RAZORPAY ORDER
========================================================= */

async function createRazorpayOrder(amount) {

    const auth =
        Buffer.from(
            `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
        ).toString("base64");


    const response =
        await fetch(
            "https://api.razorpay.com/v1/orders",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Basic ${auth}`,

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        amount:
                            Math.round(
                                Number(amount) * 100
                            ),

                        currency:
                            "INR",

                        receipt:
                            `vsh_${Date.now()}`,

                        notes: {
                            source:
                                "VSH Tank Cleaning website"
                        }

                    })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Razorpay order error:",
            data
        );

        throw new Error(
            data.error?.description ||
            "Unable to create Razorpay order."
        );
    }


    return data;
}


/* =========================================================
   MAIN HANDLER
========================================================= */

module.exports = async function handler(
    req,
    res
) {

    if (req.method !== "POST") {

        return res.status(405).json({
            message:
                "Method not allowed."
        });
    }


    try {

        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body;


        const customer =
            body.customer || {};

        const items =
            body.items || [];

        const pricing =
            body.pricing || {};


        if (
            !customer.name ||
            !customer.phone ||
            !customer.address ||
            !customer.serviceDate
        ) {

            return res.status(400).json({

                message:
                    "Please provide your name, phone number, address and service date."

            });
        }


        /* =================================================
           ONLINE PAYMENT
        ================================================= */

        if (
            customer.paymentMethod ===
            "online"
        ) {

            if (
                !RAZORPAY_KEY_ID ||
                !RAZORPAY_KEY_SECRET
            ) {

                return res.status(500).json({

                    message:
                        "Razorpay configuration is missing."

                });
            }


            const order =
                await createRazorpayOrder(
                    pricing.total
                );


            return res.status(200).json({

                success: true,

                key:
                    RAZORPAY_KEY_ID,

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency

            });
        }


        /* =================================================
           PAY AFTER SERVICE
        ================================================= */

        let emailSent = false;


        if (OWNER_EMAIL) {

            emailSent =
                await sendEmail({

                    to:
                        OWNER_EMAIL,

                    subject:
                        `New VSH Tank Cleaning Booking — ${customer.name}`,

                    html:
                        createBookingEmail(
                            body
                        )

                });
        }


        console.log(
            "Pay-after-service booking:",
            {
                customer,
                items,
                pricing,
                emailSent
            }
        );


        return res.status(200).json({

            success: true,

            message:
                "Booking confirmed successfully.",

            emailSent:
                emailSent

        });


    } catch (error) {

        console.error(
            "Create booking error:",
            error
        );


        return res.status(500).json({

            message:
                error.message ||
                "Booking could not be completed."

        });
    }
};
