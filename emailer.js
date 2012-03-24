var node_email = require('nodemailer');
var settings = require("./configs.js");

function emailer(to, link, plain) {
  console.log('Emailer called, verification: ' + link);
  console.log(settings.settings.userName);
  node_email.SMTP = {
      host: "smtp.gmail.com",
      port: 465,
      ssl: true,
      use_authentication: true,
      user: settings.settings.userName,
      pass: settings.settings.passWord
  }
      console.log(node_email.SMTP);      
  node_email.send_mail({    
      to: to,
      sender: "nodebot@nodetest.com",
      subject: "You've recieved a converted audio file.",
      body: "Click this link to go to your audio file download page. Files expire after one hour." + plain,
      html: '<div><p>This link will take you to your download page.&nbsp;&nbsp;'+link+'</p></div>'
    },
    
    function(err, result) {
      if(err) {
        console.log('emailer encountered an error: ' + err);
      } else console.log('Message ok: ' + result);
     
  });
}

exports.emailer = emailer;

