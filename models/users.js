"use strict";
const { Model } = require("sequelize");
const unique_validation = require("../utils/unique_validation");
const bcrypt = require("bcrypt");
const saltRounds = 10;
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Posts, {
        sourceKey: "USER_ID",
        foreignKey: "USER_ID",
      });
      this.hasMany(models.Comments, {
        sourceKey: "USER_ID",
        foreignKey: "USER_ID",
      });
      this.hasMany(models.Likes, {
        sourceKey: "USER_ID",
        foreignKey: "USER_ID",
      });
    }
  }
  Users.init(
    {
      USER_ID: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
      },
      EMAIL: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
        validate: {
          isUnique: (value, next) => {
            unique_validation.call(Users,"EMAIL", 100, value, next);
          }, //email중첩 100
        },
      },
      PASSWORD: {
        allowNull: false,
        type: DataTypes.STRING,
        set(value) {
          //해쉬화에 시간이 오래걸리므로, 유효성검사를 모두 통과하면 실행되도록 set 함수 수행
          //만약 데이터를 저장하기 이전에 로직을 수행하고싶으면 beforeCreate사용
          const hashedPassword = bcrypt.hashSync(value, saltRounds);
          console.log(hashedPassword) //set함수를 호출한 쪽에서 error핸들링
          this.setDataValue("PASSWORD", hashedPassword);
        },
      },
      NICKNAME: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
        validate: {
          isUnique: (value, next) => {
            unique_validation.call(Users,"NICKNAME", 101, value, next);
          },
          // isUnique: function (nickname, next){
          //   USERS.findOne(({NICKNAME:nickname})).then(user=>{
          //     if(user){
          //       throw new Error({code:101})
          //     }
          //     next();
          //   }).catch(err=>{
          //     return next(err);
          //   })
          // }
        },
      },
      NAME: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      USER_TMI: {
        type: DataTypes.STRING,
      },
      REFRESH_TOKEN: {
        allowNull: true,
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
      modelName: "Users",
    }
  );
  return Users;
};