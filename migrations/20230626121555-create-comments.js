"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Comments", {
      COMMENT_ID: {
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
      POST_ID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Posts",
          key: "post_id",
        },
        onDelete: "CASCADE",
      },
      COMMENT_CONTENT: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Comments");
  },
};
