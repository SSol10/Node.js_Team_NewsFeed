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
        sourceKey: "userId",
        foreignKey: "userId",
      });
      this.hasMany(models.Comments, {
        sourceKey: "userId",
        foreignKey: "userId",
      });
      this.hasMany(models.Likes, {
        sourceKey: "userId",
        foreignKey: "userId",
      });
    }
  }
  Users.init(
    {
      userId: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
        validate: {
          isUnique: (value, next) => {
            unique_validation.call(Users,"email", 100, value, next);
          }, //email중첩 100
        },
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
        set(value) {
          //해쉬화에 시간이 오래걸리므로, 유효성검사를 모두 통과하면 실행되도록 set 함수 수행
          //만약 데이터를 저장하기 이전에 로직을 수행하고싶으면 beforeCreate사용
          const hashedPassword = bcrypt.hashSync(value, saltRounds);
          console.log(hashedPassword) //set함수를 호출한 쪽에서 error핸들링
          this.setDataValue("password", hashedPassword);
        },
      },
      nickname: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
        validate: {
          isUnique: (value, next) => {
            unique_validation.call(Users,"nickname", 101, value, next);
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
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      TMI: {
        type: DataTypes.STRING,
      },
      refreshToken: {
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