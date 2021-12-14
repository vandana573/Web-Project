//// upload box image
module.exports.uploadReport = (req, res, next) => {
  var file = req.files.file;
  var filename = file.path.split("/").pop();

  var picture = filename.replace("uploads\\reports\\", "");

  var imgUrl = process.env.BASE_URI + picture;
  return res.status(200).json({
    status: true,
    picture,
    message: "Picture has been uploaded.",
    imageUrl: imgUrl,
  });
};

// upload doctor
module.exports.uploadDoctorImage = (req, res, next) => {
  var file = req.files.file;
  var filename = file.path.split("/").pop();

  var picture = filename.replace("uploads\\doctors\\", "");

  var imgUrl = process.env.BASE_URI + picture;
  return res.status(200).json({
    status: true,
    picture,
    message: "Picture has been uploaded.",
    imageUrl: imgUrl,
  });
};
