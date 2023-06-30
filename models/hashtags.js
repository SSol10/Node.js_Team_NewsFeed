"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HashTags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models){
      this.belongsToMany(models.Posts,{through:models.Posts_Tags});
    }
  }
  HashTags.init(
    {
      tagId: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
      },
      tagContent: {
        unique:true,
        allowNull: false,
        type: DataTypes.STRING,
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
      modelName: "HashTags",
    }
  );
  return HashTags;
};
