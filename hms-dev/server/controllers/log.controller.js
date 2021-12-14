const mongoose = require("mongoose");
// const nodemailer = require("nodemailer");
const Log = mongoose.model("Log");

// module.exports.commonEmail = function (arg) {
//   let transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: 'ctas.email.smtp@gmail.com', // generated ethereal user
//       pass: 'bjsynxebkzvylzya', // generated ethereal password
//     },
//   });

//   emailSmsTemplate.findOne(
//     {
//       send_type: arg.email_type,
//     },
//     (err, template) => {
//       var subject = template.subject;
//       var message = '';

//       if (arg.email_type == 5) {
//         message = template.email_description.replace(
//           '<font color="#ff0000">[customer_name]</font>',
//           arg.name
//         );

//         message = message.replace(
//           '<font color="#ff0000">[reset_password_link]</font>',
//           '<a href="' +
//             arg.reset_id +
//             '" style="color:#2775ff; font-size: 14px;font-weight:bold;text-decoration:none;">' +
//             arg.reset_id +
//             '</a>'
//         );

//         message = message.replace(
//           'href="/about-us"',
//           'href="' + process.env.WEB_URI + '/about"'
//         );
//         message = message.replace(
//           'href="/privacy-policy"',
//           'href="' + process.env.WEB_URI + '/privacy-policy"'
//         );
//       } else if (arg.email_type == 9) {
//         message = template.email_description.replace(
//           '<font color="#ff0000">[customer_name]</font>',
//           arg.name
//         );

//         message = message.replace(
//           '<font color="#ff0000">[client_employee]</font>',
//           '<label>' + arg.name + '</label>'
//         );

//         message = message.replace(
//           'href="/about-us"',
//           'href="' + process.env.WEB_URI + '/about"'
//         );
//         message = message.replace(
//           'href="/privacy-policy"',
//           'href="' + process.env.WEB_URI + '/privacy-policy"'
//         );
//       } else if (arg.email_type == 6) {
//         message = template.email_description.replace(
//           '<font color="#ff0000">[customer_name]</font>',
//           arg.name
//         );

//         message = message.replace(
//           '<font color="#ff0000">[customer_password]</font>',
//           arg.password
//         );

//         message = message.replace(
//           '<font color="#ff0000">[reset_password_link]</font>',
//           '<a href="' +
//             arg.reset_id +
//             '" style="color:#2775ff; font-size: 14px;font-weight:bold;text-decoration:none;">' +
//             arg.reset_id +
//             '</a>'
//         );

//         message = message.replace(
//           'href="/about-us"',
//           'href="' + process.env.WEB_URI + '/about"'
//         );
//         message = message.replace(
//           'href="/privacy-policy"',
//           'href="' + process.env.WEB_URI + '/privacy-policy"'
//         );
//       } else if (arg.email_type == 7) {
//         message = template.email_description.replace(
//           '<font color="#ff0000">[customer_name]</font>',
//           arg.name
//         );

//         message = message.replace(
//           '<font color="#ff0000">[customer_password]</font>',
//           arg.password
//         );

//         message = message.replace(
//           '<font color="#ff0000">[reset_password_link]</font>',
//           '<a href="' +
//             arg.reset_id +
//             '" style="color:#2775ff; font-size: 14px;font-weight:bold;text-decoration:none;">' +
//             arg.reset_id +
//             '</a>'
//         );
//         message = message.replace(
//           '<font color="#ff0000">[login_link]</font>',
//           '<a href="' +
//             process.env.WEB_URI +
//             '" style="color:#2775ff; font-size: 14px;font-weight:bold;text-decoration:none;">' +
//             process.env.WEB_URI +
//             '</a>'
//         );
//         message = message.replace(
//           '<font color="#ff0000">[company_name]</font>',
//           arg.company_name
//         );
//         message = message.replace(
//           '<font color="#ff0000">[company_email]</font>',
//           arg.company_email
//         );
//         message = message.replace(
//           '<font color="#ff0000">[company_website]</font>',
//           arg.company_website
//         );
//         message = message.replace(
//           'href="/about-us"',
//           'href="' + process.env.WEB_URI + '/about"'
//         );
//         message = message.replace(
//           'href="/privacy-policy"',
//           'href="' + process.env.WEB_URI + '/privacy-policy"'
//         );
//       }

//       // emailId = 'atulinteltech@gmail.com';
//       emailId = 'komal.ctasis.llp@gmail.com';

//       let info = transporter
//         .sendMail({
//           from: '"IKAA" <no-reply@ikaa.com>', // sender address
//           to: emailId, // list of receivers
//           subject: subject, // Subject line
//           text: message, // plain text body
//           html: message, // html body
//         })
//         .then(function (data) {
//           return true;
//         })
//         .catch(function (err) {
//           return false;
//         });
//     }
//   );
// };

module.exports.logM = function (arg) {
  var nowDate = new Date();

  var log = new Log();
  log.user_id = arg.id;
  log.user_role = arg.role;
  log.requested_data = arg.data;
  log.old_data = arg.old_data;
  log.action_date = format(nowDate);
  log.action_message = arg.action_msg;

  log.save((err, doc) => {});
};

function format(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  return "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
}
