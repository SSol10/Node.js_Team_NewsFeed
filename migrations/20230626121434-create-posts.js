"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Posts", {
      POST_ID: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER,
      },
      USER_ID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      POST_TITLE: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      POST_CONTENT: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      VIEW_CONTENT: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Posts");
  },
};
