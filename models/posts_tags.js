"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Posts_Tags extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Posts_Tags.init(
        {
            postTagId: {
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
                type: DataTypes.INTEGER,
            },
            postId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "Posts",
                    key: "postId",
                },
                onDelete: "CASCADE",
            },
            tagId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "HashTags",
                    key: "tagId",
                },
                onDelete: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "Posts_Tags",
            timestamps: false,
            onDelete: "CASCADE",
        }
    );
    return Posts_Tags;
};
