'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('IdentityVerfications', 'cipStatus', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('IdentityVerfications', 'cipStatus', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: '"0" for not pending verification and "1" for completed verification'
    });
  }
};
