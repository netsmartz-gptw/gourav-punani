'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('IdentityVerfications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
          
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      street_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,   
        allowNull: false,  
      },
      state: {
        type: Sequelize.STRING,   
        allowNull: false,  
      },
      zip: {
        type: Sequelize.STRING,  
        allowNull: false,   
      },
      phone_no: {
        type: Sequelize.STRING, 
        allowNull: false,    
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('IdentityVerfications');
  }
};
