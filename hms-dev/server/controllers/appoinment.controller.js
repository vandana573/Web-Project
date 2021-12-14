const mongoose = require("mongoose");
const error = require("../controllers/error.controller");
const logger = require("../controllers/log.controller");
const _ = require("lodash");
const AppointmentModel = mongoose.model("Appointment");

// @desc      Get all Appointment
// @route     POST /api/appointment-list
// @access    With Token
module.exports.appointmentList = (req, res, next) => {
  let {
    sort = "created_date",
    order = "desc",
    page = 0,
    search = "",
    size = 1000,
  } = req.query;
  page = parseInt(page);
  //Sort
  order = order === "asc" ? 1 : -1;

  //Search
  let searchData = [
    {
      status: { $ne: 2 },
    },
  ];
  if (search != "") {
    const searchvalue = { $regex: ".*" + search + ".*", $options: "i" };
    searchData.push({
      $or: [
        { apptNumber: searchvalue },
        { time_slot: searchvalue },
        { date: searchvalue },
        { "userObject.fullname": searchvalue },
      ],
    });
  }

  AppointmentModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "patient_id",
        foreignField: "_id",
        as: "userObject",
      },
    },
    { $match: { $and: searchData } },
    {
      $sort: {
        [sort]: order,
      },
    },
    {
      $project: {
        allDay: 1,
        acception_status: 1,
        apptNumber: 1,
        doctor_id: 1,
        patient_id: 1,
        date: 1,
        time_slot: 1,
        title: 1,
        start: 1,
        end: 1,
        reports: 1,
        user: { $arrayElemAt: ["$userObject.fullname", 0] },
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
        message: "Appointment list",
        appointmentDetails: data,
        pagination,
      });
    })
    .catch((err) => {
      error.errorM(res, {
        action_type: "appointment-list",
        error_data: err,
      });
      return res.status(200).json({
        status: false,
        message: "Something went wrong.",
      });
    });
};

module.exports.appointmentListCount = async (req, res, next) => {
  AppointmentModel.aggregate([{ $match: { status: 1 } }])
    .then((data) => {
      return res.status(200).json({
        status: true,
        message: "Appt list",
        count: data.length,
      });
    })
    .catch((err) => {
      error.errorM(res, {
        action_type: "appt-list",
        error_data: err,
      });
      return res.status(200).json({
        status: false,
        message: "Something went wrong.",
      });
    });
};

// @desc      Add-update appointment detail
// @route     POST /api/add-update-appointment-detail
// @access    With Token
module.exports.addUpdateAppointment = async (req, res, next) => {
  if (req.body.appointmentId) {
    AppointmentModel.findById(
      req.body.appointmentId,
      (err, appointmentData) => {
        if (err) {
          error.errorM(res, {
            action_type: "get-appointment-at-update",
            error_data: err,
          });
        } else {
          if (!appointmentData) {
            return res.status(404).json({
              status: false,
              message: "Appointment not found.",
            });
          } else {
            const olddata = _.cloneDeep(appointmentData);
            appointmentData.doctor_id = req.body.doctor_id;
            appointmentData.patient_id = req.body.patient_id;
            appointmentData.title = req.body.time_slot;
            appointmentData.date = req.body.date;
            appointmentData.start = req.body.date;
            appointmentData.check_date = req.body.check_date;
            appointmentData.end = req.body.date;
            appointmentData.time_slot = req.body.time_slot;
            appointmentData.save((err, doc) => {
              if (!err) {
                logger.logM({
                  id: req.body.login_id,
                  role: req.body.login_role,
                  data: doc,
                  old_data: olddata,
                  action_msg: "update-appointment",
                });
                return res.status(200).json({
                  status: true,
                  message: "Appointment has been updated successfully.",
                });
              } else {
                error.errorM(res, {
                  action_type: "update-appointment",
                  error_data: err,
                });
              }
            });
          }
        }
      }
    );
  } else {
    await AppointmentModel.find()
      .sort({ $natural: -1 })
      .limit(1)
      .select("apptNumber -_id")
      .exec(function (err, lastRecord) {
        if (err) return next(err);
        var appointmentData = new AppointmentModel();
        let tmpPId;
        if (lastRecord.length === 0) {
          tmpPId = 0;
        } else {
          tmpPId = lastRecord[0].apptNumber.split("-")[1];
        }
        const pId = ("0" + (parseInt(tmpPId) + 1)).slice(-2);
        appointmentData.apptNumber = `Appt-${pId}`;
        appointmentData.doctor_id = req.body.doctor_id;
        appointmentData.patient_id = req.body.patient_id;
        appointmentData.date = req.body.date;
        appointmentData.time_slot = req.body.time_slot;
        appointmentData.title = req.body.time_slot;
        appointmentData.check_date = req.body.check_date;
        appointmentData.start = req.body.date;
        appointmentData.end = req.body.date;
        appointmentData.created_date = new Date();
        appointmentData.save((err, doc) => {
          if (!err) {
            logger.logM({
              id: req.body.login_id,
              role: req.body.login_role,
              data: doc,
              action_msg: "add-appointment",
            });
            return res.status(200).json({
              status: true,
              message: "Appointment has been added successfully.",
            });
          } else {
            error.errorM(res, {
              action_type: "add-appointment",
              error_data: err,
            });
          }
        });
      });
  }
};

module.exports.addReports = async (req, res, next) => {
  const result = await AppointmentModel.findOneAndUpdate(
    { _id: req.params.apptId },
    {
      $addToSet: {
        reports: req.body,
      },
    }
  );
  if (result) {
    return res.status(200).json({
      status: true,
      message: "Report has been uploaded successfully.",
    });
  } else {
    error.errorM(res, {
      action_type: "upload-report",
      error_data: result,
    });
  }
};

// @desc      Update appointment status
// @route     POST /api/update-appointment-status
// @access    With Token
module.exports.updateAppointmentStatus = (req, res, next) => {
  AppointmentModel.deleteOne(
    {
      _id: req.params.id,
    },
    (err, appointmentData) => {
      if (err) {
        error.errorM(res, {
          action_type: "change-appointment-status",
          error_data: err,
        });
      } else {
        if (!appointmentData) {
          return res.status(200).json({
            status: false,
            login_active: false,
            message: "Appointment not found.",
          });
        } else {
          return res.status(200).json({
            status: true,
            message: "Appointment status has been changed.",
          });
        }
      }
    }
  );
};

// @desc      Update appointment approve status
// @route     POST /api/update-appointment-approve-status
// @access    With Token
module.exports.updateAppointmentApprovedStatus = (req, res, next) => {
  AppointmentModel.findOne(
    {
      _id: req.body.id,
    },
    (err, appointmentData) => {
      if (err) {
        error.errorM(res, {
          action_type: "change-appointment-approved-status",
          error_data: err,
        });
      } else {
        if (!appointmentData) {
          return res.status(200).json({
            status: false,
            login_active: false,
            message: "Appointment not found.",
          });
        } else {
          const olddata = _.cloneDeep(appointmentData);
          appointmentData.acception_status = req.body.acception_status;
          appointmentData.save((err, doc) => {
            if (!err) {
              logger.logM({
                id: req.body.action_id,
                role: req.body.action_role,
                data: doc,
                old_data: olddata,
                action_msg: req.body.action_type,
              });
              return res.status(200).json({
                status: true,
                message: "Appointment approved successfully.",
              });
            } else {
              error.errorM(res, {
                action_type: "change-appointment-acception-status",
                error_data: err,
              });
            }
          });
        }
      }
    }
  );
};

// @desc      Get appt by ID
// @route     POST /api/get-patient-appointment/:patientId
// @access    With Token
module.exports.getPatientAppointments = (req, res, next) => {
  AppointmentModel.aggregate([
    {
      $match: {
        patient_id: mongoose.Types.ObjectId(req.params.patientId),
      },
    },
    {
      $lookup: {
        from: "tbl_doctor",
        localField: "doctor_id",
        foreignField: "_id",
        as: "doctorObject",
      },
    }
  ])
    .then((appointments) => {
      return res.status(200).json({
        status: true,
        message: "Patient appointment Details.",
        results: appointments,
      });
    })
    .catch((err) => {
      error.errorM(res, {
        action_type: "get-patient-appointment",
        error_data: err,
      });
      return res.status(200).json({
        status: false,
        message: "Something went wrong.",
      });
    });
};

module.exports.getPatientReports = (req, res, next) => {
  AppointmentModel.aggregate([{
    $match: {
      status: 1,
      patient_id: mongoose.Types.ObjectId(req.query.patient_id),
      doctor_id: mongoose.Types.ObjectId(req.query.doctor_id),
      check_date: req.query.check_date,
      time_slot: req.query.time_slot
    }
  }])
    .then((data) => {
      return res.status(200).json({
        status: true,
        message: "Reports list",
        data: data[0].reports,
      });
    })
    .catch((err) => {
      error.errorM(res, {
        action_type: "report-list",
        error_data: err,
      });
      return res.status(200).json({
        status: false,
        message: "Something went wrong.",
      });
    });
}
