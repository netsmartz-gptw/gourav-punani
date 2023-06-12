'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('goals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true,
        references: {
          model: 'Users', // name of Target model
          key: 'uid', // key in Target model that we're referencing
        },
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
      },
      goalAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        required: true
      },
      progressAmount: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue: 0 //active
      },
      createdAt: {
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updatedAt: {
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
        allowNull: false,
      },
    }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('goals')
  }
};
