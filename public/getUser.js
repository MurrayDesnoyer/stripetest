const { userStore } = require('./addUser');
console.log('userStore:',userStore)
function getUser() {
  return userStore;
}

module.exports = getUser;
