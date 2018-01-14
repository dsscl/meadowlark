// 在这个javascript文件执行时，它或许在主线程的上下文中，（当用node meadowlark_cluster.js直接运行它时），或者在工作线程的上下文中（在Node集群系统执行它时）。
// 属性cluster.isMaster和cluster.isWorker决定了你运行在哪个上下文中。

// 在我们运行这个脚本时，它是在主线程模式下执行的，并且我们用cluster.fork为系统中的每个CPU启动了一个工作线程。
// 我们还监听了工作线程的exit事件，重新繁衍死掉的工作线程

// 最后，我们在else从句中处理工作线程的情况。
// 既然我们将meadowlark.js配置为模块使用，只需要引入并立即调用它（记住，我们将它作为一个函数输出并启动服务器）。

var cluster = require('cluster');

function startWorker() {
    var worker = cluster.fork();
    console.log('CLUSTER: Worker %d started', worker.id);
}

if(cluster.isMaster) {
    if(require('os').cpus.length > 0) {
        require('os').cpus.forEach(function() {
            startWorker();
        });
    }

    // 记录所有断开的工作线程。如果工作线程断开了，它应该退出
    // 因此我们可以等待exit事件然后繁衍一个新工作线程来代替它
    cluster.on('disconnect', function(worker) {
        console.log('CLUSTER: Worker %d disconnected from the cluster.', worker.id);
    });

    // 当有工作线程死掉（退出）时，创建一个工作线程来代替它
    cluster.on('exit', function(worker, code, signal) {
        console.log('CLUSTER: Worker %d died with exit code %d (%s)', worker.id, code, signal);
        startWorker();
    });

} else {

    // 在这个工作线程上启动我们的应用程序服务器，参见meadowlark.js
    require('./meadowlark.js')();

}