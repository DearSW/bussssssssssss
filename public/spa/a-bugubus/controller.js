/******************************
 * 
 ****** 贵旅景区直通车  总控制器
 * 
******************************/
var app = angular.module('app');
app
    /**
     *  主控制器
     */
    .controller('AppController', function($rootScope, $scope, $state, $ionicViewSwitcher, $location) {
        $rootScope.routerInclude = function(url) {
            //ui-router自带的include有坑，在进行json对象序列化时，序列化出来的对象，name和url均为空
            //如下代码可以进行检测
            /*$scope.currState = $state;
            console.log("This one have some objects: ");
            console.log('by reference:', $scope.currState);
            console.log('by value:', JSON.parse(JSON.stringify($scope.currState)));

            // console.log("But when I want to access name its empty: ");
            // $timeout(function() {
            //    console.log($state.current.name);
            // });

            // use this instead:
            $scope.$watch('currState.current.name', function(newValue, oldValue) {
            console.log(newValue);
            });*/
            $scope.currState = $state;
            if($scope.currState.current.name.indexOf(url)!=-1){
                return true;
            }
            return false;
        }
        /**控制器切换*/
        $scope.changePage = function(route) {
            /**
             * 为了防止浏览器留下历史记录
             */
            $location.path(route).replace();
        }
    })
    /**
     *  用户注册、登录控制器 %
     */
    .controller('LoginController', function($rootScope, $scope, $state, $stateParams, $ionicViewSwitcher, $myHttpService, $location) {

        if($stateParams.url) {
            $scope.showTip = true;
            $scope.tips = "请先验证您的手机号";
        }

        //定义用户对象
        $scope.user = {}; // 其实就是数据容器dataContainer

        //标记是否开启第一步
        $scope.first = true;
        $scope.sendButtonText = "重新获取",
        $scope.sendStatus = true;

        $scope.sendCode = function() {
            //对参数做预处理
            var checkcode = $scope.user.mobile%($scope.user.mobile.toString().substr(1,3));
            console.log($scope.user.mobile);

            $myHttpService.post("api/utils/sendAuthcode", {
                phone: $scope.user.mobile,
                servicename: "WechatUserLogin",
                checkcode: checkcode
            }, function(data) {
                layer.msg("短信验证码发送成功");
                $scope.first = false;
                $scope.sendStatus = false;
                var count = 60;
                $scope.sendButtonText = count+"s后获取"
                var timer = window.setInterval(function() {
                    if(count > 0) {
                        count--;
                        $scope.sendButtonText = count+"s后获取";
                        $scope.$apply();
                    } else {
                        $scope.sendStatus = true;
                        $scope.sendButtonText = "重新获取";
                        $scope.$apply();
                        window.clearInterval(timer);
                    }
                }, 1000);
            });
        }

        $scope.next = function() {
            $myHttpService.post("auth/login", {
                phone: $scope.user.mobile,
                authcode: $scope.user.authcode,
                openid: $rootScope.session.user.openId
            }, function(data) {
                //登录成功，更新session
                $rootScope.session.user.userInfo = data.user;
                //登录后检查重定向路径，重定向到登陆前的路径
                if($stateParams.url) {
                    console.log($stateParams.url);
                    $location.url($stateParams.url).replace(); // 修改当前的url地址(#后面的内容)，且不存入历史记录
                } else {
                    $location.url("/app/buy").replace();
                }
            });
        }
    })
    /**
     * 搜索位置界面控制器 （包车相关）%
     */
    .controller('SelectLocationController', function($rootScope, $scope, $state, $myLocationService, $ionicScrollDelegate) {
        
        // 获取页面传递过来的参数
        var param = $state.params.params, map = null, status = $state.params.status;
        $scope.address = $rootScope[param];
        $scope.poilist = [];
        if($scope.address) {
            //存在，可以直接进行地址解析
            $myLocationService.getPoisByKeyword( $scope.address.name, function(data) {
                var tempArray = [];
                //对数据进行过滤
                for(var i= 0,len=data.length;i<len;i++){
                    if(!(data[i].location==undefined||data[i].location=="")){
                        tempArray.push(data[i]);
                    }
                }
                //重新初始化滚动条
                $ionicScrollDelegate.scrollTo(0,0,true);
                //数据绑定到$scope
                $scope.poilist = tempArray;
                if($scope.poilist.length>0){
                    $scope.poilist[0].active = true;
                }
                //通知angular更新数据
                $scope.$apply();
            });
        }else{
            //不存在，则调用定位服务，获取用户的位置信息
            $myLocationService.getCurrentPosition(function(data){
                if(data.length>0){
                    map.setCenter(data[0].location);
                    $scope.poilist = data;
                    if($scope.poilist.length>0){
                        $scope.poilist[0].active = true;
                        $scope.address = {
                            name:$scope.poilist[0].name,
                            lngLat:$scope.poilist[0].location.getLng()+","+$scope.poilist[0].location.getLat()
                        }
                    }
                    $scope.$apply();
                    //更新坐标到根对象，需要更新时才更新到根对象，通过status确定
                    if(status==true){
                        $rootScope[param]=$scope.address;
                    }
                }
            });
        }
        var map = new AMap.Map("J_map_canvas", {
            zoom: 17,
            animateEnable: false,
            center: $scope.address == undefined ? [0,0] : $scope.address.lngLat.split(',')
        });
        /**
         * 设置地图工具条
         */
        AMap.plugin(['AMap.ToolBar'],
            function() {
                map.addControl(new AMap.ToolBar());
            });
        /**
         * 地图拖动完成时，重新解析兴趣点
         */
        AMap.event.addListener(map, "dragend", function() {
            $myLocationService.getPoisByLngLat( map.getCenter(), function(data) {
                $scope.poilist = data;
                if($scope.poilist.length > 0) {
                    $scope.poilist[0].active = true;
                    //同时更新数据到address
                    $scope.address = {
                        name:$scope.poilist[0].name,
                        lngLat:$scope.poilist[0].location.getLng() + "," + $scope.poilist[0].location.getLat()
                    }
                }
                $ionicScrollDelegate.scrollTo(0,0,true);
                $scope.$apply();
            });
        });
        /**
         * 点击取消按钮，界面退回上级
         */
        $scope.cancel = function() {
            window.history.back(-1);
        }
        /**
         * 控制被选中的那一栏
         * @param item 当前兴趣点列表的数据对象
         * @param index 需要激活的兴趣点的索引
         */
        $scope.active = function(item,index){
            for(var i = 0,len= $scope.poilist.length;i<len;i++){
                if(index==i){
                    $scope.poilist[i].active = true;
                    //同时更新数据到address
                    $scope.address = {
                        name: item.name,
                        lngLat: item.location.getLng()+","+ item.location.getLat()
                    }
                }else{
                    $scope.poilist[i].active = false;
                }
            }
            map.setCenter(item.location);
        }
        /**
         * 保存数据到根对象
         */
        $scope.save = function() {
            $rootScope[param] = $scope.address;
            window.history.back(-1);
        };
        $scope.openSelectAddress = function() {
            $state.go("select_address", {params:param});
        }
    })
    /**
     * 选择兴趣点列表控制器 （包车相关）%
     */
    .controller('SelectAddressController', function($rootScope, $scope, $state, $myLocationService, $ionicScrollDelegate) {
        //先让文本框聚焦
        var param = $state.params.params;
        $scope.keyword = {
            text: ""
        }
        $scope.poilist = [];
        $scope.searchState = true;
        $scope.search = function(){
            $myLocationService.getPoisByKeyword($scope.keyword.text, function(data) {
                var tempArray = [];
                //对数据进行过滤
                for(var i = 0, len = data.length; i < len; i++) {
                    if(!(data[i].location == undefined || data[i].location == "")) {
                        tempArray.push(data[i]);
                    }
                }
                //重新初始化滚动条
                $ionicScrollDelegate.scrollTo(0, 0, true);
                //数据绑定到$scope
                $scope.poilist = tempArray;
                
                if($scope.poilist.length == 0) {
                    $scope.searchState = false; 
                } else {
                    $scope.searchState = true; 
                }
                //通知angular更新数据
                $scope.$apply();
            });
        }
        $scope.cancel = function() {
            window.history.back(-1);
        }
        $scope.active = function(item) {
            $rootScope[param] = {
                name: item.name,
                address: item.address,
                lngLat: item.location.getLng() + "," + item.location.getLat()
            };
            window.setTimeout(function(){window.history.back(-1)},0);
        }
    })
;

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
 *                     操你妈的狗逼设计和策划
 *                     操你妈的狗逼设计和策划
 *                     操你妈的狗逼设计和策划
 *                     操你妈的狗逼设计和策划
 */