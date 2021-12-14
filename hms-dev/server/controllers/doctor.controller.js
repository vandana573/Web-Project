const mongoose = require("mongoose");
const error = require("../controllers/error.controller");
const logger = require("../controllers/log.controller");
const _ = require("lodash");
const DoctorModel = mongoose.model("doctor");

// @desc      Get all Doctors
// @route     POST /api/doctor-list
// @access    With Token
module.exports.doctorList = (req, res, next) => {
  let {
    key = "created_date",
    order = "desc",
    page = 0,
    search = "",
    size = 10,
    companyId = "",
  } = req.query;

  page = parseInt(page);

  //Sort
  order = order === "asc" ? 1 : -1;

  //Search
  let searchData = [
    {
      status: 1,
    },
  ];
  if (search != "") {
    const searchvalue = { $regex: ".*" + search + ".*", $options: "i" };
    searchData.push({
      $or: [
        { fullName: searchvalue },
        { email: searchvalue },
        { description: searchvalue },
        { gender: searchvalue },
      ],
    });
  }

  DoctorModel.aggregate([
    { $match: { $and: searchData } },
    {
      $sort: {
        [key]: order,
      },
    },
  ])
    .then((data) => {
      // Paginate - Start
      const productsLength = data.length;

      // Calculate pagination details
      const begin = page * size;
      const end = Math.min(size * (page + 1), productsLength);
      const lastPage = Math.max(Math.ceil(productsLength / size), 1);

      // Prepare the pagination object
      let pagination = {};

      // If the requested page number is bigger than the last possible page number
      if (page > lastPage) {
        data = [];
        pagination = {
          lastPage,
        };
      } else {
        // Paginate the results by size
        data = data.slice(begin, end);

        // Prepare the pagination
        pagination = {
          length: productsLength,
          size: size,
          page: page,
          lastPage: lastPage,
          startIndex: begin,
          endIndex: end - 1,
        };
      }
      return res.status(200).json({
        status: true,
        message: "Doctors list",
        doctors: data,
        pagination,
      });
    })
    .catch((err) => {
      error.errorM(res, {
        action_type: "doctors-list",
        error_data: err,
      });
      return res.status(200).json({
        status: false,
        message: "Something went wrong.",
      });
    });
};

// @desc      Get Doctors by ID
// @route     POST /api/doctor/:id
// @access    With Token
module.exports.getDoctorById = (req, res, next) => {
  DoctorModel.findById(req.params.id, (err, type) => {
    if (err) {
      error.errorM(res, {
        action_type: "get-doctor",
        error_data: err,
      });
    } else {
      if (type) {
        return res.status(200).json({
          status: true,
          message: "Doctor Details.",
          results: type,
        });
      } else {
        return res.status(200).json({
          status: false,
          message: "Doctor not found.",
        });
      }
    }
  });
};

// @desc      Add-update Doctors
// @route     POST /api/add-update-doctor
// @access    With Token
module.exports.addUpdateDoctor = (req, res, next) => {
  if (req.body.doctorId !== "") {
    DoctorModel.findById(req.body.doctorId, (err, doctors) => {
      if (err) {
        error.errorM(res, {
          action_type: "get-doctor-at-update",
          error_data: err,
        });
      } else {
        if (!doctors) {
          return res.status(404).json({
            status: false,
            message: "Doctors not found.",
          });
        } else {
          DoctorModel.findOne(
            {
              _id: {
                $ne: req.body.doctorId,
              },
              status: {
                $ne: 2,
              },
              email: req.body.email,
            },
            function (err_olddetails, oldDetails) {
              if (err_olddetails) {
                error.errorM(res, {
                  action_type: "get-doctor-check-at-update",
                  error_data: err_olddetails,
                });
              } else {
                if (oldDetails) {
                  return res.status(200).json({
                    status: false,
                    message: "Email already exists.",
                  });
                } else {
                  const olddata = _.cloneDeep(doctors);
                  doctors.fullName = req.body.fullName.trim();
                  doctors.email = req.body.email.trim();
                  doctors.profileImgUrl = req.body.profileImgUrl;
                  doctors.contact_number = req.body.contact_number;
                  doctors.description = req.body.description;
                  doctors.gender = req.body.gender;
                  doctors.save((err, doc) => {
                    if (!err) {
                      logger.logM({
                        id: req.body.login_id,
                        role: req.body.login_role,
                        data: doc,
                        old_data: olddata,
                        action_msg: "update-doctor",
                      });
                      return res.status(200).json({
                        status: true,
                        message: "Doctors has been updated successfully.",
                      });
                    } else {
                      error.errorM(res, {
                        action_type: "update-doctor",
                        error_data: err,
                      });
                    }
                  });
                }
              }
            }
          );
        }
      }
    });
  } else {
    DoctorModel.findOne(
      {
        status: {
          $ne: 2,
        },
        $or: [
          {
            email: req.body.email,
          },
        ],
      },
      function (err_olddetails, oldDetails) {
        if (err_olddetails) {
          error.errorM(res, {
            action_type: "get-doctor-check-at-add",
            error_data: err_olddetails,
          });
        } else {
          if (oldDetails) {
            return res.status(200).json({
              status: false,
              message: "Email already exists.",
            });
          } else {
            var doctorData = new DoctorModel();
            doctorData.fullName = req.body.fullName.trim();
            doctorData.email = req.body.email.trim();
            doctorData.contact_number = req.body.contact_number;
            doctorData.profileImgUrl = req.body.profileImgUrl;
            doctorData.description = req.body.description;
            doctorData.gender = req.body.gender;
            doctorData.created_date = new Date();
            doctorData.save((err, doc) => {
              if (!err) {
                logger.logM({
                  id: req.body.login_id,
                  role: req.body.login_role,
                  data: doc,
                  action_msg: "add-doctor",
                });
                return res.status(200).json({
                  status: true,
                  message: "Doctors has been added successfully.",
                });
              } else {
                error.errorM(res, {
                  action_type: "add-doctor",
                  error_data: err,
                });
              }
            });
          }
        }
      }
    );
  }
};

// @desc      Update Doctors status
// @route     POST /api/update-doctor-status
// @access    With Token
module.exports.updateDoctorStatus = (req, res, next) => {
  DoctorModel.findOne(
    {
      _id: req.body.id,
    },
    (err, etype) => {
      if (err) {
        error.errorM(res, {
          action_type: "change-doctor-status",
          error_data: err,
        });
      } else {
        if (!etype) {
          return res.status(200).json({
            status: false,
            login_active: false,
            message: "Doctors not found.",
          });
        } else {
          const olddata = _.cloneDeep(etype);
          etype.status = req.body.status;
          etype.save((err, doc) => {
            if (!err) {
              logger.logM({
                data: doc,
                old_data: olddata,
                action_msg: req.body.action_type,
              });
              return res.status(200).json({
                status: true,
                message: "Doctors status has been changed.",
              });
            } else {
              error.errorM(res, {
                action_type: "change-doctor-status",
                error_data: err,
              });
            }
          });
        }
      }
    }
  );
};
