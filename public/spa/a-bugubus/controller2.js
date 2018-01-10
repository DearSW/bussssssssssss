/******************************
 * 
 ****** 贵旅景区直通车  包车管理
 * 
******************************/
var app = angular.module('app');
app
    /* 填写包车申请 % */
    .controller('bus_service_1', function($rootScope, $scope, $state, $filter, $myLocationService, $location, $myHttpService, $stateParams) {

        //新建三个个scope对象
        $scope.onewayformdata = {}; // 单程
        $scope.backformdata = {}; // 往返
        $scope.thenerveformadata = {}; // 包天
        $scope.ioncheck = {};

        /*绑定选项卡*/
        $scope.onTabSelected = function(index) {
            $scope.charterType = index;
        };

        /*设定选择按钮默认值*/
        $scope.ioncheck.checked = false;

        /*获取selectstartaddr信息*/
        if($rootScope["startLocation"]) { // 找根作用域里的starLocation的值，这是一种先检测使用后定义的写法
            var data = $rootScope["startLocation"];
            $scope.startLocation = data.name;
            $scope.startLocationlnglat = data.lngLat;
        } else {
            // 没有找到的话
            $myLocationService.getCurrentPosition(function(data) {
                if(data.length > 0) {
                    var data = data[0];
                    $rootScope["startLocation"] = {
                        name: data.name,
                        lngLat: data.location.lng + "," + data.location.lat
                    }
                    $scope.startLocation = data.name;
                    $scope.startLocationlnglat = data.location.lng + "," + data.location.lat;
                    $scope.$apply();
                } else {
                    $scope.startLocation = "无法获取你的位置";
                    $scope.startLocationlnglat = "0,0";
                    $scope.$apply();
                }
            });
        }

        if($rootScope["endLocation"]) {
            var data = $rootScope["endLocation"];
            $scope.endLocation = data.name;
            $scope.endLocationlnglat = data.lngLat;
        }

        $scope.selectLocation = function(params, status) {
            $state.go("select_location", {params: params, status: status});
        }

        // 在输入框中的值进行改变的时候，就需要进行数据监控
        // 单程
        $scope.sessionStorageDate = function() {
            sessionStorage.setItem("onewayformdata_charterStartTime", $filter('date')($scope.onewayformdata.charterStartTime, 'yyyy-MM-dd HH:mm'));
        };
        $scope.sessionStorageDate2 = function() {
            sessionStorage.setItem("onewayformdata_charterEndTime", $filter('date')($scope.onewayformdata.charterEndTime, 'yyyy-MM-dd HH:mm'));     
        }
        $scope.sessionStoragePerson1 = function() {
            sessionStorage.setItem("onewayformdata_charterCount", $scope.onewayformdata.charterCount);
        }
        // 往返
        $scope.sessionStorageDate3 = function() {
            sessionStorage.setItem("backformdata_charterStartTime", $filter('date')($scope.backformdata.charterStartTime, 'yyyy-MM-dd HH:mm'));
        };
        $scope.sessionStorageDate4 = function() {
            sessionStorage.setItem("backformdata_charterEndTime", $filter('date')($scope.backformdata.charterEndTime, 'yyyy-MM-dd HH:mm'));
        }
        $scope.sessionStoragePerson2 = function() {           
            sessionStorage.setItem("backformdata_charterCount", $scope.backformdata.charterCount);
        }
        // 包天
        $scope.sessionStorageDate5 = function() {
            sessionStorage.setItem("thenerveformadata_charterStartTime", $filter('date')($scope.thenerveformadata.charterStartTime, 'yyyy-MM-dd HH:mm'));
        };
        $scope.sessionStorageDate6 = function() {
            sessionStorage.setItem("thenerveformadata_charterEndTime", $filter('date')($scope.thenerveformadata.charterEndTime, 'yyyy-MM-dd HH:mm'));            
        }
        $scope.sessionStoragePerson3 = function() {
            sessionStorage.setItem("thenerveformadata_charterCount", $scope.thenerveformadata.charterCount);
        }

        /* 单程数据设置  */
        if(sessionStorage.getItem("onewayformdata_charterStartTime") != null) {
            var onewayformdata_charterStartTime = sessionStorage.getItem("onewayformdata_charterStartTime");
        } else {
            var onewayformdata_charterStartTime = new Date();
        }
        if(sessionStorage.getItem("onewayformdata_charterEndTime") != null) {
            var onewayformdata_charterEndTime = sessionStorage.getItem("onewayformdata_charterEndTime");
        } else {
            var onewayformdata_charterEndTime = new Date();
        }
        if(sessionStorage.getItem("onewayformdata_charterCount") != null) {
            var onewayformdata_charterCount = sessionStorage.getItem("onewayformdata_charterCount");
        }
        $scope.onewayformdata = {
            StartTime: "出发时间",
            charterStartTime: onewayformdata_charterStartTime,
            EndTime: "结束时间",
            charterEndTime: onewayformdata_charterEndTime,
            charterCount: onewayformdata_charterCount
        };
        /* 往返数据设置  */        
        if(sessionStorage.getItem("backformdata_charterStartTime") != null) {
            var backformdata_charterStartTime = sessionStorage.getItem("backformdata_charterStartTime");
        } else {
            var backformdata_charterStartTime = new Date();
        }
        if(sessionStorage.getItem("backformdata_charterEndTime") != null) {
            var backformdata_charterEndTime = sessionStorage.getItem("backformdata_charterEndTime");
        } else {
            var backformdata_charterEndTime = new Date();
        }
        if(sessionStorage.getItem("backformdata_charterCount") != null) {
            var backformdata_charterCount = sessionStorage.getItem("backformdata_charterCount");
        }
        $scope.backformdata = {
            StartTime: "出发时间",
            charterStartTime: backformdata_charterStartTime,
            EndTime: "结束时间",
            charterEndTime: backformdata_charterEndTime,
            charterCount: backformdata_charterCount
        };
        /* 包天数据设置  */        
        if(sessionStorage.getItem("thenerveformadata_charterStartTime") != null) {
            var thenerveformadata_charterStartTime = sessionStorage.getItem("thenerveformadata_charterStartTime");
        } else {
            var thenerveformadata_charterStartTime = new Date();
        }
        if(sessionStorage.getItem("thenerveformadata_charterEndTime") != null) {
            var thenerveformadata_charterEndTime = sessionStorage.getItem("thenerveformadata_charterEndTime");
        } else {
            var thenerveformadata_charterEndTime = new Date();
        }
        if(sessionStorage.getItem("thenerveformadata_charterCount") != null) {
            var thenerveformadata_charterCount = sessionStorage.getItem("thenerveformadata_charterCount");
        }
        $scope.thenerveformadata = {
            StartTime: "出发时间",
            charterStartTime: thenerveformadata_charterStartTime,
            EndTime: "结束时间",
            charterEndTime: thenerveformadata_charterEndTime,
            charterCount: thenerveformadata_charterCount
        };

        /* 跳转函数 */
        $scope.gotobusservice3 = function(startLocation, endLocation, $mylocalSotrage) {
            /*获取用户id*/
            $scope.userid = $rootScope.session.user.userInfo.userid;
            var usermessobj = {};
            /*判断选择的那个表单*/
            if($scope.charterType == 1) {
                usermessobj = {
                    userid: $scope.userid,
                    startLocation: startLocation,
                    startLoLa: $scope.startLocationlnglat,
                    endLocation: endLocation,
                    endLoLa: $scope.endLocationlnglat,
                    charterType: $scope.charterType,
                    needInfo: $scope.ioncheck.checked,
                    charterStartTime: $filter('date')($scope.onewayformdata.charterStartTime,'yyyy-MM-dd HH:mm'),
                    charterEndTime: $filter('date')($scope.onewayformdata.charterEndTime,'yyyy-MM-dd HH:mm'),
                    charterCount: $scope.onewayformdata.charterCount,
                };

            } else if ($scope.charterType == 2) {
                usermessobj={
                    userid:$scope.userid,
                    startLocation:startLocation,
                    startLoLa:$scope.startLocationlnglat,
                    endLocation:endLocation,
                    endLoLa:$scope.endLocationlnglat,
                    charterType:$scope.charterType,
                    needInfo:$scope.ioncheck.checked,
                    charterStartTime : $filter('date')($scope.backformdata.charterStartTime,'yyyy-MM-dd HH:mm'),
                    charterEndTime:$filter('date')($scope.backformdata.charterEndTime,'yyyy-MM-dd HH:mm'),
                    charterCount:$scope.backformdata.charterCount,
                };

            } else if ($scope.charterType == 3) {
                usermessobj={
                    userid:$scope.userid,
                    startLocation:startLocation,
                    startLoLa:$scope.startLocationlnglat,
                    endLocation:endLocation,
                    endLoLa:$scope.endLocationlnglat,
                    charterType:$scope.charterType,
                    needInfo:$scope.ioncheck.checked,
                    charterStartTime :$filter('date')($scope.thenerveformadata.charterStartTime,'yyyy-MM-dd HH:mm'),
                    charterEndTime:$filter('date')($scope.thenerveformadata.charterEndTime,'yyyy-MM-dd HH:mm'),
                    charterCount:$scope.thenerveformadata.charterCount,
                };
            }

            // 乘车人数数据校验
            var chartercount =/[^\d]/g;
            if(usermessobj.endLocation == undefined || usermessobj.endLocation == "") {
                layer.msg("请输入目的地");
                return;
            }else if(chartercount.test(usermessobj.charterCount)) {
                layer.msg("请输入正确的乘车人数");
                return;
            }

            $scope.formtime={
                oneformstartdate:$filter('date')($scope.onewayformdata.charterStartTime,'yyyy-MM-dd HH:mm'),
                oneformendtime:$filter('date')($scope.onewayformdata.charterEndTime,'yyyy-MM-dd HH:mm'),
                twoformstartdate:$filter('date')($scope.backformdata.charterStartTime,'yyyy-MM-dd HH:mm'),
                twoformendtime:$filter('date')($scope.backformdata.charterEndTime,'yyyy-MM-dd HH:mm'),
                thereformstartdate:$filter('date')($scope.thenerveformadata.charterStartTime,'yyyy-MM-dd HH:mm'),
                thereformendtime:$filter('date')($scope.thenerveformadata.charterEndTime,'yyyy-MM-dd HH:mm')
            };

            /*判断用户输入的时间是否正确*/
            var time= new Date();
            var month=time.getMonth()+1;
            var day=time.getDate();
            var hours=time.getHours();
            var min = time.getMinutes();

            if(month<10){
                month = '0'+month;
            }
            if(day<10){
                day='0'+day;
            }
            if(hours<10){
                hours='0'+hours;
            }
            if(min<10){
                min='0'+min;
            }
            var windowdate=time.getFullYear()+'-'+month+'-'+day+' '+hours+':'+min;
            if(usermessobj.charterType == 1) {
                if($scope.formtime.oneformstartdate > $scope.formtime.oneformendtime) {
                    layer.msg('结束时间不能小于开始时间');
                    return false;
                } else if ($scope.formtime.oneformstartdate == $scope.formtime.oneformendtime) {
                    layer.msg('请输入正确的时间');
                    return false;
                } else if ($scope.formtime.oneformstartdate < windowdate) {
                    layer.msg('出发时间已经过了哦');
                    //layer.msg($scope.formtime.oneformstartdate+"----"+windowdate);
                    return false;
                } else if ($scope.formtime.oneformendtime < windowdate) {
                    layer.msg('结束时间已经过了哦');
                    return false;
                }
            } else if (usermessobj.charterType == 2) {
                if($scope.formtime.twoformstartdate>$scope.formtime.twoformendtime){

                    layer.msg('结束时间不能小于开始时间');
                    return false;
                }else if($scope.formtime.twoformstartdate==$scope.formtime.twoformendtime){
                    layer.msg('请输入正确的时间');
                    return false;
                }else if($scope.formtime.twoformstartdate<windowdate){
                    layer.msg('出发时间已经过了哦');
                    return false;
                }else if($scope.formtime.twoformendtime<windowdate){
                    layer.msg('结束时间已经过了哦');
                    return false;
                }
            } else if (usermessobj.charterType == 3) {
                if($scope.formtime.thereformstartdate>$scope.formtime.thereformendtime){
                    layer.msg('结束时间不能小于开始时间');
                    return false;
                }else if($scope.formtime.thereformstartdate==$scope.formtime.thereformendtime){
                    layer.msg('请输入正确的时间');
                    return false;
                }else if($scope.formtime.thereformstartdate<windowdate){
                    layer.msg('出发时间已经过了哦');
                    return false;
                }else if($scope.formtime.thereformendtime<windowdate){
                    layer.msg('结束时间已经过了哦');
                    return false;
                }
            }

            $state.go('bus_service_mess', {usermessobj: JSON.stringify(usermessobj)});
        };

    })
    
    /* 进一步完善包车申请信息 % */
    .controller('bus_service_2',function($rootScope, $scope, $state, $myHttpService) {
        $scope.argee=true;
        $scope.agreeChange=function(){
            $scope.argee = !$scope.argee;
        }

        /*处理用户选择的类型*/
        $scope.usermesschartype={
            1:'单程',
            2:'往返',
            3:'包天'
        };
        $scope.needinfotype={
            true:'需要司机',
            false:'不需要司机'
        }

        /*处理接受的对象*/
        $scope.usermessobj=JSON.parse($state.params.usermessobj);
        $scope.usermessobj.charterCount=parseInt($scope.usermessobj.charterCount);

        /*接收第二个页面的值提交后台服务*/
        $scope.buservice=function(){
            var info=/^[\u4e00-\u9fa5]{2,4}$/;
            if($scope.usermessobj.commName==undefined){
                layer.msg("请输入联系人昵称");
                return false;
            }else if(!info.test($scope.usermessobj.commName)){

                layer.msg('请输入正确的联系人昵称');
                return false;
            };

            var tellinfo=/^1[34578]\d{9}$/;
            if($scope.usermessobj.commMobile == undefined || $scope.usermessobj.commMobile == "") {
                layer.msg("请输入联系方式");
                return false;
            } else if(!tellinfo.test($scope.usermessobj.commMobile)) {
                layer.msg('请输入正确的联系方式');
                return false;
            };
            console.log($scope.usermessobj.repInfo);
             if($scope.usermessobj.repInfo != undefined && $scope.usermessobj.repInfo != '') {
                 if($scope.usermessobj.repInfo.length > 100) {
                     layer.msg("备注输入内容长度不能超过100个字,请重新输入");
                     return false;
                 }
             }
                 $myHttpService.post('api/charterOrder/newCharterCase',$scope.usermessobj, function(data) {
                         /*提交成功后跳转到成功的页面*/
                         $state.go("bus_submit_success", {charterid: data.charterid, caseStatus: data.caseStatus}, {location: 'replace'});
                         //$location.path("/bus_submit_success",{charterid:data.charterid,caseStatus:data.caseStatus}).replace();
                     }
                 );

        }
    })

    /* 获取单个数据信息 % */
    .controller('bus_service_all',function($scope, $http, $myHttpService, $stateParams, $state, $rootScope) {
        $scope.caseStatus=$state.params.caseStatus;
        $scope.usercharteridmess={
            charterid:$state.params.charterid
        };
        /*根据用户的id请求服务器再次查询状态信息*/
        $myHttpService.post('api/charterOrder/CharterCaseDetails',$scope.usercharteridmess,function(data){
            /*获取相关信息,进行格式转换*/
           $scope.usermess={
               userid:data.userid,
               startLocation:data.startLocation,
               endLocation:data.endLocation,
               charterStartTime:data.charterStartTime,
               charterEndTime:data.charterEndTime,
               charterCount:data.charterCount,
               charterType:data.charterType,
               commName:data.commName,
               commMobile:data.commMobile,
               reqInfo:data.reqInfo,
               caseStatus:data.caseStatus,
               totalfee:data.totalfee,
               needInfo:data.needInfo
           };
            console.log(JSON.stringify(data));
        });

        //判断类型
        $scope.charterTypestaus={
            1:'单程',
            2:'往返',
            3:'包天'
        };
        //判断用户状态
        $scope.usercaseStatus={
            1:'待审核',
            2:'审核失败',
            3:'未支付',
            4:'支付失败',
            5:'已支付',
            6:'已完成'
        };
        $scope.needinfostaus={
            true:'需要司机',
            false:'不需要司机'
        };

        /*给未支付或者支付状态按钮赋予事件*/
        //{chargefee:$scope.newpay.chargefee,rechargeid:$scope.newpay.rechargeid}
           $scope.pay=function() {
               if($scope.usermess.caseStatus == '1') {
                   layer.msg('请等待管理员审核');
               }
               else if($scope.usermess.caseStatus == '3'||$scope.usermess.caseStatus=='4'){
                   $state.go('bus_service_pay',{totalfee:$scope.usermess.totalfee,charterid:$scope.usercharteridmess.charterid}).replace();
                }else if($scope.usermess.caseStatus=='5'||$scope.usermess.caseStatus=='6'){
                   layer.msg('此订单已完成');
               }
            }

    })

    /* 包车 订单 支付 % */
    .controller('charterpayController', function($scope, $myHttpService, $rootScope, $location, $state) {
        /*接收上一个界面传过来的值*/
        $scope.totalfee=$state.params.totalfee;
        $scope.charterid=$state.params.charterid;
        $scope.nextpay = function(){
            $myHttpService.post('api/payOrder/newPayCase',{
                charterid: $scope.charterid,
                userid:$rootScope.session.user.userInfo.userid,
                openid:$rootScope.session.user.userInfo.openid
            },function(data){
                function onBridgeReady(){
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest',
                        data,
                        function(res){
                            if(res.err_msg == "get_brand_wcpay_request:ok") {
                                //重新查询一次服务器
                                $myHttpService.post("api/payOrder/verifyWxorderStatus",{
                                    rechargeid:data.rechargeid
                                },function(data){
                                    alert("您本次成功支付了"+$scope.totalfee+"元");
                                    $location.url("/bus_service_history").replace();
                                },function(data){
                                    alert("支付失败，请联系客服处理。");
                                });
                            }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                                alert("你取消了本次支付");
                            }else{
                                alert("支付失败，请联系客服处理。");
                            }
                        }
                    );
                }
                if (typeof WeixinJSBridge == "undefined"){
                    if( document.addEventListener ){
                        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                    }else if (document.attachEvent){
                        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                    }
                }else{
                    onBridgeReady();
                }
            });

        }
    })

    /* 提交成功后跳转的界面 */
    .controller('bus_submit_success', function($scope, $location, $state) {
        $scope.caseStatus=$state.params.caseStatus;
        $scope.charterid=$state.params.charterid;
        $scope.querystuts=function(){
            $state.go('bus_service_all',{caseStatus:$scope.caseStatus,charterid:$state.params.charterid}).replace();
        }
    })

    /* 获取历史数据信息列表 */
    .controller('bus_service_history', function($scope, $http, $myHttpService, $rootScope, $stateParams, $location,$ionicScrollDelegate,$state) {
        $scope.userallmess= [];
        $scope.offset = 0;
        $scope.pagesize = 20;
        $scope.count = 0;
        $scope.showMoreBtn = false;
        $scope.getData = function(){
            $myHttpService.post('api/charterOrder/queryOrderRecords',{
                userid: $rootScope.session.user.userInfo.userid,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum= data.totalnum;
                /*更改状态*/
                $scope.queryusertype={
                    1:'单程',
                    2:'往返',
                    3:'包天'
                };
                $scope.queryuserstaus={
                    1:'待审核',
                    2:'审核失败',
                    3:'未支付',
                    4:'支付失败',
                    5:'已支付',
                    6:'已完成'
                };
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.userallmess = data.body;
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
                //$scope.$apply();
            })
        };
        /*查看用户详情*/
        $scope.bus_service_all=function(item){
            $state.go('bus_service_all',{
                charterid:item.charterid,
                caseStatus:item.caseStatus
            });
        };

        $scope.getData();

        $scope.refresh = function () {
            $scope.offset = 0;
            $myHttpService.postNoLoad('api/charterOrder/queryOrderRecords', {
                //runstatus: 1,
                userid: $rootScope.session.user.userInfo.userid,
                offset: $scope.offset,
                pagesize: $scope.pagesize
            }, function (data) {
                $scope.totalnum = data.totalnum;
                if ($scope.totalnum - ($scope.offset + $scope.pagesize) > 0) {
                    $scope.showMoreBtn = true;
                } else {
                    $scope.showMoreBtn = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.userallmess = data.body;
                window.setTimeout(function () {
                    $ionicScrollDelegate.resize();
                }, 0);
                layer.msg("刷新成功");
                //$scope.$apply();
            })
        };

        $scope.getMoreData = function(){
            $scope.offset = $scope.offset+$scope.pagesize;
            $myHttpService.post('api/charterOrder/queryOrderRecords',{
                userid: $rootScope.session.user.userInfo.userid,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum = data.totalnum;
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.userallmess = $scope.userallmess.concat(data.body);
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
            })
        }
    })

    .controller('ScheduleTicketPay', function($rootScope, $scope, $location, $state, $stateParams, $myHttpService, $filter, $window) {
        /*查询本地缓存数据*/
        var arrayObj =$window.localStorage.getItem('saveMess')===null?[]:JSON.parse($window.localStorage.getItem('saveMess'));

        $scope.agreeStatus = true;
        $scope.agreeStatusChange = function(){
            $scope.agreeStatus = !$scope.agreeStatus;
        };
        //初始化当前页面的变量
        $scope.orderInfo = {
            payType:'0'
        };
        $scope.status =false;
        $scope.moneypay={};
       $scope.moneypay.checked=false;


        $scope.orderInfo.payType=true;
        if($stateParams.chargingtype==0){
        //从服务器获取车票订单数据(月票)
        $myHttpService.post("api/busline/queryCycleBusSchedulePrice",{
            bsid:$stateParams.bsid,
            userid:$rootScope.session.user.userInfo.userid,
            pdepartaddr:$stateParams.staddr,
            parriveaddr:$stateParams.edaddr
        },function(data){
            //alert("月票信息:"+parseInt($stateParams.addprice));

            var orderInfo={
                bsid:data.busSchedule.bsid,
                linename:data.busSchedule.linename,
                depart:data.pdepartaddr,
                arrive:data.parriveaddr,
                totalMoney:parseFloat($stateParams.addprice),
                //totalMoney:$stateParams.addprice,
                plateNum:data.busSchedule.platenum,
                goDepartTime:data.busSchedule.departtime,
                backDepartTime:data.busSchedule.arrivetime,
                startDate:data.startdate,
                endDate:data.enddate,
            };
            //parseInt(orderInfo.totalMoney);


            var date = new Date(data.startdate);
            orderInfo.year = date.getFullYear();
            orderInfo.month = date.getMonth()+1;
            orderInfo.chargingtype=$stateParams.chargingtype;


            $scope.status=true;
            //arrayObj.push(orderInfo);
            if(arrayObj.length>0){
                var flag= false;
                for(var m = 0;m<arrayObj.length;m++){
                    /*new需求 根据起点终点是否相同进行判断*/
                    if(orderInfo.bsid==arrayObj[m].bsid && arrayObj[m].chargingtype==orderInfo.chargingtype && arrayObj[m].depart==orderInfo.depart && arrayObj[m].arrive==orderInfo.arrive){
                        flag = true;
                        layer.msg('请勿重复选择车票');
                        break;
                    }

                }
                if(!flag){
                    arrayObj.push(orderInfo);
                }

            }else{
                arrayObj.push(orderInfo);
            }

            $scope.orderList = arrayObj;
            //console.log(JSON.stringify($scope.orderList));
            //计算支付金额
               var paymoney=0;
               for(var order=0;order<$scope.orderList.length;order++){
                   paymoney=paymoney+$scope.orderList[order].totalMoney;
               }
             $scope.orderList.ticketmoney = paymoney;

            //封装班次bsid与时间
                var ticketArr=[];
               for(var b=0;b<arrayObj.length;b++){
                   ticketArr.push(arrayObj[b].bsid+'&'+$filter('date')(arrayObj[b].startDate,'yyyy-MM-dd')+'&'+arrayObj[b].chargingtype+'&'+arrayObj[b].depart+'&'+arrayObj[b].arrive);
               }
                $scope.tickeObj=ticketArr;
        });
        }
        if($stateParams.chargingtype==2){
            //从服务器获取车票订单数据（次票）
            $myHttpService.post("api/busline/queryCycleBusScheduleSinglePrice",{
                userid:$rootScope.session.user.userInfo.userid,
                bsid:$stateParams.bsid,
                pdepartaddr:$stateParams.staddr,
                parriveaddr:$stateParams.edaddr
            },function(data){
                //alert("次票信息:"+JSON.stringify(data));

                var orderInfo={
                    bsid:data.busSchedule.bsid,
                    linename:data.busSchedule.linename,
                    depart:data.pdepartaddr,
                    arrive:data.parriveaddr,
                    //totalMoney:data.totalpay,
                    totalMoney:parseFloat($stateParams.addprice),
                    plateNum:data.busSchedule.platenum,
                    goDepartTime:data.busSchedule.departtime,
                    backDepartTime:data.busSchedule.backDeparttime,
                    startDate:data.usedate,
                    endDate:data.enddate,
                    price:data.busSchedule.price
                };
                //$scope.orderInfo.linename =  data.busSchedule.linename;
                //$scope.orderInfo.depart = data.busSchedule.departaddr;
                //$scope.orderInfo.arrive = data.busSchedule.arriveaddr;
                //$scope.orderInfo.totalMoney = data.totalpay;
                //$scope.orderInfo.plateNum = data.busSchedule.platenum;
                //$scope.orderInfo.goDepartTime = data.busSchedule.departtime;
                //$scope.orderInfo.backDepartTime = data.busSchedule.backDeparttime;
                //$scope.orderInfo.startDate = data.startdate;
                //$scope.orderInfo.endDate = data.enddate;
                //$scope.orderInfo.usedate=data.usedate;
                //$scope.orderInfo.price=data.busSchedule.price;
                //$scope.orderInfo.balance=data.balance;
                //计算当前年月
                var date = new Date(data.usedate);
                orderInfo.year = date.getFullYear();
                orderInfo.month = date.getMonth()+1;
                orderInfo.day = date.getDate();
                orderInfo.chargingtype=$stateParams.chargingtype;
                $scope.status=true;
                if(arrayObj.length>0){
                    var flag = false;//false 内容不相同 true 内容相同
                    for(var m = 0;m<arrayObj.length;m++){
                        /*new需求 根据起点终点是否相同进行判断*/
                        if(orderInfo.bsid==arrayObj[m].bsid && arrayObj[m].chargingtype==orderInfo.chargingtype && arrayObj[m].depart==orderInfo.depart && arrayObj[m].arrive==orderInfo.arrive){
                            flag = true;
                            layer.msg('请勿重复选择车票');
                            break;
                        }


                    }
                    if(!flag){
                        arrayObj.push(orderInfo);
                    }
                }else{
                    arrayObj.push(orderInfo);
                }
                $scope.orderList = arrayObj;
                //alert("次票orderlist"+JSON.stringify($scope.orderList));
                //计算支付金额
                var paymoney=0;
                for(var order=0;order<$scope.orderList.length;order++){
                    paymoney=paymoney+$scope.orderList[order].totalMoney;
                }
                $scope.orderList.ticketmoney = paymoney;


                //封装班次bsid与时间和类型
                //var ticketArr=[];
                //for(var b=0;b<arrayObj.length;b++){
                //    ticketArr.push(arrayObj[b].bsid+'&'+$filter('date')(arrayObj[b].startDate,'yyyy-MM-dd')+"&"+arrayObj[b].chargingtype);
                //}
                //$scope.tickeObj=ticketArr;

            });
        }

        /*存值*/
        $scope.setObject= function(key,value) {
            $window.localStorage[key]=angular.toJson(value);
            $state.go("schedule_opened");
        };
        //$scope.getObject=function(key){
        //    return JSON.parse($window.localStorage[key] || '{}');
        //};
        /*删除*/
        $scope.removeDate=function(val){
            //alert(JSON.stringify(arrayObj.splice(val)));
            arrayObj.splice(val,1);
            $window.localStorage['saveMess']=angular.toJson(arrayObj);

            /*监听orderList数据改变*/
            $scope.$watch('orderList',function(){
                var paymoney=0;
                for(var order=0;order<$scope.orderList.length;order++){
                    paymoney=paymoney+$scope.orderList[order].totalMoney;
                }
                $scope.orderList.ticketmoney = paymoney;
                /*为空*/
               if($scope.orderList==''){
                   $scope.status=true;
                   $scope.status=!$scope.status;
               }

            });
        };

        $scope.selectDate=function(){
            $location.url("/schedule_opened").replace();
        };

        /*查询用户余额*/
        $myHttpService.post("api/user/queryUserBarcode",{
            userid:$rootScope.session.user.userInfo.userid
        },function(data){
            $scope.balance =parseFloat(data.user.balance) ;
        });




        /*提交信息*/
        $scope.submitOrder  = function(){
            /*查询余额*/
            if($scope.orderInfo.payType==false && $scope.moneypay.checked==true){
                if($scope.balance==0){
                    layer.msg("储值卡余额不足，请更换支付方式");
                    return;
                }
                if($scope.balance<$scope.orderList.ticketmoney){
                    layer.msg("储值卡余额不足，请更换支付方式");
                    return;
                }
            }
            if($scope.orderInfo.payType==false && $scope.moneypay.checked==false ){
                layer.msg("请选择支付方式");
                return;
            }
            if($scope.moneypay.checked==true && $scope.orderInfo.payType==true && $scope.balance > $scope.orderList.ticketmoney){
                layer.msg('您的余额充裕,请使用储值卡支付');
                return;
            }

            //封装班次bsid与时间和类型
            var ticketArr=[];
            for(var b=0;b<$scope.orderList.length;b++){
                ticketArr.push($scope.orderList[b].bsid+'&'+$filter('date')($scope.orderList[b].startDate,'yyyy-MM-dd')+"&"+$scope.orderList[b].chargingtype+'&'+arrayObj[b].depart+'&'+arrayObj[b].arrive);
            }
            $scope.tickeObj=ticketArr;

            $myHttpService.post("api/busline/buyMonthTicket",{
                userid:$rootScope.session.user.userInfo.userid,
                //openid:$rootScope.session.user.openId,
                openid:$rootScope.session.user.userInfo.openid,
                bsid:$scope.tickeObj,
                //timestr: $filter('date')(orderInfo.startDate,'yyyy-MM')
                moneycar:$scope.moneypay.checked
            },function(data){
                if(($scope.moneypay.checked==false)||($scope.moneypay.checked==true && $scope.orderInfo.payType==true)){
                    function onBridgeReady(){
                        WeixinJSBridge.invoke(
                            'getBrandWCPayRequest',
                            data,
                            function(res){
                                if(res.err_msg == "get_brand_wcpay_request:ok") {
                                    //重新查询一次服务器
                                    $myHttpService.post("api/recharge/verifyWxorderStatus",{
                                        rechargeid:data.rechargeid,
                                    },function(data){
                                        /*提交成功后清空本地数据*/
                                        $window.localStorage.clear();
                                        $location.url("/ticket/pay_success?orderList="+JSON.stringify($scope.orderList)).replace();
                                    },function(data){
                                        alert("支付失败，请联系客服处理。");
                                    });
                                }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                                    alert("你取消了本次支付");

                                }else{
                                    alert("支付失败，请联系客服处理。");
                                }
                            }
                        );
                    }
                    if (typeof WeixinJSBridge == "undefined"){
                        if( document.addEventListener ){
                            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                        }else if (document.attachEvent){
                            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                        }
                    }else{
                        onBridgeReady();
                    }

                }else if($scope.moneypay.checked==true){
                    /*提交成功后清空本地数据*/
                    $window.localStorage.clear();
                    $location.url("/ticket/pay_success?orderList="+JSON.stringify($scope.orderList)).replace();
                }

            });
        }
    })


/**
 *                              _ooOoo_
 *                            o8888888o
 *                            88"   .   "88
 *                             (|   -_-   |)
 *                             o\   =   /o
 *                         ____/`---'\____
 *                      .'  \\|              |//  `.
 *                    /  \\|||       :        |||//  \
 *                   /  _|||||       _:_        |||||-  \
 *                   |   | \\\     - -      /// |   |
 *                    | \_|  ''\   ----   /''  |   |
 *                     \  .-\__  `-`  ___/-. /
 *                   ___`. .'   /--.--\    `. . __
 *                ."" '<  `.___\_<|> _/___.'    >'"".
 *               | | :  `- \`.;`\    _     /`;.`/ - ` : | |
 *               \  \ `-.   \_ __\ /__ _/   .-` /  /
 *   ======`-.____`-.___\_____/___.-`____.-'======
 *                               `=---='
 *   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                     佛祖保佑        永无BUG
 *                     佛祖保佑        永无BUG
 * 
 */