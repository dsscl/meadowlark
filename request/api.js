// 查看请求时浏览器发送的信息
app.get('/headers', function(req, res) {
  res.set('Content-type', 'text/plain');
  var s = '';
  // 请求报头对象的信息
  for(var name in req.headers) {
    s += name + ': ' + req.headers[name] + '\n';
  }
  // 请求对象
  s += 'req.params: ' + req.params + '\n'  // 一个数组，包含命名过的路由参数
     + 'req.param(name)' + req.param(name) + '\n'  // 返回命名的参数路由，或者get请求或post请求（建议忽略此方法）
     + 'req.query: ' + req.query + '\n'  // 一个对象，包含以键值对存放的查询字符串参数
     + 'req.body: ' + req.body + '\n'  // 一个对象，包含POST请求参数（需要中间件能够解析请求正文内容类型）
     + 'req.route: ' + req.route + '\n'  // 关于当前匹配路由的信息
     + 'req.cookies: ' + req.cookies + '\n'  // 一个对象，包含从客户端传递过来的cookies值
     + 'req.headers: ' + req.headers + '\n'  // 从客户端接收到的请求报头
     + 'req.accepts([type]): ' + req.accepts([type]) + '\n'  // 一个简便方法，用来确定客户端是否接受一个或一组指定的类型（如application/json)
     + 'req.ip: ' + req.ip + '\n'  // 客户端的IP地址
     + 'req.path: ' + req.path + '\n'  // 请求路径
     + 'req.host: ' +req.host + '\n'  // 一个简便方法，用来返回客户端所报告的主机名（这些信息可以伪造，所以不应该用于安全目的）
     + 'req.xhr: ' + req.xhr + '\n'  // 一个简便属性，如果请由Ajax发起将会返回true
     + 'req.protocol: ' + req.protocol + '\n'  // 用于标识请求的协议（http或https）
     + 'req.secure: ' + req.secure + '\n'  // 一个简便属性，如果连接是安全的，将返回true。等同于req.protocol === 'https'
     + 'req.url/req.originUrl: ' + req.url + req.originUrl + '\n'  // 这些属性返回了路径和查询字符串（它们不包含协议、主机或端口）
     + 'req.acceptedLanguages: ' + req.acceptedLanguages + '\n';  // 一个简便方法，用来返回客户端首选的一组（人类的）语言（从请求报头中解析而来）
  // 响应对象
  s += 'res.status(code): ' + res.status(code) + '\n'  // 设置http状态码（对于重定向状态码，有个更好的方法：redirect）
     + 'res.set(name, value): ' + res.set(name, value) + '\n'  // 设置响应头，这通常不需要手动设置
     + 'res.cookie(name, value, [options]), res.clearCookie(name, [options])' + '\n'  // 设置或清除客户端cookies值（需要中间件支持）
     + 'res.redirect([status], url)' + '\n'  // 重定向浏览器。默认重定向代码是302（建立）。通常，应该尽量减少重定向，除非永久移动一个页面，这种情况应该使用代码301（永久移动）
     + 'res.send(body), res.send(status, body)' + '\n' // 向客户端发送响应及可选的状态码，如果body是一个对象或数组，响应将会以json发送（更推荐用res.json)
     + 'res.json(json), res.json(status, json)' + '\n' // 向客户端发送json以及可选的状态码
     + 'res.jsonp(json), res.jsonp(status, json)' + '\n' // 向客户端发送jsonp以及可选的状态码
     + 'res.type(type)'  // 一个简便的方法，用于设置Content-type头信息，基本上相当于res.set('Content-type', type)
     + 'res.format(object)'  // 这个方法允许你根据接收请求报头发送不同的内容（res.format({'text/plain':'hi there','text/html':'<b>hi there</b>'})
     + 'res.attachment([filename]), res.download(path, [filename], [callback])'  // 这两种方法会将响应报头Content-Disposition设为attachment，这样浏览器就会选择下载而不是展现内容
     + 'res.sendFile(path, [option], [callback])'  // 这个方法可根据路径读取指定文件并将内容发送到客户端。使用该方法很方便，使用静态中间件，并将发送到客户端的文件放在公共目录下，这很容易。
    //  然而，如果你想根据条件在相同的url下提供不同的资源，这个方法可以派上用场
    + 'res.links(links)'  // 设置链接响应报头。这是一个专用的报头，在大多数应用程序中几乎没有用处
    + 'res.locals, res.render(view, [locals], callback)';  // res.locals是一个对象，包含用于渲染视图的默认上下文。res.render使用配置的模板引擎渲染视图
    // （不能把res.render的locals参数和res.locals混为一谈，上下文在res.locals中会被重写，但在没有被重写的情况下仍然可用）。res.render的默认响应码为200，使用res.status可以指定一个不同的代码
  res.send(s);
});

// 示例代码
// &1.1 内容渲染
// 基本用法
app.get('/about', function(req, res) {
  res.render('about');
});

// 200以外的响应代码
app.get('/error', function(req, res) {
  res.status(500);
  res.render('error');
});
// 或是一行...
app.get('/error', function(req, res) {
  res.status(500).render('error');
});

// 将上下文传递给视图，包括查询字符串、cookie和session值
app.get('/greeting', function(req, res) { 
  res.render('about', {
    message: 'welcome',
    style: req.query.style,
    userid: req.cookie.userid,
    username: res.session.username
  });
});

// 没有布局的视图渲染
// 下面的layout没有布局文件，即views/no-layout.handlebars
// 必须包含必要的HTML
app.get('/no-layout', function(req, res) {
  res.render('no-layout', {layout: null});
});

// 使用定制布局渲染视图
// 使用布局文件views/layouts/custom.handlebars
app.get('/custom-layout', function(req, res) {
  res.render('custom-layout', {layout: 'custom'});
});

// 渲染纯文本输出
app.get('/test', function(req, res) {
  res.type('text/plain');
  res.send('this is a test');
});

// 添加错误处理程序
// 这里应该出现在所有路由方法的结尾
// 需要注意的是，即使你不需要一个“下一步”方法，它也必须包含，以便Express将它识别为一个错误处理程序
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('error');
});

// 添加一个404处理程序
// 这应该出现在所有路由方法的结尾
app.use(function(req, res) {
  res.status(404).render('not-found');
});

// &1.2 处理表单
// 基本表单处理
// 必须引入中间件body-parser
app.post('/process-contact', function(req, res) {
  console.log('Received contact from ' + req.body.name + ' <' + req.body.email + ' >');
  // 保存到数据库...
  res.redirect(303, '/thank-you');
});

// 更强大的表单处理
// 必须引入中间件body-parser
app.post('/process-contact', function(req, res) {
  console.log('Received contact from ' + req.body.name + ' <' + req.body.email + ' >');
  try {
    // 保存到数据库...
    return res.xhr ? res.render({success: true}) : res.redirect(303, '/thank-you');
  } catch(ex) {
    return res.xhr ? res.json({error: 'Database error.'}) : res.redirect(303, '/database-error');
  }
});

// &1.3 提供一个API
var tours = [
  {id: 0, name: 'Hood River', price: 99.99},
  {id: 1, name: 'Oregon Coast', price: 149.95}
]
// “节点”一词经常用于描述API的单个方法

// 简单的GET节点，只返回json数据
app.get('/api/tours', function(req, res) {
  res.json(tours);
});

// GET节点，返回JSON、XML或text
// 根据客户端的首选项，使用Express中的res.format方法对其响应
app.get('/api/tours', function(req, res) {
  var toursXml = '<?xml version="1.0"?><tours></tours>' + 
  products.map(function(p) {
    return '<tour price="' + p.price + '" id=' + p.id + '">"' + p.name + '</tour>';
  }).json('') + '</tours>';
  var toursText = tours.map(function(p) {
    return p.id + ': ' + p.name + ' (' + p.price + ')';
  }).json('\n');
  res.format({
    'application/json': function() {
      res.json(tours);
    },
    'application/xml': function() {
      res.type('application/xml');
      res.send(toursXml);
    },
    'text/xml': function() {
      res.type('text/xml');
      res.send(toursXml);
    },
    'text/plain': function() {
      res.type('text/plain');
      res.send(toursText)
    }
  });
});

// 使用更新的PUT节点
// PUT节点更新一个产品信息然后返回json。参数在查询字符串中传递（路由字符串中的":id"命令Express在req.params中增加一个id属性）
// API 用于更新一条数据并且返回json；参数在查询字符串中传递
app.put('/api/tour/:id', function(req, res) {
  var p = tours.some(function(p) {
    return p.id == req.params.id;
  });
  if(p) {
    if(req.query.name) {
      p.name = req.query.name;
    }
    if(req.query.price) {
      p.price = req.query.price;
    }
    res.json({success: true});
  } else {
    res.json({error: 'No such tour exists.'});
  }
});

// 用于删除的DEL节点
// API 用于删除一个产品
app.del('/api/tour/:id', function(req, res) {
  var i;
  for(var i=tours.length-1; i>=0; i--) {
    if(tours[i].id == req.params.id)
    break
  }
  if(i>=0) {
    tours.splice(i, 1);
    res.json({success: true});
  } else {
    res.json({error: 'No such tour exists.'})
  }
});