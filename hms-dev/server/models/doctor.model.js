const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    contact_number: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: Number,
      default: 1,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    profileImgUrl: {
      type: String,
    },
    present: {
      type: Boolean,
      default: true,
    },
    created_date: {
      type: Date,
    },
  },
  {
    collection: "tbl_doctor",
  }
);

mongoose.model("doctor", doctorSchema);

// doctorSchema.pre("save", async function (next) {
//   const { fullName } = this.getUpdate();
//   if (fullName) {
//     try {
//       this.update({
//         $set: {
//           profileImgUrl: `https://avatar.oxro.io/avatar.svg?name=${this.fullName.toUpperCase()}+${
//             this.fullName.toUpperCase().split(" ")[1]
//           }&background=${Math.floor(Math.random() * 90000) + 10000}`,
//         },
//       });
//       next();
//     } catch (error) {
//       return next(error);
//     }
//   } else {
//     next();
//   }
// });

doctorSchema.pre("save", async function (next) {
  try {
    this.profileImgUrl = `https://avatar.oxro.io/avatar.svg?name=${this.fullName.toUpperCase()}+${this.fullName.toUpperCase()}&background=${Math.floor(Math.random() * 90000) + 10000
      }`;
    return next();
  } catch (error) {
    return next(error);
  }
});
