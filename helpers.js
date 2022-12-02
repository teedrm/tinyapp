// Check if email used for registration already exist/used
const checkEmailAvailable = (email, database) => {
    for (const user in database) {
      if (email === database[user].email) {
        return database[user].id;
      }
    }
};

module.exports = { checkEmailAvailable };