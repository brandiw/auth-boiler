'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      // Add columns facebookId and facebookToken to the users table
      return queryInterface.addColumn('users', 'facebookId', Sequelize.STRING).then(function(){
        return queryInterface.addColumn('users', 'facebookToken', Sequelize.STRING);
      });
  },

  down: (queryInterface, Sequelize) => {
      // Remove columns facebookId and facebookToken from the users table
      return queryInterface.removeColumn('users', 'facebookId').then(function(){
        return queryInterface.removeColumn('users', 'facebookToken');
      });
  }
};
