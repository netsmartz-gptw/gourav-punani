'use strict';

module.exports = {
	async up (queryInterface, Sequelize) {
		return queryInterface.sequelize.transaction(t => {
			return Promise.all([
				queryInterface.removeColumn('IdentityVerfications', 'street_address', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'phone_no', { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'streetAddress', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
					after: "dob"
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'phoneNo', {
					type: Sequelize.DataTypes.STRING(32),
					allowNull: false,
					after: "zip"
				}, { transaction: t })
			]);
		});
	},

	async down (queryInterface, Sequelize) {
		return queryInterface.sequelize.transaction(t => {
			return Promise.all([
				queryInterface.removeColumn('IdentityVerfications', 'streetAddress', { transaction: t }),
				queryInterface.removeColumn('IdentityVerfications', 'phoneNo', { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'street_address', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
					after: "dob"
				}, { transaction: t }),
				queryInterface.addColumn('IdentityVerfications', 'phone_no', {
					type: Sequelize.DataTypes.STRING,
					allowNull: false,
					after: "zip"
				}, { transaction: t })
			]);
		});
	}
};
