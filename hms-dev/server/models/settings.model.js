const mongoose = require('mongoose');

var GeneralSettings = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    from_name: {
      type: String,
    },
    from_email: {
      type: String,
    },
    to_email: {
      type: String,
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
    modified_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Number,
      default: 1,
    },
  },
  {
    collection: 'tbl_generalsettings',
  }
);

mongoose.model('GeneralSettings', GeneralSettings);
