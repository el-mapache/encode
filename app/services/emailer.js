var mailer = require('nodemailer');
var settings = require(GLOBAL.dirname + '/config/app-settings.js')[GLOBAL.env];

var EmailService = function(to, link) {
  this.to = to;
  this.link = link;

  this.mailer = mailer;
};

EmailService.prototype.mail = function(done) {
  var smtpTransport = this.mailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
      user: settings.email.user,
      pass: settings.email.password
    }
  });

  smtpTransport.sendMail({
    to: this.to,
    from: "adam.biagianti@gmail.com",
    subject: "You've received a converted audio file.",
    text: "Click this link to go to your audio file download page. Files expire after one hour.",
    html: '<div><p>This link will take you to your download page.&nbsp;&nbsp;'+this.link+'</p></div>'
  },

  function(err, result) {
    if(err) {
      console.log('emailer encountered an error: ' + err);
      done(err);
    } else {
      console.log('Message ok: ' + result);
      done(null, result);
    }
  });
};

module.exports = EmailService;

