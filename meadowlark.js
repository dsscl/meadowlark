var express = require('express');
var fortune = require('./lib/fortune');
var weather = require('./lib/weather');
var formidable = require('formidable');  // 复合表单处理，一种流行健壮的选择（平行选择还有：Busboy）
var jqupload =  require('jquery-file-upload-middleware');
var credentials = require('./lib/credentials');  // 引入凭证
// var nodemailer = require('nodemailer');
var emailService = require('./lib/email')(credentials);  // 引用封装好的方法发送邮件
var http = require('http');

var app = express();

// 设置handlebar视图引擎
// var handlebars = require('express3-handlebars').create({defaultLayout: 'main', extname: '.hbs'});
var handlebars = require('express3-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    // 段落配置
    section: function(name, options) {
      if(!this._sections) {
        this._sections = {};
      }
      this._sections[name] = options.fn(this);
      return null;
    }
  }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// 追踪请求中所有的未捕获错误并做出相应的响应（中间件）
app.use(function(req, res, next) {
  // 为这个请求创建一个域
  var domain = require('domain').create();
  // 处理这个域中的错误
  domain.on('error', function(err) {
      console.error('DOMAIN ERROR CAUGHT\n', err.stack);
      try {
          // 在5秒内进行故障保护关机
          setTimeout(function() {
              console.error('Failsafe shutdown.');
              process.exit(1);
          }, 5000);
          // 从集群中断开
          var worker = require('cluster').worker;
          if(worker) {
              worker.disconnect();
          }
          // 停止接收新请求
          server.close();
          try {
              // 尝试使用Express错误路由
              next(err);
          } catch(err) {
              // 如果Express错误路由失效，尝试返回普通文本响应
              console.error('Express error mechanism failed.\n', err.stack);
              res.statusCode = 500;
              res.setHeader('Content-type', 'text/plain');
              res.end('Server error.');
          }
      } catch(err) {
          console.error('Unable to send 500 response.\n', err.stack);
      }
  });

  // 向域中添加请求和响应对象
  domain.add(req);
  domain.add(res);

  // 执行该域中剩余的请求链
  domain.run(next);
});

var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Listening on port %d.', app.get('port'));
});

// app.listen(app.get('port'), function() {
//   console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
// });
// 指定执行（环境）模式：开发/测试/生产
function startServer() {
  // http.createServer(app).listen(app.get('port'), function() {
  //   console.log('Express started in ' + app.get('env') + ' mode on http://localhost:' + app.get('port') + 
  //   '; press Ctrl-C to terminate.');
  // });
}
// 添加集群支持。meadowlark既可以直接运行（node.meadowlark.js），也可以通过require语句作为一个模块引入。
if(require.main === module) {
  // 应用程序直接运行；启动应用服务器
  startServer();
} else {
  // 应用程序作为一个模块通过“require”引入：导出函数
  // 创建服务器
  module.exports = startServer;
}

// 添加日志支持
switch(app.get('env')) {
  case 'development':
    // 紧凑的、彩色的开发日志
    app.use(require('morgan')('dev'));
    break;
  case 'production':
    // 模块'express-logger'支持按日志循环
    app.use(require('express-logger')({
      path: __dirname + 'log/requests.log'
    }));
    break;
}

// static中间件（放在所有路由之前，相当于给你想要发送的所有静态文件创建了一个路由，渲染文件并发送给客户端）
app.use(express.static(__dirname + '/public'));

// body-parser中间件（一旦引入body-parser，你会发现req.body变为可用）
app.use(require('body-parser')());

// cookie与会话
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());

// 引入中间件
app.use(require('./lib/tourRequiresWaiver'));  // 模块输出函数，为中间件
var cartValidation = require('./lib/cartValidation');  // 模块输出对象，对象的属性为中间件
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

// 用一些中间件来检测查询字符串中的test=1（必须定义在路由之前）
app.use(function(req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
  next();
});

app.use(function(req, res, next) {
  if(!res.locals.partials) {
    res.locals.partials = {};
  }
  res.locals.partials.weather = weather.getWeatherData();
  next();
});

app.use('/upload', function(req, res, next) {
  var now = Date.now();
  jqupload.fileHandler({
    uploadDir: function() {
      return __dirname + '/public/uploads/' + now;
    },
    uploadUrl: function() {
      return '/uploads/' + now;
    }
  })(req, res, next);
});

// 会话
app.use(function(req, res, next) {
  // 如果有即显消息，把它传到上下文中，然后清除它
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// 看不同工作线程处理不同请求的证据，在路由前添加下面这个中间件
// app.use(function(req, res, next) {
//   var cluster = require('cluster');
//   if(cluster.isWorker) {
//     console.log('Worker %d received request', cluster.worker.id);
//   }
// });

// 添加路由（添加路由和添加中间件的顺序至关重要）
app.get('/', function(req, res) {
  // res.type('text/plain');
  // res.send('Meadownlark Travel');

  res.render('home');
});

app.get('/about', function(req, res) {
  // res.type('text/plain');
  // res.send('About Meadowlark Travel');

  // res.render('about');

  // var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  // res.render('about', {fortune: randomFortune});

  // res.render('about', {fortune: fortune.getFortune()});

  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js'
  });
});

// tours页面来源相关路由
app.get('/tours/hood-river', function(req, res) {
  res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function(req, res) {
  res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function(req, res) {
  res.render('tours/request-group-rate');
});

// 查看请求时浏览器发送的信息
app.get('/headers', function(req, res) {
  res.set('Content-type', 'text/plain');
  var s = '';
  // 请求报头对象的信息
  for(var name in req.headers) {
    s += name + ': ' + req.headers[name] + '\n';
  }
  res.send(s);
});

// 段落test相关路由
app.get('/jquerytest', function(req, res) {
  res.render('jquerytest');
});

// 客户端handlebars（ajax）相关路由
app.get('/nursery-rhyme', function(req, res) {
  res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res) {
  res.json({
    animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck'
  });
});

// 表单提交相关路由
app.get('/newsletter', function(req, res) {
  // 后面会学到CSRF...目前，只提供一个虚拟值
  res.render('newsletter', {csrf: 'CSRF token gose here'});
});
app.post('/process',function(req, res) {
  console.log('Form (from querystring): ' + req.query.form);
  console.log('CSRF token (from hidden form field): ' + req.body._csrf);
  console.log('Name (from visible form field): ' + req.body.name);
  console.log('Email (from visible form field): ' + req.body.email);
  // res.type('text/json');
  // 如果是AJAX请求（AJAX依赖于XHR） || 最佳返回格式是JSON（还是HTML）
  console.log(req.xhr || req.accepts('json,html') === 'json');
  if(req.xhr || req.accepts('json,html') === 'json') {
    // 如果发生错误，应该发送{error: 'error description'}
    res.send({success: true});
  } else {
    // 如果发生错误，应该重定向到错误页面
    res.redirect(303, '/thank-you');
  }
});
app.get('/thank-you', function(req, res) {
  res.send('Thank you!');
});
app.get('/error', function(req, res) {
  res.send('Error!');
});

// 文件系统的持久化，Node对文件系统的支持
// 确保存在目录data
var dataDir = __dirname + '/data';
var vacationPhotoDir = dataDir + '/vavation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);
function saveContestEntry(contestName, email, year, month, photoPath) {
  // TODO...这个稍后再做
}

// 文件上传（复合表单）相关路由
// app.get('/contest/vacation-photo', function(req, res) {
//   var now = new Date();
//   res.render('contest/vacation-photo', {
//     year: now.getFullYear(),
//     month: now.getMonth()
//   });
// });
app.post('/contest/vacation-photo/:year/:month', function(req, res) {
  var form = new formidable.IncomingForm();
  // formidable有一个方便的回调方法，能够提供包含字段和文件信息的对象
  form.parse(req, function(err, fields, files) {
    if(err) {
      return res.redirect(303, '/error');
    }
    if(err) {
      res.session.flash = {
        type: 'danger',
        intro: 'Oops!',
        message: 'There was an error processing your submission. Please try again.'
      };
      return res.redirect(303, '/contest/vacation-photo');
    }
    var photo = files.photo;
    var dir = vacationPhotoDir + '/' + Date.now();
    var path = dir + '/' + photo.name;
    fs.mkdirSync(dir);
    fs.renameSync(photo.path, dir + '/' + photo.name);
    saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
    req.session.flash = {
      type: 'success',
      intro: 'Good luck!',
      message: 'You have been entered into the contests.'
    }
    return res.redirect(303, '/contest/vacation-photo/entries');
  });
});

// 用会话实现即显消息
app.post('/newsletter', function(req, res) {
  var name = req.body.name || '', email = req.body.email || '';
  // 输入验证
  if(!email.match(VALID_EMAIL_REGEX)) {
    if(req.xhr) {
      return res.json({error: 'Invilid name emai address.'});
      req.session.flash = {
        type: 'danger',
        intro: 'Validation error!',
        message: 'The email address you entered was not valid.'
      };
      return res.redirect(303, '/newsletter/archive');
    }
  }
  new NewsletterSignup({name: name, email: email}).save(function(err) {
    if(err) {
      if(req.xhr) {
        return res.json({error: 'Database error.'});
        req.session.flash = {
          type: 'danger',
          intro: 'Database error!',
          message: 'There was a database error; please try again later.'
        };
        return res.redirect(303, '/newsletter/archive');
      }
    }
    if(req.xhr) {
      return res.json({success: true});
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'You have now been signed up for the newsletter.'
      };
      return res.redirect(303, '/newsletter/archive');
    }
  });
});

// 为购物车“感谢”页面创建路由（发送邮件）
app.post('/cart/checkout', function(req, res) {
  var cart = req.session.cart;
  if(!cart) {
    next(new Error('Cart does not exist.'));
  }
  var name = req.body.name || '', email = req.body.email || '';
  // 输入验证
  if(!email.match(VALID_EMAIL_REGEX)) {
    return res.next(new Error('Invalid email address.'));
  }
  // 分配一个随机的购物车ID，一般我们会用一个数据库ID
  cart.number = Math.random().toString().replace(/^0\.0*/, '');
  cart.billing = {
    name: name,
    email: email
  };
  res.render('email/cart-thank-you', {
    layout: null,
    cart: cart
  }, function(err, html) {
    if(err) {
      console.log('error in email template');
    }
    // mailTransport.sendMail({
    //   from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
    //   to: cartValidation.billing.email,
    //   subject: 'Thank you for booking your trip with Meadowlark Travel',
    //   html: html,
    //   generateTextFromHtml: true
    // }, function(err) {
    //   if(err) {
    //     console.error('Unable to send confirmation: ' + err.stack);
    //   }
    // });
    emailService.send(cartValidation.billing.email, 'Thank you for booking your trip with Meadowlark Travel', html)
  });
  res.render('cart-thank-you', {cart: cart});
});

// 处理未捕获的异常
// 1）不会引起太多麻烦的小例子（服务器时稳定的，其他请求还能正确处理）
app.get('/fail', function(req, res) {
  throw new Error('Nope!');
});
// 2）一些更糟的情况（服务器宕机了，不能再处理请求了）
app.get('/epic-fail', function(req, res) {
  process.nextTick(function() {  // process.nextTick跟调用没有参数的setTimeout函数非常像，但她效率更高
    throw new Error('Kaboom!');
  });
});

// 定制404页面(app.use是Express添加中间件的一种方法)
// app.use(function(req, res, next) {
//   res.type('text/plain');
//   res.status(404);
//   res.send('404 - Not Found');
// });

// 404 catch-all处理器（中间件）
app.use(function(req, res, next) {
  res.status(404);
  res.render('404');
});

// 定制500页面
// app.use(function(err, req, res, next) {
//   console.error(err.stack);
//   res.type('text/plain');
//   res.status(500);
//   res.send('500 - Server Error');
// });

// 500 catch-all处理器（中间件）
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('500');
});

// 幸运饼干数组
// var fortunes = [
//   'Conquer your fears or they will conquer you.',
//   'Rivers nees springs.',
//   'Do nor fear what you don\'t know.',
//   'You will have a pleasant surprise.',
//   'Whenever possible, keep it simple.'
// ]