const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize(

  process.env.DB_DIALECT + '://' + 
  process.env.DB_USER + ':'+ 
  process.env.DB_PASSWORD + '@' + 
  process.env.DB_HOST + ':' + 
  process.env.DB_PORT + '/' + 
  process.env.DB_NAME
  
);

module.exports = {

  tryToConnect: function () {
    console.log('Try to connect...');
    sequelize.authenticate().then(response => {
      console.log('Connection has been established successfully.');
    }).catch(error => {
      console.error('Unable to connect to the database:', error);
    });
  },

  sequelize

}