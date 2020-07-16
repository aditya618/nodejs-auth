const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStratergy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./models/user');

mongoose.connect('mongodb://localhost/auth_demo',{useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
	console.log('DATABASE CONNECTED');
});

const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('express-session')({
	secret: 'Aditya is good guy',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//======================================================
// ROUTES
//======================================================

app.get('/',(req,res) => {
	res.render('home');
});

app.get('/secret',isLoggedIn, (req,res) => {
	res.render('secret');
});

//AUTH ROUTES

app.get('/register',(req,res) => {
	res.render('register');
});

app.post('/register', (req,res) => {
	User.register(new User({username: req.body.username}),req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req,res,() => {
			res.redirect('/secret');
		})
	});
});

//Login routes

app.get('/login',(req,res) => {
	res.render('login');
});

app.post('/login',passport.authenticate('local',{
	successRedirect: '/secret',
	failureRedirect: '/login'
}),(req,res) => {
	console.log('logged in');
});

//Logout

app.get('/logout', (req,res) => {
	req.logOut();
	res.redirect('/secret');
});

function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

app.listen(3000, () => {
	console.log('server listening on port 3000');
});