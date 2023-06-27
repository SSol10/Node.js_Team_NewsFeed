"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, { 
        targetKey: 'USER_ID', 
        foreignKey: 'USER_ID',
      });
      this.hasMany(models.Comments,{
        sourceKey:'POST_ID',
        foreignKey:'POST_ID'
      })

    }
  }
  Posts.init(
    {
      POST_ID: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
      },
      USER_ID: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      POST_TITLE: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      POST_CONTENT: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      VIEW_CONTENT: {
        defaultValue: 0,
        type: DataTypes.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Posts",
    }
  );
  return Posts;
};
