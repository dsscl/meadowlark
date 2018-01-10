// cookie与会话

// &1.1 Express中的Cookie
// 1)引入
app.use(require('cookie-parser')(credentials.cookieSecret));

// 2)完成这个之后，就可以在任何能访问到响应对象的地方设置cookie或签名cookie：
res.cookie('monster', 'nom nom');
res.cookie('signed_monster', 'nom nom', {signed: true});  // 签名cookie的优先级高于未签名的

// 3)获取客户端发过来的cookie值
var monster = req.cookies.monster;
var signedMonster = req.signedCookies.monster;

// 4)删除cookie
res.clearCookie('monster');

// 5)设置cookie
domain
// 控制跟cookie关联的域名。这样可以将cookie分配给特定的子域名
// ps：不能给cookie设置跟服务器所用域名不同的域名，那样它什么也不会做）
path
// 控制应用这个cookie的路径
// ps:路径会隐含地通配其后的路径
maxAge
// 指定客户端应该保存cookie多长时间，单位毫秒
secure
// 指定该cookie只通过安全(https)链接发送
httpOnly
// 设为true表明这个cookie只能由服务器修改
signed
// 设为true会对这个cookie签名
// ps：被篡改的签名cookie会被服务器拒绝，并且cookie值会重置为它的原始值

// &1.2 会话
// 从广义上讲，有两种实现会话的方法：把所有东西都存在cookie里，或者只在cookie里存一个唯一标识，其他东西都存在服务器上。
// 前一种被称为“基于cookie的会话”

// 1)内存存储
// express-session 中间件配置对象：
key
// 存放唯一会话标识的cookie名称。默认为connect.sid
store
// 会话存储的实例。默认为一个MemoryStore的实例
cookie
// 会话cookie的cookie设置(path domain secure 等)。适用于常规的cookie默认值

// 2)使用会话
req.session.userName = 'Anonymous';
var colorScheme = req.session.colorScheme || 'dark';
// ps: 对于会话而言，不是用请求对象req获取值，用响应对象res设置值，它全部是在请求对象上操作的。（响应对象没有session属性）

// 3)删除会话
req.session.userName = null  // 'userName'不会被移除
delete request.session.colorScheme  // 会移除'colorScheme'

// &1.3 会话的用途
// 当你想跨页面保存用户的偏好时，可以用会话。
// 会话最常见的用法是提供用户验证信息，你登录后就会创建一个会话。之后你就不用在每次重新加载页面时再登录一次，即便没有用户账号，会话也有用
// 尽管建议优先选择使用会话而不是cookie，但理解cookie工作机制很重要（特别是因为有cookie才能用会话）




