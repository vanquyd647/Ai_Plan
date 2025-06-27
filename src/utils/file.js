const fs = require('fs');
const path = require('path');

exports.saveToFile = (filename, content, dir = 'storage') => {
    const filePath = path.join(dir, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return filePath;
};

exports.readFile = (filePath) => {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
};

exports.deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
