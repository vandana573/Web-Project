const mongoose = require("mongoose");
// mongoose.set('useCreateIndex', true);

mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, db) => {
    if (!err) {
      console.log("MongoDB connection succeeded.");
    } else {
      console.log(
        "Error in MongoDB connection : " + JSON.stringify(err, undefined, 2)
      );
    }
  }
);

require("../models/user.model");
require("../models/doctor.model");
require("../models/appointment.model");

require("../models/log.model");
require("../models/error.model");
