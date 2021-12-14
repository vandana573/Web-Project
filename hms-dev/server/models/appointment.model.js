const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    apptNumber: {
      type: String,
    },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    date: {
      type: Date,
    },
    check_date: {
      type: String,
    },
    time_slot: {
      type: String,
    },
    title: {
      type: String,
    },
    allDay: {
      type: Boolean,
      default: true,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
    status: {
      type: Number,
      default: 1, // 1- active, 2- deleted
    },
    acception_status: {
      type: Number,
      default: 1, // 1- pending, 2- Approved
    },
    created_date: {
      type: Date,
      default: new Date(),
    },
    reports: {
      type: Array,
      default: [],
    },
  },
  {
    collection: "tbl_appointment",
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
