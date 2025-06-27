exports.generateRandomString = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

exports.pickFields = (obj, keys = []) =>
    keys.reduce((acc, key) => {
        if (obj[key] !== undefined) acc[key] = obj[key];
        return acc;
    }, {});
