//�˴������û�����Ȩ��У��
var httpProxy = require('../routes/http-proxy');
var filter = function(req,res,next){
    //����û���¼���
    if(req.session.user==undefined){
        res.send({"code":401,"data":"Ȩ�޲��㣬�û�δ��¼"})
        res.end();
    }else{
        //��ȡ����Ŀ¼��
        var url = req.originalUrl;//var url = req._parsedUrl.pathname;  ��ȡ����Ŀ¼��
        //��ȡ�������غ��Ŀ¼��
        var serviceUrl =url.substring(4,url.length);
        httpProxy(serviceUrl,req.body,function(data){
            res.send(data);
            res.end();
        },function(data){
            res.send(data);
            res.end();
        });
    }
}
module.exports = filter;
