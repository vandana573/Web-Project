const mongoose = require('mongoose');
var Error = new mongoose.Schema(
  {
    action_type: {
      type: String,
    },
    error_data: {
      type: String,
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'tbl_system_errors',
  }
);

mongoose.model('Error', Error);
