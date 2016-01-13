module.exports = {
  up: function(v) {
    return v.toUpperCase();
  },
  date: function(v) {
    return v.replace(/[^\w:]/g, ' ').replace(/\s\s+/g, ' ').trim();
  },
  time: function(v) {
    return v.replace(/\b(am|pm|hrs?)\b/gi, '').replace(/\s\s+/g, ' ').trim();
  }
};
