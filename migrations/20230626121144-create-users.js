"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      USER_ID: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER,
      },
      EMAIL: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      PASSWORD: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      NICKNAME: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      NAME: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      USER_TMI: {
        type: Sequelize.STRING,
      },
      REFRESH_TOKEN:{
        allowNull:true,
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
    await queryInterface.dropTable("Users");
  },
};
