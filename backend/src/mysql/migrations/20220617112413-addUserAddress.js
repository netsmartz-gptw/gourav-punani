'use strict';

module.exports = {
	async up (queryInterface, Sequelize) {
		return queryInterface.sequelize.transaction(t => {
			return Promise.all([
				queryInterface.addColumn('Users', 'streetAddress', {
					type: Sequelize.DataTypes.STRING
				}, { transaction: t }),
				queryInterface.addColumn('Users', 'city', {
					type: Sequelize.DataTypes.STRING(128),
				}, { transaction: t }),
				queryInterface.addColumn('Users', 'state', {
					type: Sequelize.DataTypes.STRING(64),
				}, { transaction: t }),
				queryInterface.addColumn('Users', 'zip', {
					type: Sequelize.DataTypes.STRING(32),
				}, { transaction: t }),
				queryInterface.addColumn('Users', 'phoneNo', {
					type: Sequelize.DataTypes.STRING(32),
				}, { transaction: t })
			]);
		});
	},

	async down (queryInterface, Sequelize) {
		return queryInterface.sequelize.transaction(t => {
			return Promise.all([
				queryInterface.removeColumn('Users', 'streetAddress', { transaction: t }),
				queryInterface.removeColumn('Users', 'city', { transaction: t }),
				queryInterface.removeColumn('Users', 'state', { transaction: t }),
				queryInterface.removeColumn('Users', 'zip', { transaction: t }),
				queryInterface.removeColumn('Users', 'phoneNo', { transaction: t })
			]);
		});
	}
};
