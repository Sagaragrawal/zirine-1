module.exports = function(sequelize, DataTypes){


	return sequelize.define('idea', {

		title: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [3]
			},
			unique: true
		},
		category:{
			type: DataTypes.STRING,
			allowNull: false
		},
		ideabody: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});
};