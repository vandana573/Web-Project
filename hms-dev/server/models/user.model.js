const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    contact_number: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 1,
    },
    role: {
      type: String,
      enum: ["patient", "admin"],
      default: "patient",
    },
    birth_day: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    profileImgUrl: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  {
    collection: "users",
  }
);

// Events for password
userSchema.pre("save", function (next) {
  let user = this;
  if (!user.isModified("password")) return next();
  if (user.password) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (err, hash) => {
        this.password = hash;
        next();
      });
    });
  }
});

// Methods
userSchema.methods.verifyPassword = function (password) {
  const result = bcrypt.compareSync(password, this.password);
  return result;
};

userSchema.methods.generateJwt = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXP,
    }
  );
};

module.exports = mongoose.model("User", userSchema);
