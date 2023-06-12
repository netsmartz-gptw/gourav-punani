'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class goals extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.goals.belongsTo(models.Users, { targetKey: 'uid', foreignKey: 'uid' });
			models.Users.hasMany(models.goals, { sourceKey: 'uid', foreignKey: 'uid' });
        }
    }
    goals.init(
        {
            uid: {
                type: DataTypes.STRING,
                allowNull: false,
                required: true,
                references: {
                    model: 'Users', // name of Target model
                    key: 'uid', // key in Target model that we're referencing
                },
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
                required: true
            },
            goalAmount: {
                type: DataTypes.FLOAT,
                allowNull: false,
                required: true
            },
            progressAmount: {
                type: DataTypes.FLOAT,
                required: true,
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: DataTypes.BOOLEAN,
                required: true,
                allowNull: false,
                defaultValue: 0
            },
            closureStatus: {
                type: DataTypes.BOOLEAN,
                required: true,
                allowNull: false,
                defaultValue: 0
            },
            weeklyAllocation: {
                type: DataTypes.INTEGER,
                allowNull: false,
                required: true,
                defaultValue: 0,
                comment:'in percentage'
            }
        }
        , {
            sequelize,
            modelName: 'goals',
            timestamps: true,
            paranoid: true

        });
    return goals;
};