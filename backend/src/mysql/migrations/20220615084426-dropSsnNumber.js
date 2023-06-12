'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('IdentityVerfications', 'uid', {
      type: Sequelize.STRING,
      references: {
        model: 'Users',
        key: 'uid'
      }
     });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('IdentityVerfications', 'uid');
  }
};
