'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('goals', 'closureStatus', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      required: true,
      defaultValue: 0 //not closed
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('goals', 'closureStatus');
  }
};
