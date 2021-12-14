const mongoose = require("mongoose");
const UserModel = mongoose.model("User");
const JWT = require("../middleware/JWT");
const logger = require("./log.controller");
const error = require("./error.controller");

// @desc      Login admin user
// @route     POST /api/login
// @access    without Token
// module.exports.login = (req, res) => {
//   // call for passport authentication
//   passport.authenticate("local", (err, user, info) => {
//     // error from passport middleware for get user
//     if (err) {
//       return res.status(200).json({
//         status: false,
//         message: "Something went wrong!",
//       });
//     } else if (user) {
//       UserModel.findOne(
//         {
//           _id: user._id,
//           status: 1,
//         },
//         async (err, user) => {
//           if (err) {
//             return res.status(200).json({
//               status: false,
//               message: "Something went wrong!",
//             });
//           } else {
//             if (!user) {
//               return res.status(200).json({
//                 status: false,
//                 login_active: false,
//                 message: "Email address not exist.",
//               });
//             } else {
//               let token = await JWT.signJWT({ id: user._id });
//               const roleData = await RoleMaster.findById(user.role_id);
//               user.password = "";
//               user.role = roleData === null ? "Admin" : roleData.role_name;
//               return res.status(200).json({
//                 status: true,
//                 user: user,
//                 token: token,
//               });
//             }
//           }
//         }
//       );
//     } else {
//       return res.status(200).json(info);
//     }
//   })(req, res);
// };

module.exports.login = (req, res) => {
  try {
    UserModel.findOne(
      {
        email: req.body.email,
        // password: req.body.password,
        status: 1,
      },
      async (err, user) => {
        if (err) {
          return res.status(200).json({
            status: false,
            message: "Something went wrong!",
          });
        } else {
          if (!user) {
            return res.status(200).json({
              status: false,
              login_active: false,
              message: "Email address / password are wrong.",
            });
          } else {
            if (!user.verifyPassword(req.body.password)) {
              return res.status(200).json({
                message: "Wrong password.",
                status: false,
              });
            } else {
              let token = await JWT.signJWT({ id: user._id });
              user.password = "";
              return res.status(200).json({
                status: true,
                user: user,
                token: token,
              });
            }
          }
        }
      }
    );
  } catch (err) {
    console.log("Login-", err);
  }
};

// @desc      Add-update User
// @route     POST /api/add-update-user
// @access    With Token
module.exports.addUpdateUser = async (req, res) => {
  UserModel.findOne(
    {
      status: {
        $ne: 2,
      },
      email: req.body.email,
    },
    function (err_olddetails, oldDetails) {
      if (err_olddetails) {
        error.errorM(res, {
          action_type: "check-user-email-at-add",
          error_data: err_olddetails,
        });
      } else {
        if (oldDetails) {
          return res.status(200).json({
            status: false,
            message: "Email already exist.",
          });
        } else {
          var user = new UserModel();
          user.fullname = req.body.fullname; //.trim();
          // user.lastname = req.body.lastname.trim();
          user.email = req.body.email; //.trim();
          user.gender = req.body.gender; //.trim();
          user.address = req.body.address; //.trim();
          user.password = req.body.password; //.trim();
          user.contact_number = req.body.contact_number; //.trim();
          user.birth_day = req.body.birth_day;
          user.created_at = new Date();
          user.save((err, doc) => {
            if (!err) {
              logger.logM({
                data: doc,
                action_msg: "add-user",
              });
              return res.status(200).json({
                status: true,
                message: "User has been added successfully.",
              });
            } else {
              error.errorM(res, {
                action_type: "add-user",
                error_data: err,
              });
            }
          });
        }
      }
    }
  );
  // }
  //}
  //);
};

// @desc      Get all user
// @route     POST /api/user-list
// @access    With Token
module.exports.UserList = (req, res) => {
  let {
    sort = "created_date",
    order = "desc",
    page = 0,
    search = "",
    size = 10,
    companyId = "",
  } = req.query;

  //Sort
  order = sort === "asc" ? 1 : -1;

  //Search
  let searchData = [
    {
      company_id: mongoose.Types.ObjectId(companyId),
      status: { $ne: 2 },
      isSuperAdmin: { $ne: true },
      isCompanyAdmin: { $ne: true },
    },
  ];
  if (search != "") {
    const searchvalue = { $regex: ".*" + search + ".*", $options: "i" };
    searchData.push({
      $or: [
        { firstname: searchvalue },
        { lastname: searchvalue },
        { email: searchvalue },
        { "tbl_role_data.role_name": searchvalue },
        { "tbl_company_data.name": searchvalue },
      ],
    });
  }
  UserModel.aggregate([
    {
      $lookup: {
        from: "tbl_company",
        localField: "company_id",
        foreignField: "_id",
        as: "tbl_company_data",
      },
    },
    {
      $lookup: {
        from: "tbl_role",
        localField: "role_id",
        foreignField: "_id",
        as: "tbl_role_data",
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
        _id: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        profileimage: 1,
        company_id: 1,
        company_name: { $arrayElemAt: ["$tbl_company_data.name", 0] },
        role_id: 1,
        role_name: { $arrayElemAt: ["$tbl_role_data.role_name", 0] },
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
        message: "User list",
        users: data,
        pagination,
      });
    })
    .catch((err) => {
      error.errorM(res, {
        action_type: "user-list",
        error_data: err,
      });
      return res.status(200).json({
        status: false,
        message: "Something went wrong.",
      });
    });
};

// @desc      Update User status
// @route     POST /api/update-user-status
// @access    With Token
module.exports.updateUserStatus = (req, res) => {
  UserModel.findOne(
    {
      _id: req.body.id,
    },
    (err, user) => {
      if (err) {
        error.errorM(res, {
          action_type: "change-user-status",
          error_data: err,
        });
      } else {
        if (!user) {
          return res.status(200).json({
            status: false,
            login_active: false,
            message: "User Detail not found.",
          });
        } else {
          const olddata = _.cloneDeep(user);
          user.status = req.body.status;
          user.save((err, doc) => {
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
                message: "User status has been changed.",
              });
            } else {
              error.errorM(res, {
                action_type: "change-user-status",
                error_data: err,
              });
            }
          });
        }
      }
    }
  );
};

// @desc      Change password
// @route     POST /api/change-password
// @access    With Token
module.exports.ChangePassword = (req, res) => {
  UserModel.findById(req.body.id, (err, user) => {
    if (!err) {
      if (!user.verifyPassword(req.body.oldpassword)) {
        return res.status(200).json({
          status: false,
          message: "Current password is wrong.",
        });
      } else {
        user.password = req.body.password;
        user.save((err, doc) => {
          if (!err) {
            return res.status(200).json({
              status: true,
              message: "Your password has been changed.",
              user: doc,
            });
          } else {
            return res.status(200).json({
              status: false,
              message: "Password has been failed.",
            });
          }
        });
      }
    } else {
      return res.status(200).json({
        status: false,
        message: "User details not found.",
      });
    }
  });
};

// @desc      Forgot password
// @route     POST /api/forgot-password
// @access    Without Token
module.exports.userForgotPassword = (req, res) => {
  UserModel.findOne(
    {
      email: req.body.email,
    },
    (err, user) => {
      if (!user) {
        return res.status(200).json({
          status: false,
          login_active: false,
          message: "Email address not exist.",
        });
      } else {
        user.reset_id = user.makeid(10);
        user.save((err, user) => {
          var username = user.firstname + " " + user.lastname;
          logger.commonEmail({
            email_type: 5,
            name: username,
            reset_id: process.env.WEB_URI + "reset-password/" + user.reset_id,
            emailId: user.email,
          });
          return res.status(200).json({
            status: true,
            message:
              "Reset password link has been sent to your registered email address.",
            result: user,
          });
        });
      }
    }
  );
};

// @desc      Reset password
// @route     POST /api/reset-password
// @access    Without Token
module.exports.resetPassword = (req, res) => {
  UserModel.findOne(
    {
      reset_id: req.body.resetId,
    },
    (err, user) => {
      if (!user) {
        return res.status(200).json({
          status: false,
          message: "Your reset password link has been expired.",
        });
      } else {
        user.reset_id = "";
        if (req.body.password === req.body.passwordConfirm) {
          user.password = req.body.password;
          user.save((err, user) => {
            var username = user.firstname + " " + user.lastname;
            logger.commonEmail({
              email_type: 9,
              name: username,
              emailId: user.email,
            });
            return res.status(200).json({
              status: true,
              message: "Password has been updated successfully.",
            });
          });
        } else {
          return res.status(200).json({
            status: false,
            message: "Password not match.",
          });
        }
      }
    }
  );
};

// @desc      Update user profile
// @route     POST /api/update-user-profile
// @access    With Token
module.exports.updateUserProfile = async (req, res) => {
  UserModel.findById(req.body.userId, (err, user) => {
    if (user) {
      UserModel.findOne(
        {
          _id: {
            $ne: req.body.userId,
          },
          status: {
            $ne: 2,
          },
          email: req.body.email,
        },
        function (err_olddetails, oldDetails) {
          if (err_olddetails) {
            error.errorM(res, {
              action_type: "check-user-email-at-update-profile",
              error_data: err_olddetails,
            });
          } else {
            if (oldDetails) {
              return res.status(200).json({
                status: false,
                message: "Email already exists.",
              });
            } else {
              const olddata = _.cloneDeep(user);
              user.fullname = req.body.fullname.trim();
              user.contact_number = req.body.contact_number;
              user.address = req.body.address.trim();
              user.birth_day = req.body.birth_day;
              user.gender = req.body.gender.trim();
              user.save((err, doc) => {
                if (!err) {
                  doc.password = "";
                  logger.logM({
                    data: doc,
                    old_data: olddata,
                    action_msg: "update-user",
                  });
                  return res.status(200).json({
                    status: true,
                    message: "User profile has been updated successfully.",
                    user: doc,
                  });
                } else {
                  error.errorM(res, {
                    action_type: "update-user-profile",
                    error_data: err,
                  });
                }
              });
            }
          }
        }
      );
    } else {
      return res.status(200).json({
        status: false,
        message: "User not found.",
      });
    }
  });
};

// for generate random id
// function makeid(length) {
//   var result = '';
//   var characters =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for (var i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }
