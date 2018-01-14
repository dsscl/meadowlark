// &处理未捕获的异常

// 在遇到未处理的异常时，怎么才能正确的关闭服务器？Node有两种机制：
// 1）uncaughtException事件（可能会在将来的Node版本中去掉）
// 2）域（较新的方式，推荐的方式）：一个域基本上是一个执行上下文，它会捕获在其中发生的错误。
// 有了域，你在错误处理上可以更灵活，不再是只有一个全局的未捕获异常处理器，你可以有很多域，可以在处理易出错的代码时创建一个新域。

// 每个请求都在一个域中处理是一种好的做法，这样你就可以追踪哪个请求中所有的未捕获错误并做出相应的响应（正常的关闭服务器）。
// 添加一个中间件就可以非常轻松的满足这个要求（ps:这个中间件应该在所有其他路由或中间件前面）

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
