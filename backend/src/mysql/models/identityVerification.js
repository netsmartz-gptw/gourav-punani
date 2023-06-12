'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class IdentityVerfications extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	IdentityVerfications.init({
		uid           : { type: DataTypes.STRING, allowNull: false },
		cipStatus     : { type: DataTypes.STRING(32), allowNull: true }
	}, {
		sequelize,
		modelName: 'IdentityVerfications',
	});
	return IdentityVerfications;
};