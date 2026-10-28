import nodemailer from 'nodemailer';

import { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT } from '$env/static/private';
import { env } from '$env/dynamic/private';

/**
 * Where staff notifications (new order, contact message, delivery) are sent.
 *
 * This used to be `USER` from `$env/static/private` — never defined in `.env`, so
 * it silently resolved to the OS login name of whoever ran the build and every
 * admin email bounced. Falls back to the shop's own SMTP mailbox when unset.
 */
export const ADMIN_EMAIL = env.ADMIN_EMAIL || SMTP_USER;

/**
 * Escapes text for interpolation into an email's HTML. Every value that can come
 * from a visitor (names, subjects, messages, variant labels) must go through this,
 * or the contact form becomes a way to send arbitrary HTML in the shop's name.
 */
export const escapeHtml = (value: unknown) =>
	String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	secure: true,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASSWORD
	}
});

export const sendEmail = async (to: string, subject: string, html: string) => {
	await transporter.sendMail({
		from: SMTP_USER,
		to,
		subject,
		html
	});
};

const generateOrderTable = (items) => {
	const rows = items
		.map((item) => {
			let variation = '';
			let price = 0;

			// Case 1: price exists explicitly
			if (typeof item.price === 'number') {
				price = item.price;
				variation = item.amount;
			}
			// Case 2: amount = "price variation"
			else if (typeof item.amount === 'string') {
				const parts = item.amount.split(' ');
				price = Number(parts[0]) || 0;
				variation = parts.slice(1).join(' ') || '';
			}

			return `
                 <tr style="border-bottom: 1px solid #eee;">
                     <td style="padding: 10px; text-align: left;">
                         ${escapeHtml(item.name ?? `Product #${item.product}`)} ${variation ? `(${escapeHtml(variation)})` : ''}
                     </td>
                     <td style="padding: 10px; text-align: center;">
                         ${item.quantity}
                     </td>
                     <td style="padding: 10px; text-align: right;">
                         ${price} ETB
                     </td>
                 </tr>
             `;
		})
		.join('');
	return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif;">
            <thead>
                <tr style="background-color: #2596be; color: white;">
                    <th style="padding: 10px; text-align: left;">Item</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};

export const customerCheckoutTemplate = (orderId, items, total) => ({
	subject: `Order Confirmed - Lalo Fixtec (#${orderId})`,
	html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #eee;">
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <img src="https://lalofixtec.com/logo192.png" alt="Lalo Fixtec Logo" width="80" style="display: block; margin: 0 auto 10px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">Order Confirmed!</h1>
            </div>
            <div style="padding: 20px; color: #333;">
                <p>We’ve received your order <strong>#${orderId}</strong>. Our team is now processing your request.</p>
                ${generateOrderTable(items)}
                <div style="text-align: right; margin-top: 15px; font-weight: bold; font-size: 1.2em;">
                    Total: ${total} ETB
                </div>
            </div>
            <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #777; font-size: 12px;">
                Lalo Fixtec | Quality you can trust.
            </div>
        </div>
    `
});

export const adminCheckoutTemplate = (orderId, items, total) => ({
	subject: `New Order Alert: #${orderId}`,
	html: `
        <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #2596be;">New Order Received</h2>
            <p>A new order has been placed on the website. <strong>Order ID: #${orderId}</strong></p>
            ${generateOrderTable(items)}
            <p style="font-size: 18px;"><strong>Total Revenue: ${total} ETB</strong></p>
            <a href="lalofixtec.com/dashboard/orders"
               style="background: #2596be; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
               View in Dashboard
            </a>
        </div>
    `
});

export const customerWelcomeTemplate = (name: string) => ({
	subject: `Welcome to Lalo Fixtec, ${name}! 🎉`,
	html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #eee;">

            <!-- Header -->
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <img src="https://lalofixtec.com/logo192.png"
                     alt="Lalo Fixtec Logo"
                     width="80"
                     style="display: block; margin: 0 auto 10px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">
                    Welcome to Lalo Fixtec!
                </h1>
            </div>

            <!-- Body -->
            <div style="padding: 20px; color: #333;">
                <p>Hi <strong>${escapeHtml(name)}</strong>,</p>

                <p>
                    We’re excited to have you join <strong>Lalo Fixtec</strong> 🔧.
                    You're now part of a community that values reliable, high-quality technical solutions.
                </p>

                <p>
                    You can now browse our products, place orders, and enjoy a seamless service experience.
                </p>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://lalofixtec.com"
                       style="background: #2596be; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Start Shopping
                    </a>
                </div>

                <p>
                    If you have any questions, feel free to reply to this email — we’re happy to help!
                </p>

                <p style="margin-top: 20px;">
                    Warm regards,<br/>
                    <strong>Lalo Fixtec Team</strong>
                </p>
            </div>

            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #777; font-size: 12px;">
                Lalo Fixtec | Quality you can trust.
            </div>
        </div>
    `
});

export const customerDeliveredTemplate = (orderId, items, total) => ({
	subject: `Your Order Has Been Delivered! (#${orderId})`,
	html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #eee;">

            <!-- Header -->
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <img src="https://lalofixtec.com/logo192.png"
                     alt="Lalo Fixtec Logo"
                     width="80"
                     style="display: block; margin: 0 auto 10px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">
                    Order Delivered 🎉
                </h1>
            </div>

            <!-- Body -->
            <div style="padding: 20px; color: #333;">
                <p>Your order <strong>#${orderId}</strong> has been successfully delivered.</p>

                <p>We hope you're satisfied with your items! 😊</p>

                ${generateOrderTable(items)}

                <div style="text-align: right; margin-top: 15px; font-weight: bold; font-size: 1.2em;">
                    Total: ${total} ETB
                </div>

                <p style="margin-top: 20px;">
                    Thank you for choosing <strong>Lalo Fixtec</strong>. We look forward to serving you again!
                </p>
            </div>

            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #777; font-size: 12px;">
                Lalo Fixtec | Quality you can trust.
            </div>
        </div>
    `
});

export const adminDeliveredTemplate = (orderId, items, total) => ({
	subject: `Order Delivered: #${orderId}`,
	html: `
        <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #2596be;">Order Marked as Delivered</h2>

            <p>
                The following order has been successfully delivered.
                <strong>Order ID: #${orderId}</strong>
            </p>

            ${generateOrderTable(items)}

            <p style="font-size: 18px;">
                <strong>Total Value: ${total} ETB</strong>
            </p>

            <a href="https://lalofixtec.com/dashboard/orders"
               style="background: #2596be; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
               View in Dashboard
            </a>
        </div>
    `
});

export const adminContactTemplate = (data: {
	name: string;
	email: string;
	phoneNumber: string;
	subject: string;
	contactMessage?: string;
}) => ({
	subject: `📩 New Contact Message: ${data.subject}`,
	html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee;">

            <!-- Header -->
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">New Contact Message</h2>
            </div>

            <!-- Body -->
            <div style="padding: 20px;">
                <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(data.phoneNumber)}</p>
                <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>

                <div style="margin-top: 15px;">
                    <strong>Message:</strong>
                    <div style="background: #f9f9f9; padding: 15px; margin-top: 5px; border-radius: 5px;">
                        ${data.contactMessage ? escapeHtml(data.contactMessage).replace(/\n/g, '<br/>') : '<i>No message provided</i>'}
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <a href="mailto:${encodeURIComponent(data.email)}"
                       style="background: #2596be; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Reply to Customer
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                Lalo Fixtec - Contact Form Notification
            </div>
        </div>
    `
});

// Deliberately doesn't echo the visitor's subject or message: this goes to whatever
// address was typed into a public form, so anything quoted back is content a
// stranger can get delivered from the shop's mailbox.
export const customerContactTemplate = (name: string) => ({
	subject: `We received your message - Lalo Fixtec`,
	html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #eee;">

            <!-- Header -->
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <img src="https://lalofixtec.com/logo192.png"
                     alt="Lalo Fixtec Logo"
                     width="80"
                     style="display: block; margin: 0 auto 10px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">
                    Message Received ✅
                </h1>
            </div>

            <!-- Body -->
            <div style="padding: 20px; color: #333;">
                <p>Hi <strong>${escapeHtml(name)}</strong>,</p>

                <p>
                    Thank you for reaching out to <strong>Lalo Fixtec</strong>.
                    We’ve received your message.
                </p>

                <p>
                    Our team will review your message and get back to you as soon as possible.
                </p>

                <p style="margin-top: 20px;">
                    If your request is urgent, feel free to contact us directly.
                </p>

                <p style="margin-top: 20px;">
                    Best regards,<br/>
                    <strong>Lalo Fixtec Team</strong>
                </p>
            </div>

            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #777; font-size: 12px;">
                Lalo Fixtec | Quality you can trust.
            </div>
        </div>
    `
});

export const customerResetPasswordTemplate = (url: string) => ({
	subject: `Reset Your Password - Lalo Fixtec`,
	html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #eee;">
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <img src="https://lalofixtec.com/logo192.png"
                     alt="Lalo Fixtec Logo"
                     width="80"
                     style="display: block; margin: 0 auto 10px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">
                    Reset Your Password
                </h1>
            </div>

            <div style="padding: 20px; color: #333;">
                <p>Hello,</p>

                <p>
                    We received a request to reset the password for your
                    <strong>Lalo Fixtec</strong> account.
                </p>

                <p>
                    Click the button below to create a new password.
                </p>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="${url}"
                       style="background: #2596be; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Reset Password
                    </a>
                </div>

                <p>
                    If the button does not work, copy and paste this link into your browser:
                </p>

                <p style="word-break: break-all; color: #2596be;">
                    ${url}
                </p>

                <p>
                    If you did not request a password reset, you can safely ignore this email.
                    Your password will remain unchanged.
                </p>

                <p style="margin-top: 20px;">
                    Best regards,<br/>
                    <strong>Lalo Fixtec Team</strong>
                </p>
            </div>

            <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #777; font-size: 12px;">
                Lalo Fixtec | Quality you can trust.
            </div>
        </div>
    `
});

export const customerPaymentReceivedTemplate = (orderId: number, amount: number) => ({
	subject: `Payment Received - Lalo Fixtec (#${orderId})`,
	html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #eee;">
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <img src="https://lalofixtec.com/logo192.png" alt="Lalo Fixtec Logo" width="80" style="display: block; margin: 0 auto 10px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">Payment Received</h1>
            </div>
            <div style="padding: 20px; color: #333;">
                <p>We've received your online payment of <strong>${amount.toFixed(2)} ETB</strong> for order <strong>#${orderId}</strong>.</p>
                <p>Your order is fully paid — nothing more is due on delivery or pickup.</p>
            </div>
            <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #777; font-size: 12px;">
                Lalo Fixtec | Quality you can trust.
            </div>
        </div>
    `
});

export const customerDispatchedTemplate = (
	orderId: number,
	trip: {
		pickup: boolean;
		driverName: string | null;
		driverPhone: string | null;
		vehicle: string | null;
		expected: string | null;
		cashToCollect: number | null;
	}
) => ({
	subject: trip.pickup
		? `Your Order Is Ready for Pickup (#${orderId})`
		: `Your Order Is on Its Way! (#${orderId})`,
	html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #eee;">
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <img src="https://lalofixtec.com/logo192.png" alt="Lalo Fixtec Logo" width="80" style="display: block; margin: 0 auto 10px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">${trip.pickup ? 'Ready for Pickup' : 'Out for Delivery 🚚'}</h1>
            </div>
            <div style="padding: 20px; color: #333;">
                <p>Your order <strong>#${orderId}</strong> ${trip.pickup ? 'is ready to collect from our shop.' : 'has left our shop and is on its way to you.'}</p>
                ${trip.expected ? `<p>Expected ${trip.pickup ? 'from' : 'arrival'}: <strong>${escapeHtml(trip.expected)}</strong></p>` : ''}
                ${trip.driverName ? `<p>Driver: <strong>${escapeHtml(trip.driverName)}</strong>${trip.driverPhone ? ` — <a href="tel:${escapeHtml(trip.driverPhone)}">${escapeHtml(trip.driverPhone)}</a>` : ''}</p>` : ''}
                ${trip.vehicle ? `<p>Vehicle: ${escapeHtml(trip.vehicle)}</p>` : ''}
                ${trip.cashToCollect ? `<p>Amount to pay on delivery: <strong>${trip.cashToCollect.toFixed(2)} ETB</strong></p>` : ''}
                <p>Once you have it, you can confirm receipt from <a href="https://lalofixtec.com/account/orders">your account</a>.</p>
            </div>
            <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #777; font-size: 12px;">
                Lalo Fixtec | Quality you can trust.
            </div>
        </div>
    `
});

export const adminPaymentReceivedTemplate = (orderId: number, amount: number, txRef: string) => ({
	subject: `Online Payment Received: Order #${orderId}`,
	html: `
        <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #2596be;">Chapa Payment Confirmed</h2>
            <p>Order <strong>#${orderId}</strong> has been paid online: <strong>${amount.toFixed(2)} ETB</strong>.</p>
            <p style="color: #777; font-size: 13px;">Chapa reference: ${escapeHtml(txRef)}</p>
            <a href="https://lalofixtec.com/dashboard/orders"
               style="background: #2596be; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
               View in Dashboard
            </a>
        </div>
    `
});

/**
 * Sent when someone signs up with an email that already has guest orders. Those
 * orders are only moved into the account once this link is followed — see
 * `mergeGuestCustomer`.
 */
export const customerVerifyEmailTemplate = (url: string) => ({
	subject: `Confirm Your Email - Lalo Fixtec`,
	html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #eee;">
            <div style="background-color: #2596be; padding: 20px; text-align: center;">
                <img src="https://lalofixtec.com/logo192.png"
                     alt="Lalo Fixtec Logo"
                     width="80"
                     style="display: block; margin: 0 auto 10px;">
                <h1 style="color: white; margin: 0; font-size: 20px;">
                    Confirm Your Email
                </h1>
            </div>

            <div style="padding: 20px; color: #333;">
                <p>Hello,</p>

                <p>
                    Thanks for creating a <strong>Lalo Fixtec</strong> account. You have placed
                    orders with us before as a guest. Confirm this email address and we will
                    add those orders to your account.
                </p>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="${url}"
                       style="background: #2596be; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Confirm Email
                    </a>
                </div>

                <p>
                    If the button does not work, copy and paste this link into your browser:
                </p>

                <p style="word-break: break-all; color: #2596be;">
                    ${url}
                </p>

                <p>
                    If you did not create an account, you can safely ignore this email.
                </p>

                <p style="margin-top: 20px;">
                    Best regards,<br/>
                    <strong>Lalo Fixtec Team</strong>
                </p>
            </div>
        </div>
    `
});
