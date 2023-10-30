const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const api = require('./api');
const resendApi = require('./resend_api');
var jsonParser = bodyParser.json()
const User = require('./db/user');
const integrationApp = "PiperDrive";

User.createTable();

const app = express();
const port = 3000;

passport.use(
	'pipedrive',
	new OAuth2Strategy({
			authorizationURL: 'https://oauth.pipedrive.com/oauth/authorize',
			tokenURL: 'https://oauth.pipedrive.com/oauth/token',
			clientID: 'YOUR_CLIENT_ID' || '',
			clientSecret: 'YOUR_CLIENT_SECRET' || '',
			callbackURL: 'https://pipetoresend.fly.dev/auth/pipedrive/callback' || ''
			// callbackURL: 'http://localhost:3000/auth/pipedrive/callback' || ''
		}, async (accessToken, refreshToken, profile, done) => {
			const userInfo = await api.getUser(accessToken);
			const user = await User.add(
				userInfo.data.name,
				accessToken,
				refreshToken
			);

			done(null, { user });
		}
	)
);

app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(async (req, res, next) => {
	req.user = await User.getById(1);
	next();
});

app.get('/auth/pipedrive', passport.authenticate('pipedrive'));
app.get('/auth/pipedrive/callback', passport.authenticate('pipedrive', {
	session: false,
	failureRedirect: '/',
	successRedirect: '/'
}));
app.get('/', async (req, res) => {
	if (req.user.length < 1) {
		return res.redirect('/auth/pipedrive');
	}
	try {
		return res.send('Running');


	} catch (error) {
		console.log(error);

		return res.send('Failed to get person');
	}
});
app.get('/sendtoall', async (req, res) => {
	if (req.user.length < 1) {
		return res.redirect('/auth/pipedrive');
	}
	try {
		const subject = "PiperDrive Communication";
		const text = "this is an email to every contact.";
		const person = await api.getPerson(req.user[0].access_token);
		person.data.forEach(element => resendApi.sendEmail(integrationApp, element.first_name,element.last_name,element.email[0].value, subject, text ));
		return res.send(person.data);

	} catch (error) {
		console.log(error);

		return res.send('Failed to get Emails');
	}
});
app.post('/notification',  jsonParser, async (req, res) => {
	try {

		console.log(req.body.current.email[0].value);
		const subject = "PiperDrive Communication";
		const text = "our first contact was awesome.";
		const element = req.body.current;
		console.log(integrationApp, element.first_name,element.last_name,element.email[0].value, subject, text);
 		resendApi.sendEmail(integrationApp, element.first_name,element.last_name,element.email[0].value, subject, text );
		return res.status(200).end();
	} catch (error) {
		console.log(error);

		return res.send('Failed to get Emails for notification');
	}
});



app.listen(port, () => console.log(`App listening on port ${port}`));