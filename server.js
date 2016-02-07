var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var ejs = require('ejs');
var engine = require('ejs-mate');
var flash = require('express-flash');
var _ = require('underscore');
var db = require('./db.js');
var PORT = 3000 || process.env.PORT;

var bcrypt = require('bcrypt');


var app = express();
//app.use(bodyParser());
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// Engine
app.engine('ejs', engine);
app.set('view engine', 'ejs');



// All routes have user object
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});


app.get('/', function (req, res){

	res.render('main/home_front', {
		message: ''
	});
});




// POST /users
app.post('/users', function (req, res){

	var body = _.pick(req.body, 'email', 'password', 'username');

	
	db.user.create({
		username: body.username,
		email: body.email,
		password: body.password,
	}).then(function(user) {

		res.render('accounts/success_creation' , {
			message: user.username + "'s account has been generated"
		});
	}).catch(function(e) {
		res.render('accounts/404');
	});

});

// POST /login

app.post('/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	// Converting long route into autheticate function
	db.user.authenticate(body).then(function(user) {

		var token = user.generateToken('authentication');
		userInstance = user;
		return db.token.create({
			token: token,
			userId: user.id
		});
		

	}).then(function(token){
		res.render('accounts/success_creation', {
			message: 'Successfully Logged in'
		});
	}).catch(function(e) {

		res.render('main/home_front', {
			message: 'Please provide valid Email Id or Password'
		});
	});

});



db.sequelize.sync({force: true}).then(function() {

	// Server will start in db
	// after db starts server will start
	app.listen(PORT, function (err) {

		if(err){ 	throw(err) };
		console.log('Server Running at ' + PORT);
	});
});
