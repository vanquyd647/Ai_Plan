const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

exports.hashPassword = async (plainText) => {
    return bcrypt.hash(plainText, SALT_ROUNDS);
};

exports.comparePassword = async (plainText, hash) => {
    return bcrypt.compare(plainText, hash);
};
