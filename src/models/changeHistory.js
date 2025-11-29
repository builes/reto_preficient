import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config.js';

class ChangeHistory extends Model {
  static associate(models) {
    // belongsTo relationship with ResourceData
    ChangeHistory.belongsTo(models.ResourceData, {
      foreignKey: 'resourceId',
      as: 'resource'
    });
  }
}

ChangeHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'resource_data',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'ChangeHistory',
    tableName: 'change_history',
    timestamps: true,
    underscored: false
  }
);

export default ChangeHistory;
