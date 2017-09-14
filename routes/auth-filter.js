var httpProxy = require('../routes/http-proxy');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/login', function(req, res, next) {

	console.log("召维：登录（/login）");
	//设置权限检查禁止浏览器缓存数据
	res.header("Cache-Control",  "no-cache, no-store, must-revalidate");
	res.header("Pragma",  "no-cache");
	res.header("Expires",  0);

	// 防止同一账号在不同的设备上同时登陆，后一个登录账号会挤掉前一个登录账号，维护session
	function checkRepeatLogin(currentSesstion, currentSesstionID, originSession) {
		var flag = false;
		var repeatSessionID = null;	
		if(currentSesstion.user != null && currentSesstion.user.userInfo != null) {
			var phone = currentSesstion.user.userInfo.phone;
			for(var key in originSession) {			
				var temp = JSON.parse(originSession[key]);
				if(temp.user != null && temp.user.userInfo != null) {
					var phone2 = temp.user.userInfo.phone;
					if(key != currentSesstionID && phone == phone2) {
						flag = true;
						repeatSessionID = key;
						delete originSession[repeatSessionID];
					}
				}
			}
		}
		return flag;
	}
	//进行登录
	httpProxy("/user/userLogin", req.body, function(data) {
		console.log("召维：代理登录（/userLogin）");	

		if(req.session.user == undefined) {
			req.session.user = {};
		}
		req.session.user.userInfo = JSON.parse(data).data.user;

		var originSession = req.sessionStore.sessions;
		var currentSesstion = req.session;
		var currentSesstionID = req.sessionID;

		var xxxx = checkRepeatLogin(currentSesstion, currentSesstionID, originSession);
		console.log("召维：检测重复登录的值");
		console.log(xxxx);
		res.send(data);
		res.end();
	}, function(data) {
		res.send(data);
		res.end();
	});
});

router.get('/check', function(req, res, next) {
	//设置 禁止浏览器缓存数据
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	if (req.session.user == undefined) {
		res.send({
			"code": 0,
			"data": null
		});
	} else {
		res.send({
			"code": 0,
			"data": req.session.user
		});
	}
});

router.get('/logout', function(req, res, next) {
	//设置 禁止浏览器缓存数据
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	req.session.user = undefined;
	res.send({
		"code": 0,
		"data": null
	});
});
module.exports = router;
