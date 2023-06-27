'use strict';

const config = require('../config/config.json')[env];
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config);  // mysql 연결 객체 생성
const env = process.env.NODE_ENV || 'development'; // 지정된 환경변수가 없으면 'development'로 지정
const db = {};


// db객체에 Sequelize 패키지 넣기
// 연결 객체를 나중에 재사용하기 위해 넣어줌
db.sequelize = sequelize;

// db객체에 Sequelize 인스턴스 넣기
db.Sequelize = Sequelize;

module.exports = db;
