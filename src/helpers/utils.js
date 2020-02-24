
exports.orderValuesForHash = (obj) =>
    Object.keys(obj)
        .sort()
        .map((key) => (Buffer.isBuffer(obj[key]) ? obj[key] : obj[key] + ''));
