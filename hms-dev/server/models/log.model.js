const mongoose = require('mongoose');
var Log = new mongoose.Schema(
  {
    user_id: {
      type: String,
    },
    user_role: {
      type: String,
    },
    requested_data: {
      type: String,
    },
    old_data: {
      type: String,
    },
    action_message: {
      type: String,
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
    action_date: {
      type: String,
    },
  },
  {
    collection: 'tbl_log',
  }
);

mongoose.model('Log', Log);
