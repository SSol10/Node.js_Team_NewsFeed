"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
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

      this.belongsTo(models.Posts, { 
        targetKey: 'POST_ID', 
        foreignKey: 'POST_ID',
      });

    }
  }
  Comments.init(
    {
      COMMENT_ID: {
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
      POST_ID: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "Posts",
          key: "post_id",
        },
        onDelete: "CASCADE",
      },
      COMMENT_CONTENT: {
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Comments",
    }
  );
  return Comments;
};
