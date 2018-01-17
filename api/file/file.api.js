// 云持久化
// 将文件保存到亚马逊S3账号中的例子
var filename = 'customerUpload.jpg';
aws.putObject({
    ACL: 'private',
    Bucket: 'uploads',
    Key: filename,
    Body: fs.readFileSync(__dirname + '/tmp/ + filename')
});

// 用微软Azure完成相同任务的例子
var filename = 'customerUpload.jpg';
var bolbService = azure.createBlobService();
bolbService.putBlockBlobFromFile('upload', filename, __dirname + '/tmp/' + filename);