const mongoose = require("mongoose");
const Error = mongoose.model("Error");
const async = require("async");

module.exports.errorM = function (res, arg) {
  var error = new Error();
  error.action_type = arg.action_type;
  error.error_data = JSON.stringify(arg.error_data);
  error.save((err, doc) => {

  });
};
