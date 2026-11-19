/* =========================================================
   VSH TANK CLEANING
   CREATE BOOKING / RAZORPAY ORDER
========================================================= */

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
       CHECK RAZORPAY CREDENTIALS
    ===================================================== */

    const keyId =
        process.env.RAZORPAY_KEY_ID;

    const keySecret =
        process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {

        console.error(
            "Razorpay environment variables are missing."
        );

        return res.status(500).json({
            success: false,
            message:
                "Payment system is not configured. Please contact VSH Tank Cleaning."
        });

    }

    try {

        /* =================================================
           READ REQUEST
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

        const customer =
            body.customer || {};

        const items =
            Array.isArray(body.items)
                ? body.items
                : [];

        const pricing =
            body.pricing || {};

        const paymentMethod =
            customer.paymentMethod ||
            body.paymentMethod ||
            "after-service";

        /* =================================================
           BASIC VALIDATION
        ================================================= */

        if (
            !customer.name ||
            !customer.phone ||
            !customer.address ||
            !customer.serviceDate
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please provide your name, phone number, address and service date."
            });

        }

        if (items.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });

        }

        /* =================================================
           SERVER-SIDE PRICE LIST

           IMPORTANT:
           Do not trust prices sent by the browser.
        ================================================= */

        const PRICE_LIST = {

            "Overhead Tank Cleaning - 1000 Litres": 499,
            "Overhead Tank Cleaning - 2000 Litres": 699,
            "Overhead Tank Cleaning - 3000 Litres": 899,
            "Overhead Tank Cleaning - 5000 Litres": 1199,

            "Underground Tank Cleaning - 1000 Litres": 799,
            "Underground Tank Cleaning - 2000 Litres": 999,
            "Underground Tank Cleaning - 3000 Litres": 1299,
            "Underground Tank Cleaning - 5000 Litres": 1699

        };

        /* =================================================
           CALCULATE ORDER FROM SERVER-SIDE PRICES
        ================================================= */

        let subtotal = 0;
        let totalItems = 0;

        const verifiedItems = [];

        for (const item of items) {

            const name = item.name;

            const quantity =
                Math.max(
                    1,
                    Number(item.quantity) || 1
                );

            if (
                !PRICE_LIST.hasOwnProperty(name)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Invalid service: ${name}`
                });

            }

            const price =
                PRICE_LIST[name];

            subtotal +=
                price * quantity;

            totalItems += quantity;

            verifiedItems.push({

                name: name,

                price: price,

                quantity: quantity

            });

        }

        /* =================================================
           BULK DISCOUNT
        ================================================= */

        let discountRate = 0;

        if (totalItems >= 5) {

            discountRate = 0.15;

        } else if (totalItems >= 3) {

            discountRate = 0.12;

        } else if (totalItems >= 2) {

            discountRate = 0.10;

        }

        const quantityDiscount =
            subtotal * discountRate;

        /* =================================================
           ONLINE PAYMENT DISCOUNT
        ================================================= */

        let onlineDiscount = 0;

        if (
            paymentMethod === "online"
        ) {

            onlineDiscount =
                (
                    subtotal -
                    quantityDiscount
                ) * 0.05;

        }

        /* =================================================
           FINAL TOTAL
        ================================================= */

        const total =
            subtotal -
            quantityDiscount -
            onlineDiscount;

        /* =================================================
           AFTER-SERVICE BOOKING

           No Razorpay order is needed.
        ================================================= */

        if (
            paymentMethod !== "online"
        ) {

            console.log(
                "VSH Tank Cleaning booking:",
                {
                    customer,
                    items: verifiedItems,
                    pricing: {
                        subtotal,
                        quantityDiscount,
                        onlineDiscount,
                        total
                    }
                }
            );

            return res.status(200).json({

                success: true,

                bookingType:
                    "after-service",

                message:
                    "Booking created successfully.",

                booking: {

                    customer,

                    items:
                        verifiedItems,

                    pricing: {

                        subtotal:
                            subtotal,

                        quantityDiscount:
                            quantityDiscount,

                        onlineDiscount:
                            0,

                        total:
                            total

                    }

                }

            });

        }

        /* =================================================
           ONLINE PAYMENT

           Razorpay amount must be in paise.
        ================================================= */

        const amountInPaise =
            Math.round(
                total * 100
            );

        if (amountInPaise <= 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment amount."
            });

        }

        /* =================================================
           CREATE RAZORPAY ORDER
        ================================================= */

        const razorpayResponse =
            await fetch(
                "https://api.razorpay.com/v1/orders",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Basic " +
                            Buffer.from(
                                `${keyId}:${keySecret}`
                            ).toString("base64")

                    },

                    body: JSON.stringify({

                        amount:
                            amountInPaise,

                        currency:
                            "INR",

                        receipt:
                            `VSH-${Date.now()}`,

                        notes: {

                            customerName:
                                customer.name,

                            customerPhone:
                                customer.phone,

                            serviceDate:
                                customer.serviceDate

                        }

                    })

                }
            );

        const razorpayData =
            await razorpayResponse.json();

        /* =================================================
           RAZORPAY ERROR
        ================================================= */

        if (!razorpayResponse.ok) {

            console.error(
                "Razorpay order error:",
                razorpayData
            );

            return res.status(
                razorpayResponse.status
            ).json({

                success: false,

                message:
                    razorpayData.error?.description ||
                    "Unable to create Razorpay order."

            });

        }

        /* =================================================
           RETURN ORDER TO FRONTEND
        ================================================= */

        return res.status(200).json({

            success: true,

            key:
                keyId,

            amount:
                razorpayData.amount,

            currency:
                razorpayData.currency,

            orderId:
                razorpayData.id,

            booking: {

                customer,

                items:
                    verifiedItems,

                pricing: {

                    subtotal:
                        subtotal,

                    quantityDiscount:
                        quantityDiscount,

                    onlineDiscount:
                        onlineDiscount,

                    total:
                        total

                }

            }

        });

    } catch (error) {

        console.error(
            "CREATE BOOKING ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to create booking. Please try again."

        });

    }

}
