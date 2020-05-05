const { Sequelize, Model, DataTypes } = require('sequelize');
const { sequelize } = require("./connector");

const Process = sequelize.define("process", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pid: DataTypes.INTEGER,
  user_id: DataTypes.INTEGER
});

(async () => {
  await sequelize.sync();
})();

module.exports = {

  createProcess: async (pid, user_id) => {
    console.log("PID: ", pid);
    try {
      let processInstance = await Process.create({ pid, user_id });
      await processInstance.save();
      console.log("PID: ", processInstance.get("pid"));
    } catch(e) {
      console.error(e);
      throw new Error(e);
    }
  
  },

  killProcess: async (pid) => {
    try {
      await Process.destroy({
        where: {
          pid
        }
      });
    } catch(e) {
      console.error(e);
    }
  },

  Process

}