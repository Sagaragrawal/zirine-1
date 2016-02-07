var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var ejs = require('ejs');
var engine = require('ejs-mate');
var PORT = 3000 || process.env.PORT;


var app = express();
//app.use(bodyParser());
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));

// Engine
app.engine('ejs', engine);
app.set('view engine', 'ejs');


app.get('/', function (req, res){

	res.header('text/html').render('main/home_front');
});


app.listen(PORT, function (err){

	if(err) throw err;
	console.log('App listening at port ' + PORT);
})
