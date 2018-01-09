var express = require('express');
var fortune = require('./lib/fortune');

var app = express();

// 设置handlebar视图引擎
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

// static中间件（放在所有路由之前，相当于给你想要发送的所有静态文件创建了一个路由，渲染文件并发送给客户端）
app.use(express.static(__dirname + '/public'));

// 用一些中间件来检测查询字符串中的test=1（必须定义在路由之前）
app.use(function(req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
  next();
});

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
  res.status(500);
  res.render('500');
});

// 幸运饼干数组
// var fortunes = [
//   'Conquer your fears or they will conquer you.',
//   'Rivers nees springs.',
//   'Do nor fear what you don\'t know.',
//   'You will have a pleasant surprise.',
//   'Whenever possible, keep it simple.'
// ]