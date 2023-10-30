# Example app for Pipedrive
 In this app, you can send emails using Resend Api to all of your Piperdrive contacts, and send an welcome email when a new contact is created. 

## Installation and usage
* Create a test app in [Developer Hub](https://app.pipedrive.com/developer-hub) with the following callback URL: `http://localhost:3000/auth/pipedrive/callback`
* Run `npm install`
* edit the `clientID` and `clientSecret` values on index.js
* edit the `YOUR_RESEND_KEY` on resend_api.js
* Run `node index.js` and open http://localhost:3000
