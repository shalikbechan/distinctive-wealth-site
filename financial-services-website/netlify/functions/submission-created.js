/**
 * Netlify Form submission handler for the contact form.
 *
 * Sends:
 * 1. A notification to the business.
 * 2. A confirmation email to the visitor.
 *
 * Required Netlify environment variables:
 *   RESEND_API_KEY
 *   CONTACT_NOTIFY_EMAIL
 *   CONTACT_FROM_EMAIL
 */

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const payload = body.payload || {};
    const data = payload.data || {};

    // Ignore honeypot/spam submissions.
    if (data["bot-field"]) {
      return { statusCode: 200, body: "Ignored (spam)" };
    }

    // Only process the contact form.
    if (payload.form_name && payload.form_name !== "contact") {
      return { statusCode: 200, body: "Ignored (different form)" };
    }

    const firstName = String(data.firstName || "").trim();
    const surname = String(data.surname || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || "").trim();
    const enquiry = String(data.enquiry || "").trim();
    const message = String(data.message || "").trim();
    const fullName = [firstName, surname].filter(Boolean).join(" ") || "A visitor";

    const apiKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.CONTACT_NOTIFY_EMAIL || "info@distinctivewealth.co.za";
    const fromEmail = process.env.CONTACT_FROM_EMAIL || "Distinctive Wealth Management <onboarding@resend.dev>";

    if (!apiKey) {
      console.error("Missing RESEND_API_KEY environment variable.");
      return { statusCode: 500, body: "Email service not configured" };
    }

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const detailsRows = [
      ["Name", fullName],
      ["Email", email],
      ["Phone", phone],
      ["Enquiry Type", enquiry],
      ["Message", message]
    ]
      .map(([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`
      )
      .join("");

    async function sendEmail(emailPayload) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API error (${response.status}): ${errorText}`);
      }

      return response.json();
    }

    // 1. Notify Distinctive Wealth Management.
    await sendEmail({
      from: fromEmail,
      to: [notifyTo],
      ...(email ? { reply_to: email } : {}),
      subject: `${fullName} has contacted us regarding ${enquiry || "a general enquiry"}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#222;line-height:1.6;">
          <h2>New website enquiry</h2>
          <p><strong>${escapeHtml(fullName)}</strong> has contacted Distinctive Wealth Management regarding <strong>${escapeHtml(enquiry || "a general enquiry")}</strong>.</p>
          <table style="border-collapse:collapse;font-size:14px;">${detailsRows}</table>
        </div>
      `
    });

    // 2. Confirm receipt to the visitor.
    if (email) {
      await sendEmail({
        from: fromEmail,
        to: [email],
        subject: "We've received your enquiry - Distinctive Wealth Management",
        html: `
          <div style="font-family:Arial,sans-serif;color:#222;line-height:1.6;">
            <p>Hi ${escapeHtml(firstName || "there")},</p>
            <p>Thank you for contacting Distinctive Wealth Management. Your enquiry has been received successfully, and a member of our team will be in touch with you shortly.</p>
            <p><strong>Summary of your enquiry:</strong></p>
            <table style="border-collapse:collapse;font-size:14px;">${detailsRows}</table>
            <p>Kind regards,<br>Distinctive Wealth Management</p>
          </div>
        `
      });
    }

    return { statusCode: 200, body: "Emails sent" };
  } catch (error) {
    console.error("submission-created error:", error);
    return { statusCode: 500, body: "Error sending emails" };
  }
};
