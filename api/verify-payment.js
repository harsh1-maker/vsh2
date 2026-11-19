/* =========================================================
   VSH TANK CLEANING
   VERIFY RAZORPAY PAYMENT
========================================================= */

import crypto from "crypto";

export default async function handler(req, res) {

    /* =====================================================
       ALLOW POST ONLY
    ===================================================== */

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });

    }

    /* =====================================================
       CHECK SECRET
    ===================================================== */

    const keySecret =
        process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {

        console.error(
            "RAZORPAY_KEY_SECRET is missing."
        );

        return res.status(500).json({
            success: false,
            message:
                "Payment verification is not configured."
        });

    }

    try {

        /* =================================================
           READ BODY
        ================================================= */

        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body;

        if (!body) {

            return res.status(400).json({
                success: false,
                message: "Invalid request."
            });

        }

        /* =================================================
           PAYMENT DETAILS

           These are returned by Razorpay after payment.
        ================================================= */

        const payment =
            body.payment || {};

        const razorpayOrderId =
            payment.razorpay_order_id;

        const razorpayPaymentId =
            payment.razorpay_payment_id;

        const razorpaySignature =
            payment.razorpay_signature;

        /* =================================================
           VALIDATE REQUIRED FIELDS
        ================================================= */

        if (
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Missing Razorpay payment details."

            });

        }

        /* =================================================
           CREATE SIGNATURE

           Razorpay signature:

           HMAC SHA256(
               order_id + "|" + payment_id
           )
        ================================================= */

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    keySecret
                )
                .update(
                    razorpayOrderId +
                    "|" +
                    razorpayPaymentId
                )
                .digest("hex");

        /* =================================================
           COMPARE SIGNATURES SAFELY
        ================================================= */

        const receivedBuffer =
            Buffer.from(
                razorpaySignature
            );

        const generatedBuffer =
            Buffer.from(
                generatedSignature
            );

        if (
            receivedBuffer.length !==
            generatedBuffer.length
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification failed."

            });

        }

        const signatureValid =
            crypto.timingSafeEqual(
                receivedBuffer,
                generatedBuffer
            );

        /* =================================================
           INVALID PAYMENT
        ================================================= */

        if (!signatureValid) {

            console.error(
                "Invalid Razorpay signature."
            );

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification failed."

            });

        }

        /* =================================================
           PAYMENT VERIFIED
        ================================================= */

        const customer =
            body.customer ||
            {};

        const items =
            body.items ||
            [];

        const pricing =
            body.pricing ||
            {};

        /* =================================================
           BOOKING DATA

           At this point the Razorpay signature has
           been successfully verified.
        ================================================= */

        const booking = {

            paymentId:
                razorpayPaymentId,

            orderId:
                razorpayOrderId,

            customer:
                customer,

            items:
                items,

            pricing:
                pricing,

            paymentStatus:
                "paid",

            createdAt:
                new Date().toISOString()

        };

        /* =================================================
           LOG BOOKING

           You can later connect this to a database,
           email system, WhatsApp notification, etc.
        ================================================= */

        console.log(
            "VSH TANK CLEANING - PAID BOOKING:",
            JSON.stringify(
                booking,
                null,
                2
            )
        );

        /* =================================================
           SUCCESS RESPONSE
        ================================================= */

        return res.status(200).json({

            success: true,

            message:
                "Payment verified and booking confirmed.",

            booking: booking

        });

    } catch (error) {

        console.error(
            "VERIFY PAYMENT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Payment verification failed. Please contact VSH Tank Cleaning."

        });

    }

}
