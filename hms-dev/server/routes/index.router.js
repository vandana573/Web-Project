const express = require("express");
const router = express.Router();

const user = require("../controllers/user.controller");
const ctrAppoinement = require("../controllers/appoinment.controller");
const ctrDoctor = require("../controllers/doctor.controller");
const ctrCommondata = require("../controllers/commondata.controller");

const JWT = require("../middleware/JWT");
const multipart = require("connect-multiparty");

// upload lab report
const multipartMiddleware_patientReport = multipart({
  uploadDir: "./uploads/reports",
});
/*******************************
 *
 * BACKEND ROUTES // START
 *
 *******************************/

/*********************************************   Admin Section */

/***  User Login- Registration  ***/
router.post("/login", user.login);
router.get("/user-list", JWT.jwtValidation, user.UserList);
router.post("/change-password", JWT.jwtValidation, user.ChangePassword);
router.post("/add-update-user", user.addUpdateUser);
router.post("/update-user-status", JWT.jwtValidation, user.updateUserStatus);
router.post("/update-user-profile", JWT.jwtValidation, user.updateUserProfile);

/*** Appoinment section ***/
router.get(
  "/appointment-list",
  JWT.jwtValidation,
  ctrAppoinement.appointmentList
);
router.get(
  "/appointment-list-count",
  JWT.jwtValidation,
  ctrAppoinement.appointmentListCount
);
router.get(
  "/get-patient-appointment/:patientId",
  JWT.jwtValidation,
  ctrAppoinement.getPatientAppointments
);

router.get(
  "/get-patient-report",
  JWT.jwtValidation,
  ctrAppoinement.getPatientReports
);
router.post(
  "/add-update-appointment-detail",
  JWT.jwtValidation,
  ctrAppoinement.addUpdateAppointment
);
router.post(
  "/update-appointment-report/:apptId",
  JWT.jwtValidation,
  ctrAppoinement.addReports
);

router.delete(
  "/update-appointment-status/:id",
  JWT.jwtValidation,
  ctrAppoinement.updateAppointmentStatus
);
router.post(
  "/update-appointment-approve-status",
  JWT.jwtValidation,
  ctrAppoinement.updateAppointmentApprovedStatus
);
router.post(
  "/upload-report",
  multipartMiddleware_patientReport,
  ctrCommondata.uploadReport
);

/***  Doctor section  ***/
router.get("/doctor-list", JWT.jwtValidation, ctrDoctor.doctorList);
router.get("/doctor/:id", JWT.jwtValidation, ctrDoctor.getDoctorById);
router.post("/add-update-doctor", JWT.jwtValidation, ctrDoctor.addUpdateDoctor);
router.post(
  "/update-doctor-status",
  JWT.jwtValidation,
  ctrDoctor.updateDoctorStatus
);
// upload box designs
const multipartMiddleware_doctor = multipart({
  uploadDir: "./uploads/doctors",
});
router.post(
  "/upload-image/doctor",
  multipartMiddleware_doctor,
  ctrCommondata.uploadDoctorImage
);
module.exports = router;
