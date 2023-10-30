const { Resend } = require("resend");

async function sendEmail(integrationApp, firstName, lastName, destEmail, subject, text) {
const resend = new Resend('YOUR_RESEND_KEY');

await resend.emails.send({
from: integrationApp+" <onboarding@resend.dev>",
to: destEmail,
subject: subject,
text: "Hi "+ firstName + " " + lastName + ", " + text,
headers: {
    'X-Entity-Ref-ID': '123456789',
  },
});

}

module.exports = {
	sendEmail
};