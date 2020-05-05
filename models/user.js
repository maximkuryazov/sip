const { Sequelize, Model, DataTypes } = require('sequelize');
const { sequelize } = require("./connector");
const { Process } = require('./process');
var md5 = require('md5');

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type:  DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  password: DataTypes.TEXT,
});

User.hasMany(Process, { foreignKey: 'user_id' });

module.exports = {

  createUser: async (name, password) => {
    try {
      await sequelize.sync();
      let user = await User.create({ name, password: md5(password) });
      console.log("USER: ", user);
      await user.save();
      console.log(user.get("name"));
    } catch(e) {
      //console.error(e);
      throw new Error(e);
    }
  },

  authorizeUser: async (name, password, req) => {
    try {
      await sequelize.sync();
      let user = await User.findOne({ 
        where: {
          name,
          password: md5(password)
        }
      });
      console.log("Name: " + user.get("name"));
      console.log("Password: " + user.get("password"));
      if (name === user.get("name") && md5(password) === user.get("password")) {
        console.log("OK");
        req.session.user_id = user.get("id");
        req.session.save();
      }
    } catch(e) {
      console.error("Authorizarion error.");
      throw new Error(e);
    }
  },

  User

}