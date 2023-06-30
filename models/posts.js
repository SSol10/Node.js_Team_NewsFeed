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
        targetKey: 'userId', 
        foreignKey: 'userId',
      });
      this.hasMany(models.Comments,{
        sourceKey:'postId',
        foreignKey:'postId'
      })
      this.belongsToMany(models.HashTags,{through:models.Posts_Tags})
    }
  }
  Posts.init(
    {
      postId: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "userId",
        },
        onDelete: "CASCADE",
      },
      postTitle: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      postContent: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      viewCount: {
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
