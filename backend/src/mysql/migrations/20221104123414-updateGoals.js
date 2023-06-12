'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.addColumn('goals', 'deletedAt', {
        type: Sequelize.DATE,
      });
      await queryInterface.addColumn('goals', 'weeklyAllocation', {
        type: Sequelize.INTEGER,
        allowNull: false,
        required: true,
        comment: 'in percentage',
        defaultValue:0
      });
      await queryInterface.changeColumn('goals', 'goalAmount',{
        type: Sequelize.FLOAT,
        allowNull: false,
        required: true
      });
      await queryInterface.changeColumn('goals', 'progressAmount',{
        type: Sequelize.FLOAT,
        allowNull: false,
        required: true,
        defaultValue:0
      })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('goals', 'deletedAt');
    await queryInterface.removeColumn('goals', 'weeklyAllocation');
    await queryInterface.changeColumn('goals', 'goalAmount',{
      type: Sequelize.INTEGER,
      allowNull: false,
      required: true
    });
    await queryInterface.changeColumn('goals', 'progressAmount',{
      type: Sequelize.INTEGER,
      allowNull: false,
      required: true,
      defaultValue:0
    })
  }
};
