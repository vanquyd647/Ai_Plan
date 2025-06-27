const dayjs = require('dayjs');

exports.now = () => dayjs().toISOString();

exports.addMinutes = (date, minutes) => dayjs(date).add(minutes, 'minute').toDate();

exports.formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => dayjs(date).format(format);

exports.diffInMinutes = (start, end) => dayjs(end).diff(dayjs(start), 'minute');
