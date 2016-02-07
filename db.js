var Sequelize = require('sequelize');

var env = process.env.NODE_ENV || 'development';

var sequelize;

if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	var sequelize = new Sequelize(undefined, undefined, undefined, {

		dialect: 'sqlite',
		storage: __dirname + '/data/dev-zirine.sqlite'
	});


}


var db = {};

db.user = sequelize.import(__dirname + '/models/user.js');
//db.session = sequelize.import(__dirname + '/models/session.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//Association
db.token.belongsTo(db.user);


module.exports = db;