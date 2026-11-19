const crypto = require("crypto");


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
            "Email failed:",
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
   EMAIL HTML
========================================================= */

function createBookingEmail(data) {

    const customer =
        data.customer || {};

    const items =
        data.items || [];

    const pricing =
        data.pricing || {};

    const payment =
        data.payment || {};


    let rows = "";


    items.forEach(item => {

        rows += `

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
    background:#f4f7fb;
    font-family:Arial,Helvetica,sans-serif;
">

<div style="
    max-width:700px;
    margin:30px auto;
    background:white;
    border-radius:12px;
    overflow:hidden;
    border:1px solid #e5eaf0;
">

    <div style="
        background:#071b33;
        color:white;
        padding:25px;
    ">

        <h1 style="
            margin:0;
        ">
            Payment Successful
        </h1>

        <p style="
            color:#c9def0;
            margin-bottom:0;
        ">
            New confirmed VSH Tank Cleaning booking
        </p>

    </div>


    <div style="
        padding:25px;
    ">


        <h2>
            Customer Details
        </h2>


        <table
            width="100%"
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
                    <strong>Payment Method</strong>
                </td>

                <td style="padding:7px 0;">
                    Online Payment
                </td>
            </tr>


            <tr>
                <td style="padding:7px 0;">
                    <strong>Payment ID</strong>
                </td>

                <td style="padding:7px 0;">
                    ${payment.razorpay_payment_id || "-"}
                </td>
            </tr>


            <tr>
                <td style="padding:7px 0;">
                    <strong>Order ID</strong>
                </td>

                <td style="padding:7px 0;">
                    ${payment.razorpay_order_id || "-"}
                </td>
            </tr>

        </table>



        <h2 style="
            margin-top:30px;
        ">
            Services
        </h2>


        <table
            width="100%"
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

                ${rows}

            </tbody>

        </table>



        <div style="
            margin-top:25px;
            padding:18px;
            background:#eef7ff;
            border-radius:8px;
        ">

            <p>
                Subtotal:
                <strong>
                    ${money(
                        pricing.subtotal
                    )}
                </strong>
            </p>


            <p>
                Bulk Discount:
                <strong style="
                    color:#16a34a;
                ">
                    -${money(
                        pricing.quantityDiscount
                    )}
                </strong>
            </p>


            <p>
                Online Discount:
                <strong style="
                    color:#16a34a;
                ">
                    -${money(
                        pricing.onlineDiscount
                    )}
                </strong>
            </p>


            <hr style="
                border:0;
                border-top:1px solid #d8e5ef;
            ">


            <p style="
                font-size:20px;
            ">

                <strong>
                    Total Paid:
                </strong>

                <strong style="
                    color:#0878d1;
                ">
                    ${money(
                        pricing.total
                    )}
                </strong>

            </p>

        </div>


        <p style="
            color:#68778c;
            font-size:13px;
            margin-top:25px;
        ">
            This booking was successfully verified
            through Razorpay.
        </p>

    </div>

</div>

</body>

</html>

`;
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


        const payment =
            body.payment || {};


        const orderId =
            payment.razorpay_order_id;

        const paymentId =
            payment.razorpay_payment_id;

        const signature =
            payment.razorpay_signature;


        if (
            !orderId ||
            !paymentId ||
            !signature
        ) {

            return res.status(400).json({

                message:
                    "Missing Razorpay payment details."

            });
        }


        /* =================================================
           VERIFY SIGNATURE
        ================================================= */

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    RAZORPAY_KEY_SECRET
                )
                .update(
                    `${orderId}|${paymentId}`
                )
                .digest("hex");


        if (
            generatedSignature !==
            signature
        ) {

            return res.status(400).json({

                message:
                    "Payment verification failed."

            });
        }


        /* =================================================
           PAYMENT VERIFIED
        ================================================= */

        let emailSent = false;


        if (OWNER_EMAIL) {

            emailSent =
                await sendEmail({

                    to:
                        OWNER_EMAIL,

                    subject:
                        `Payment Received — VSH Tank Cleaning — ${body.customer?.name || "Customer"}`,

                    html:
                        createBookingEmail(
                            body
                        )

                });
        }


        console.log(
            "Payment verified successfully:",
            {
                orderId,
                paymentId,
                emailSent
            }
        );


        return res.status(200).json({

            success: true,

            message:
                "Payment verified and booking confirmed.",

            emailSent:
                emailSent

        });


    } catch (error) {

        console.error(
            "Verify payment error:",
            error
        );


        return res.status(500).json({

            message:
                error.message ||
                "Payment verification failed."

        });
    }
};
