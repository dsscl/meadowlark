//发送邮件
var nodemailer = require('nodemailer');

// nodemailer为大多数流行的邮件服务提供了快捷方式：Gmail、Hotmail、iCloud、Yahoo!...
var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
      user: credentials.gmail.user,
      pass: credentials.gmail.password
    }
});
// 如果你的MSA没有出现在这个列表上，或者你需要直接连接一个SMTP服务器，它也支持
var mailTransport = nodemailer.createTransport('SMTP', {
    host: 'smtp.meadowlarktravel.com',
    secureConnection: true,  // 用SSL端口：465
    auth: {
      user: credentials.meadowlarkSmtp.user,
      pass: credentials.meadowlarkSmtp.password
    }
});

// 发送邮件
mailTransport.sendMail({
    from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
    to: 'joecustomer@gmail.com, "Jane Customer" <jane@yahoo.com>, fred@hotmail.com',
    subject: 'Your Meadowlark Travel Tour',
    text: 'Thank you for booking your trip with Meadowlark Travel. We look forward to your visit!'
}, function(err) {
    if(err) {
      console.error('Unable to send email: ' + err);
    }
});

// 发送HTML邮件
mailTransport.sendMail({
    from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
    to: 'joecustomer@gmail.com, "Jane Customer" <jane@yahoo.com>, fred@hotmail.com',
    subject: 'Your Meadowlark Travel Tour',
    html: '<h1>Meadowlark Travel</h1>\n<p>Thanks for booking your trip with Meadowlark Travel.'
    + '<b> We look forward to your visit!</b></p>',
    generateTextFromHtml: true  // nodemail可自动将HTML翻译成普通文本
}, function(err) {
    if(err) {
      console.error('Unable to send email: ' + err);
    }
});

// 封装邮件功能 '/lib/email.js'

// 将邮件作为网站监测工具（不是日志的替代品）
if(err) {    
    emailService.emailError('the widget broke down!', __filename);
    // ...给用户显示错误信息
}
//或者
try {
    // do something...
} catch(ex) {
    emailService.emailError('the widget broke down!', __filename, ex);
    // ...给用户显示错误信息
}