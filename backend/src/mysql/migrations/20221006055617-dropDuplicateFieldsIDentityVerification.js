'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.sequelize.transaction(t => {
			return Promise.all([
				queryInterface.removeColumn('IdentityVerfications', 'firstName', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'lastName', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'dob', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'email', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'streetAddress', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'city', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'state', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'zip', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'phoneNo', { transaction: t }),

			]);
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.sequelize.transaction(t => {
			return Promise.all([
				queryInterface.addColumn('IdentityVerfications', 'firstName', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'lastName', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'dob', {
					type: Sequelize.DataTypes.DATEONLY,
					allowNull: false,
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'email', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
					unique: true
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'streetAddress', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'city', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'state', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'zip', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'phoneNo', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
				}, { transaction: t })
			]);
		});
	}
};
