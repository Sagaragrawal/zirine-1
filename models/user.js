var bcrypt = require('bcrypt');
var _ = require('underscore');
var Promise = require('promise');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {

	return user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, // Makes sure there is no other value in
			// database with same email.
			validate: {
				isEmail: true
					// Checks for Email stuff
			}
		},
		username:{
			type: DataTypes.STRING
		},
		salt: {
			type: DataTypes.STRING
				// If two people passwords are same then it 
				// save collisions.
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			// VIRTUAL doesn't get strored in database 
			// but it is accessible.
			allowNull: false,
			validate: {
				len: [7, 100] // See validate RE (document)
			},
			// Set is called with password value
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				// Takes in no. of characters for salt
				var hashedPassword = bcrypt.hashSync(value, salt);
				// Takes 2 arguments actual value and salt(characters added)

				// Logging user in using password
				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		// Sequelize Hooks
		// It lets you run a code before or after an event has happened.
		// Just like triggers.
		hooks: {
			beforeValidate: function(user, options) {

				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},

		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
			},

			// Creating a token so that user can make multiple
			// request
			generateToken: function(type) {
				// Checking if type is a string
				if (!_.isString(type)) {
					return undefined;
				}

				// try catch if anything goes wrong
				try {

					// Converting into string bcs AES encrypt string data
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					// encrypt take 2 arguments data and key	
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!').toString();

					// Generating token
					// It requires the data mapped and a jwt passed
					var token = jwt.sign({
						token: encryptedData
					}, 'qwerty098');

					return token;
				} catch (e) {
					return undefined;
				}
			}
		},
		classMethods: {
			authenticate: function(body) {

				return new Promise(function(resolve, reject) {


					console.log(typeof body.email + ' ' + typeof body.password);

					if (typeof body.email === 'string' && typeof body.password === 'string') {

						user.findOne({
							where: {
								email: body.email
							}
						}).then(function(user) {
							if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
								// 401 Authentication exist but fail
								return reject();
							}

							// Password Validation in callback now
							// compareSync takes two arguments.
							// Passed in password and hash
							resolve(user);
							//res.json(user.toPublicJSON());

						}, function(e) {
							reject();
						});

					} else {

						return reject();
					}
				});
			},

			// Custom function for middleware.requireAuthentication
			findByToken: function(token) {
				return new Promise(function(resolve, reject) {

					try {
						var decodedJWT = jwt.verify(token, 'qwerty098');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function(user) {

							if (!user) {
								reject();
							}

							resolve(user);
						}, function(e) {
							reject();
						})
					} catch (e) {
						reject();
					}
				});
			}
		}
	});

	//return user;
};