/**
 * Created by 滕召维 
 * 2017.07.25
 */
/**************************************** 
 * 
 ****** 贵旅景区直通车 我的线路、行程、账户
 * 
****************************************/
var app = angular.module('app');

var errorFn = function() {
        console.log("你好，数据请求失败");
};

/* @浮点数运算对象 */
var floatObj = function() {
    /*
     * @判断obj是否为一个整数
     */
    function isInteger(obj) {
        return Math.floor(obj) === obj
    }
    /*
     * @将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
     * @param floatNum {number} 小数
     * @return {object}
     *   @{times:100, num: 314}
     */
    function toInteger(floatNum) {
        var ret = {times: 1, num: 0}
        if (isInteger(floatNum)) {
            ret.num = floatNum
            return ret
        }
        var strfi  = floatNum + ''
        var dotPos = strfi.indexOf('.')
        var len    = strfi.substr(dotPos+1).length
        var times  = Math.pow(10, len)
        var intNum = parseInt(floatNum * times + 0.5, 10)
        ret.times  = times
        ret.num    = intNum
        return ret
    }
    /*
     * @核心方法，实现加减乘除运算，确保不丢失精度
     * @思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
     *
     * @param a {number} 运算数1
     * @param b {number} 运算数2
     * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
     * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
     *
     */
    function operation(a, b, digits, op) {
        var o1 = toInteger(a); // 一个浮点数转成整数
        var o2 = toInteger(b); // 一个浮点数转成整数
        var n1 = o1.num
        var n2 = o2.num
        var t1 = o1.times
        var t2 = o2.times
        var max = t1 > t2 ? t1 : t2
        var result = null
        switch (op) {
            case 'add':
                if (t1 === t2) { // 两个小数位数相同
                    result = n1 + n2
                } else if (t1 > t2) { // o1 小数位 大于 o2
                    result = n1 + n2 * (t1 / t2)
                } else { // o1 小数位 小于 o2
                    result = n1 * (t2 / t1) + n2
                }
                return result / max
            case 'subtract':
                if (t1 === t2) {
                    result = n1 - n2
                } else if (t1 > t2) {
                    result = n1 - n2 * (t1 / t2)
                } else {
                    result = n1 * (t2 / t1) - n2
                }
                return result / max
            case 'multiply':
                result = (n1 * n2) / (t1 * t2)
                return result
            case 'divide':
                result = (n1 / n2) * (t2 / t1)
                return result
        }
    }
    // @加减乘除的四个接口
    function add(a, b, digits) {
        return operation(a, b, digits, 'add')
    }
    function subtract(a, b, digits) {
        return operation(a, b, digits, 'subtract')
    }
    function multiply(a, b, digits) {
        return operation(a, b, digits, 'multiply')
    }
    function divide(a, b, digits) {
        return operation(a, b, digits, 'divide')
    }
    // @exports
    return {
        add: add,
        subtract: subtract,
        multiply: multiply,
        divide: divide
    }
}();

app
    /* @首页、搜索、控制器 */
    .controller('City_select', function($rootScope, $scope, $state, $timeout, $interval, $myLocationService, $myHttpService, $ionicSlideBoxDelegate, $ionicActionSheet, $selectCity, $filter, ionicDatePicker, $ionicModal) {
        
        // @流程控制，确保推荐在未关闭Ng页面之前仅仅请求一次，优化
        if(sessionStorage.getItem("recommendImgCount") == null) {

            var recommendImgCount = 1; // @流程控制变量
            $rootScope.recommendProducts2 = []; // @推荐图片数组
            var slideImageTimer = null; // @图片控制定时器

        } else {

            var recommendImgCount = sessionStorage.getItem("recommendImgCount");

        }

        $scope.showDefaultImg = true; // @推荐图片不存在时，默认的placeholder

        $scope.dataContainer = { // @数据容器

            input: "", // @用户输入
            btnDisabled: true // @控制搜索按钮状态

        }
        
        if(recommendImgCount == 1) {

            sessionStorage.setItem("recommendImgCount", 2);

            // @请求获取推荐路线数据  /web/product/queryRecommendProductList
            $myHttpService.postNoLoad('api/product/queryRecommendProductList', {}, function(data) {
                console.log("首页：图片推荐API返回的数据");
                console.log(data);
                $rootScope.recommendProducts2 = data.products;
                if($rootScope.recommendProducts2.length == 0) {
                    $timeout(function() {
                        $scope.showDefaultImg = true;
                        $ionicSlideBoxDelegate.update();
                    }, 500);
                } else {
                    $scope.showDefaultImg = false;
                    $ionicSlideBoxDelegate.update();
                    $timeout(function() {
                        $ionicSlideBoxDelegate.next();
                    }, 1000);
                }
            }, errorFn);

        } else {

            clearTimeout(slideImageTimer);
            if($rootScope.recommendProducts2 instanceof Array) { // @加个判断，在调试时容易出错，请求不到数据，导致length属性不存在
                if($rootScope.recommendProducts2.length > 0) {
                    $scope.showDefaultImg = false;
                }
            }
        }
        
        $rootScope.recommendProducts2Index = 0;
        function slideImage() {
            if($rootScope.recommendProducts2 && $rootScope.recommendProducts2.length > 0) {
                $rootScope.recommendProducts2Index = $rootScope.recommendProducts2Index === $rootScope.recommendProducts2.length - 1 ? 0 : $rootScope.recommendProducts2Index + 1;
                $rootScope.slideNumber = $ionicSlideBoxDelegate.$getByHandle("adBanner").currentIndex();
                if ($rootScope.slideNumber + 1 != $rootScope.recommendProducts2Index && $rootScope.recommendProducts2Index != 0) {
                    $rootScope.recommendProducts2Index = $rootScope.slideNumber; //手动滑动后和自动轮播保持一致
                    $ionicSlideBoxDelegate.$getByHandle("adBanner").slide($rootScope.recommendProducts2Index); //只有首页的banner轮播
                } else {
                    $ionicSlideBoxDelegate.$getByHandle("adBanner").slide($rootScope.recommendProducts2Index); //只有首页的banner轮播
                }
            }
        }

        slideImageTimer = $interval(function() {
            slideImage();
        }, 4000);

        $scope.$on("$destroy", function() {
            $interval.cancel(slideImageTimer);
        });
        // @当DOM元素从页面中被移除时，AngularJS将会在scope中触发$destory事件。这让我们可以有机会来cancel任何潜在的定时器
        $scope.$on('$ionicView.beforeLeave', function(event, data) {
            clearTimeout(slideImageTimer);
        });

        // @推荐路线 数据详情，点击图片进行跳转到 产品 页面
        $scope.recommendProductsDetail = function(item, i) {

            var data = {
                productid: item.productid
            };
            console.log("首页：点击图片进入产品页打印参数");
            console.log(data);
            $state.go('tabs', {data: JSON.stringify(data)}, {reload: true});

        };

        // @所在城市
        /*
            if(recommendImgCount == 1) {
                $selectCity.getCity(function(data) {
                    $scope.positionCity = data;
                    // 判断用户当前位置是否在贵州省范围类
                    var pattern = /(贵阳.*|遵义.*|六盘水.*|毕节.*|黔南.*|黔东南.*|黔西南.*|铜仁.*|安顺.*)/g;
                    var re = pattern.test($scope.positionCity);
                    if(re) {
                        if(sessionStorage.getItem('search_city') == null) {
                            $scope.positionCity = '贵阳';
                            $rootScope.cityssss = $scope.positionCity;
                        } else {
                            $scope.positionCity = sessionStorage.getItem('search_city');
                            $rootScope.cityssss = $scope.positionCity;
                        }
                        if(sessionStorage.getItem('search_input') != null) {
                            $scope.dataContainer.input = sessionStorage.getItem('search_input');
                            $scope.dataContainer.btnDisabled = false;
                        }
                    } else {
                        $scope.positionCity = '贵阳';
                        $rootScope.cityssss = $scope.positionCity;
                    }
                });
            } else {
                if(sessionStorage.getItem('search_city') == null) {
                    $scope.positionCity = '贵阳';
                    $rootScope.cityssss = $scope.positionCity;
                } else {
                    $scope.positionCity = sessionStorage.getItem('search_city');
                    $rootScope.cityssss = $scope.positionCity;
                }
                if(sessionStorage.getItem('search_input') != null) {
                    $scope.dataContainer.input = sessionStorage.getItem('search_input');
                    $scope.dataContainer.btnDisabled = false;
                }
            }
        */

        // @查询城市区域
        // @对象数组去重函数
        function unique2(array, prop) {
            var n = {}, r = [], len = array.length, val, type;
            for (var i = 0; i < array.length; i++) {
                val = array[i][prop];
                type = typeof val;
                if (!n[val]) {
                    n[val] = [type];
                    r.push(val);
                } else if (n[val].indexOf(type) < 0) {
                    n[val].push(type);
                    r.push(val);
                }
            }
            return r;
        }
        
        /*
            if(recommendImgCount == 1) {
                $rootScope.tempsz = []; // 区域数组变量            
                $myHttpService.postNoLoad('api/product/queryBuslineRegion', {}, function(data) {
                    $scope.citysz  = unique2(data.regions, 'regionName');
                    // $rootScope.tempsz = []; // 区域数组变量
                    for (var i = 0, len = $scope.citysz.length; i < len; i++) {
                        var obj = {
                            text: $scope.citysz[i]
                        };
                        $rootScope.tempsz.push(obj);
                    }
                    $scope.show = function() {
                        var hideSheet = $ionicActionSheet.show({
                            buttons: $rootScope.tempsz,
                            titleText: '请选择城市',
                            cancel: function() {
                                // add cancel code..
                            },
                            buttonClicked: function(index, element) {
                                $scope.cityssss = element.text.toString();
                                return true;
                            }
                        });
                    };
                }, errorFn);
            } else {
                $scope.show = function() {
                    var hideSheet = $ionicActionSheet.show({
                        buttons: $rootScope.tempsz,
                        titleText: '请选择城市',
                        cancel: function() {
                            // add cancel code..
                        },
                        buttonClicked: function(index, element) {
                            $scope.cityssss = element.text.toString();
                            return true;
                        }
                    });
                };
            }
        */

        if(recommendImgCount == 1) {

            // @路线数据 数组，展现在路线选择的弹窗中 
            $rootScope.roadLineData = [
                '青岩古镇',
                '息烽温泉',
                '黄果树瀑布'
            ];

            // @搜索关键字 wechat/product/queryProductKeywords
            $myHttpService.postNoLoad('api/product/queryProductKeywords', {}, function(data) {
                
                console.log("首页：搜索关键字API返回的数据");
                console.log(data);

                if(data.products != null && data.products.length != 0) {
                    $rootScope.roadLineData = data.products;
                    console.log("首页：路线数据数组");
                    console.log($rootScope.roadLineData);
                }

            });

            $rootScope.isSelectedRoadLine = ""; // @用户点击的 某一条线路存在这里
            $rootScope.isSelectedRoadLineBoolean = true; // @是否选择路线，控制“主题/路线/目的地”等字段的显示状态，true为显示，false不显示
            $rootScope.isSearchBtnDisabled = true; // @是否开启搜索按钮的可点击状态，true 不开启，false开启

        } else {

        }

        // 选择路线的自定义弹窗
        $scope.modal = $ionicModal.fromTemplate('<ion-modal-view>'+
            '	  '+
            '        <ion-header-bar class="bar bar-header modal-one" >'+
            '		'+
        //    '		   <button class="button  button-balanced" ng-click="chooseScenicSpotTicket()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">取消</button>'+
            '          <h1 class="title"> 线路选择 </h1>'+
            '          <button class="button button-balanced" ng-click="modal.hide()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">取消</button>'+
            '		  '+
            '        </ion-header-bar>'+
            '		'+
            '        <ion-content class="padding" style="background: #ffffff;margin-top: 300px;" >'+
        //    '		    <p style="text-align:center;font-size: 20px;"><span>{{ticketInfo.viewName}}</span></p>	'+
            '			<button class="button button-outline button-dark" style="margin: 0px 4px 3px 6px;" ng-repeat="item in roadLineData track by $index" ng-click="selectedRoadLine(item.viewaddress)">{{item.viewaddress}}</button> '+
            '			'+
            '        </ion-content>'+
            '		'+
            '      </ion-modal-view>', {
            scope: $scope,
            animation: 'slide-in-up'
        });
            
        // @打开路线选择弹窗
        $scope.openRoadLine = function() {

            $scope.modal.show();

        }

        // @给每个路线选择弹窗中的路线绑定的事件函数
        $scope.selectedRoadLine = function(item) { 

            $rootScope.isSelectedRoadLineBoolean = false; // @隐藏“主题/路线/目的地”等字段

            $rootScope.isSearchBtnDisabled = false; // @开启搜索按钮的启用状态

            console.log("首页：用户当前点击选择的路线");
            console.log(item);

            $rootScope.isSelectedRoadLine = item;
            $scope.modal.hide();

        }

        // @时间选择的的综合操作
        if(sessionStorage.getItem('jqztc_search_time') != null) {

            var tempTime = sessionStorage.getItem('jqztc_search_time');

        } else {

            var tempTime = new Date();

        }

        $scope.goDate = {
            time: tempTime
        };

        var compareTime = new Date().getTime() + (60 * 86400000); // @60天时间的时间段，用来比较的

        $scope.openDatePicker = function (val) {

            var ipObj1 = {
              callback: function (val) {  // @必选
                var val2 = new Date(val);
                var val3 = $filter('date')(val2, 'yyyy-MM-dd');
                console.log('返回的时间为：' + val3);
                $scope.goDate.time = new Date(val);
              },
              titleLabel: '选择日期',
              closeLabel: '返回',
              from: new Date(),
              to: new Date(compareTime), // @11对应十二月，差1
              dateFormat: 'yyyy-MM-dd', // @可选
              closeOnSelect: true, // @可选,设置选择日期后是否要关掉界面。呵呵，原本是false。
              inputDate: new Date(),
              templateType: 'modal'
            };
            ionicDatePicker.openDatePicker(ipObj1);

        }

        // @当所有的输入都是完成状态时，开启搜索按钮
        $scope.btnCheck = function() {

            if($scope.dataContainer.input) {
                $scope.dataContainer.btnDisabled = false;
            } else {
                $scope.dataContainer.btnDisabled = true;
            }

        }

        // @点击搜索的同时，需要把数据传递到下一个tabs页面
        $scope.goTabs = function() {

            // 封装参数
            var data = {
                // city: "贵阳", // 城市区域
                input: $rootScope.isSelectedRoadLine, // 路线
                date: $filter('date')($scope.goDate.time, 'yyyy-MM-dd') // 时间
            };
            console.log("首页：打印搜索按钮传递到产品页的参数");
            console.log(data);
            sessionStorage.setItem('jqztc_search_time', data.date);
            // sessionStorage.setItem('search_city', $scope.cityssss);
            // sessionStorage.setItem('search_input', $scope.dataContainer.input.trim());

            $state.go('tabs', {data: JSON.stringify(data)}, {reload: true});

        }

    })

    /* @产品页  路线 点评 控制器 */
    .controller('Tabs', function($rootScope, $scope, $state, $timeout,  $myHttpService, $myLocationService, $filter, ionicDatePicker, $ionicModal) {

        $scope.ticketsInfo1 = ''; // @图片推荐产品 数据
        $scope.ticketsInfo2 = []; // @手动搜索产品 数据
        $scope.commentsInfo = []; // @点评 数据
        $scope.paramsProductId = ''; // @产品ID，查询评论用
        $scope.sourceComeType = ''; // @类型来源判断，true：图片推荐接口来的；false：手动搜索接口来的

        $rootScope.currentSelectedDate = null;

        // @Mock数据 接口 api/product/queryProductList
        /* $scope.ticketsInfoMock = [
            {
                "viewName": "黔灵山公园",
                "productid": "1234567890",
                "productType": 0,
                "viewid": "4396",
                "haveTicket": 1,
                "departtime": "8:00",
                "backDeparttime": "8:00",
                "drivetime": 30,
                "leftTickets": 30,
                "totalTickets": 60,
                "departaddr": "贵州饭店北京路66号",
                "arriveaddr": "黔灵山东门客车站",
                "departName": "贵州饭店",
                "arriveName": "黔灵山公园",
                "viewPrices": [
                    {
                        "viewPriceId": "43962",
                        "viewCoupon": 8.8,
                        "viewPrice": 5.0,
                        "viewPriceType": "儿童票",
                        "couponPrice": 4.4,
                    },
                    {
                        "viewPriceId": "43963",
                        "viewCoupon": 8.8,
                        "viewPrice": 10.0,
                        "viewPriceType": "成人票",
                        "couponPrice": 8.8,
                    }
                ],
                "gobdid": "4396",
                "departdate": "2017-10-30",
                "productPrice": 29.50,
            },
            {
                "viewName": "黔灵山公园",
                "productid": "1234567890",
                "productType": 1,
                "viewid": "4396",
                "haveTicket": 1,
                "departtime": "8:00",
                "backDeparttime": "16:00",
                "drivetime": 30,
                "leftTickets": 30,
                "totalTickets": 60,
                "departaddr": "贵州饭店北京路66号",
                "arriveaddr": "黔灵山东门客车站",
                "departName": "贵州饭店",
                "arriveName": "黔灵山公园",
                "viewPrices": [
                    {
                        "viewPriceId": "43962",
                        "viewCoupon": 8.8,
                        "viewPrice": 5.0,
                        "viewPriceType": "儿童票",
                        "couponPrice": 4.4,
                    },
                    {
                        "viewPriceId": "43963",
                        "viewCoupon": 8.8,
                        "viewPrice": 10.0,
                        "viewPriceType": "成人票",
                        "couponPrice": 8.8,
                    }
                ],
                "gobdid": "4396",
                "backbdid": "43961",
                "departdate": "2017-10-30",
                "productPrice": 29.50,
            }
        ]; */

        // @接收jqztc_search.html页面传递过来的参数，并解析
        var paramsData = JSON.parse($state.params.data);

        if(paramsData != null) { // @进入产品页有参数时

            if(paramsData.hasOwnProperty('productid')) { // @一、图片推荐类型的产品列表

                $scope.sourceComeType = true; // @类型来源 判断

                sessionStorage.setItem('questUrlType', '0'); // @类型来源 判断

                sessionStorage.setItem('tabsParamsDataProductid', paramsData.productid); // @给没有参数进入产品页时使用

                $scope.paramsProductId = paramsData.productid;  // @产品ID，查询评论用

                console.log("产品页：图片推荐类型流程，有参数，productid");

                var requestData = {
                    productid: paramsData.productid
                };

                // @图片推荐类型产品列表 /web/product/queryProduct
                $myHttpService.post('api/product/queryProduct', requestData, function(data) {

                    console.log("产品页：图片推荐产品列表API返回的数据");
                    console.log(data);
                    $scope.ticketsInfo1 = data.product; // @产品对象

                    if($scope.ticketsInfo1 != null) {
                        
                        if($scope.ticketsInfo1.plans != null) { // @产品 有车票时
                            
                            $scope.ticketsInfo1_havePlans = true; // @有无车票
    
                            $scope.ticketsInfo1_prodcutType = $scope.ticketsInfo1.productType.split("&"); // @产品类型
                            $scope.ticketsInfo1_prodcutType2 = $scope.ticketsInfo1.productType.replace("&", "+"); // @产品类型
    
                            $scope.ticketsInfo1_station = $scope.ticketsInfo1.plans[0].linename.split("-"); // @出发/返回 站点名
    
                            if($scope.ticketsInfo1.plans[0].bdidType == 0) { // @单程票
    
                                $scope.ticketsInfo1_plansType = true; // @车票类型
    
                                $scope.ticketsInfo1_departAddr = $scope.ticketsInfo1.plans[0].departaddr; // @出发发车地址
                                $scope.ticketsInfo1_driveTime = $scope.ticketsInfo1.plans[0].drivetime; // @行程时间
                                
                            } else { // @往返票
                                
                                $scope.ticketsInfo1_plansType = false; // @车票类型
                                $scope.ticketsInfo1_departAddr = $scope.ticketsInfo1.plans[0].departaddr; // @出发发车地址
                                $scope.ticketsInfo1_arriveAddr = $scope.ticketsInfo1.plans[1].departaddr; // @返回发车地址
                                $scope.ticketsInfo1_driveTime = $scope.ticketsInfo1.plans[0].drivetime; // @行程时间
    
                            }
    
                        } else { // @产品 无车票时
    
                            $scope.ticketsInfo1_havePlans = false;
    
                            if($scope.ticketsInfo1.viewInfo != null) { // @单独的门票
    
                                $scope.ticketsInfo1_viewName = $scope.ticketsInfo1.viewInfo.viewName; // @景点名字
                                $scope.ticketsInfo1_viewAddr = $scope.ticketsInfo1.viewInfo.viewaddr; // @景点地址
    
                            } 
    
                        }

                    } else {

                        layer.open({
                            content: '客官，您当前选择的推荐主题路线已售完，请返回进行主题线路搜索 (╯-╰)',
                            btn: '确定',
                            shadeClose: false,
                            yes: function(index) {
                                layer.closeAll();
                                $timeout(function() {
                                    window.history.back();
                                    return false;
                                }, 250)
                            }
                        });

                    }

                }, errorFn);
                
            } else { // @二、手动搜索类型的产品列表

                $scope.sourceComeType = false; // @数据来源 判断

                sessionStorage.setItem('questUrlType', '1'); // @数据来源 判断

                sessionStorage.setItem('tabsParamsDataInput', paramsData.input); // @存储数据，以便后用
                sessionStorage.setItem('tabsParamsDataDate', paramsData.date); // @存储数据，以便后用
                
                $rootScope.currentSelectedDate = paramsData.date; // @参数接收 日期数据
                $rootScope.currentSelectedRoadLine = paramsData.input; // @参数接收 线路选择数据
                
                var requestData = { // @请求参数封装
                    keyword: paramsData.input,
                    departDate: paramsData.date
                };

                // @手动搜索类型的产品列表 wechat/product/queryProductList
                $myHttpService.post('api/product/queryProductList', requestData, function(data) {

                    console.log("产品页：手动搜索类型的产品列表API返回的数据");
                    console.log(data);
                    $scope.ticketsInfo2 = data.products;

                    if($scope.ticketsInfo2.length != 0) {

                        $scope.paramsProductId = data.products[0].productid;  // @产品ID，查询评论用

                    } else {
                        layer.open({
                            content: '客官，没有找到相关产品信息，请重新搜索 (╯-╰)',
                            btn: '确定'
                        });
                    }

                }, errorFn);

            }
        } else { // @进入产品页 没有参数时

            if(sessionStorage.getItem('questUrlType') == '0') {  // @一、图片推荐类型的产品列表
 
                $scope.sourceComeType = true; // @来源类型 判断

                var requestData = {
                    productid: sessionStorage.getItem('tabsParamsDataProductid')
                };

                // @图片推荐类型产品列表 /web/product/queryProduct
                $myHttpService.post('api/product/queryProduct', requestData, function(data) {

                    console.log("产品页：图片推荐产品列表API返回的数据");
                    console.log(data);
                    $scope.ticketsInfo1 = data.product; // @产品对象
                    
                    if($scope.ticketsInfo1 != null) {
                        
                        if($scope.ticketsInfo1.plans != null) { // @产品 有车票时
                            
                            $scope.ticketsInfo1_havePlans = true; // @有无车票
    
                            $scope.ticketsInfo1_prodcutType = $scope.ticketsInfo1.productType.split("&"); // @产品类型
                            $scope.ticketsInfo1_prodcutType2 = $scope.ticketsInfo1.productType.replace("&", "+"); // @产品类型
    
                            $scope.ticketsInfo1_station = $scope.ticketsInfo1.plans[0].linename.split("-"); // @出发/返回 站点名
    
                            if($scope.ticketsInfo1.plans[0].bdidType == 0) { // @单程票
    
                                $scope.ticketsInfo1_plansType = true; // @车票类型
    
                                $scope.ticketsInfo1_departAddr = $scope.ticketsInfo1.plans[0].departaddr; // @出发发车地址
                                $scope.ticketsInfo1_driveTime = $scope.ticketsInfo1.plans[0].drivetime; // @行程时间
                                
                            } else { // @往返票
                                
                                $scope.ticketsInfo1_plansType = false; // @车票类型
                                $scope.ticketsInfo1_departAddr = $scope.ticketsInfo1.plans[0].departaddr; // @出发发车地址
                                $scope.ticketsInfo1_arriveAddr = $scope.ticketsInfo1.plans[1].departaddr; // @返回发车地址
                                $scope.ticketsInfo1_driveTime = $scope.ticketsInfo1.plans[0].drivetime; // @行程时间
    
                            }
    
                        } else { // @产品 无车票时
    
                            $scope.ticketsInfo1_havePlans = false;
    
                            if($scope.ticketsInfo1.viewInfo != null) { // @单独的门票
    
                                $scope.ticketsInfo1_viewName = $scope.ticketsInfo1.viewInfo.viewName; // @景点名字
                                $scope.ticketsInfo1_viewAddr = $scope.ticketsInfo1.viewInfo.viewaddr; // @景点地址
    
                            } 
    
                        }

                    } else {

                        layer.open({
                            content: '客官，您当前选择的推荐主题路线已售完，请返回进行主题线路搜索 (╯-╰)',
                            btn: '确定',
                            shadeClose: false,
                            yes: function(index) {
                                layer.closeAll();
                                $timeout(function() {
                                    window.history.back();
                                    return false;
                                }, 250)
                            }
                        });

                    }       

                }, errorFn);
                
            } else if(sessionStorage.getItem('questUrlType') == '1') {  // @二、手动搜索类型的产品列表

                $scope.sourceComeType = false; // @来源类型 判断

                var requestData = {
                    keyword: sessionStorage.getItem('tabsParamsDataInput'),
                    departDate: sessionStorage.getItem('tabsParamsDataDate')
                };
                console.log(requestData);

                $rootScope.currentSelectedDate = sessionStorage.getItem('tabsParamsDataDate');
                $rootScope.currentSelectedRoadLine = sessionStorage.getItem('tabsParamsDataInput');

                // @手动搜索类型的产品列表 wechat/product/queryProductList
                $myHttpService.post('api/product/queryProductList', requestData, function(data) {

                    console.log("产品页：手动搜索类型的产品列表API返回的数据");
                    console.log(data);
                    $scope.ticketsInfo2 = data.products;
                    if($scope.ticketsInfo2.length != 0) {
                        
                        $scope.paramsProductId = data.products[0].productid;  // @产品ID，查询评论用

                    } else {
                        layer.open({
                            content: '客官，没有找到相关产品信息，请重新搜索 (╯-╰)',
                            btn: '确定'
                        });
                    }

                }, errorFn);

            } else {
                $state.go('search');
            }
        }

        $scope.nextDay = function() {

            var nextDayTime = new Date($rootScope.currentSelectedDate).getTime() + (1 * 86400000); // ms
            var temp1 = new Date();
            var temp2 = $filter('date')(temp1, 'yyyy-MM-dd');
            var endTime = new Date(temp2).getTime() + (60 * 86400000);

            if(nextDayTime <= endTime) {
                var temp = new Date(nextDayTime);
                $rootScope.currentSelectedDate = $filter('date')(temp, 'yyyy-MM-dd');
                sessionStorage.setItem('tabsParamsDataDate', $rootScope.currentSelectedDate);

                var requestData = {
                    keyword: $rootScope.currentSelectedRoadLine,
                    departDate: $rootScope.currentSelectedDate,
                    region: $rootScope.currentSelectedCity
                };

                $myHttpService.post('api/product/queryProductList', requestData, function(data) {
                    console.log(data);
                    $scope.ticketsInfo = data.products;
                    if(data.products.length != 0) {
                        $scope.noticeInfo = data.products[0].productinfo;                    
                    } else {
                        layer.open({
                            content: '当前班次已售罄，请选择往后日期',
                            btn: '确定'
                        });
                    }
                }, function() {
                    $scope.ticketsInfo = [];
                });

            } else {
                layer.open({
                    content: '不在预售范围内，预售期仅为60天，请重新选择！',
                    btn: '确定'
                });
            }
        }

        $scope.prevDay = function() {


            var prevDayTime = new Date($rootScope.currentSelectedDate).getTime() - (1 * 86400000); // ms

            var temp3 = new Date();
            var temp4 = $filter('date')(temp3, 'yyyy-MM-dd');

            var startTime = new Date(temp4).getTime();

            // var nextDayTime = new Date($rootScope.currentSelectedDate).getTime() + (1 * 86400000); // ms
            // var endTime = new Date().getTime() + (60 * 86400000);

            if(prevDayTime >= startTime) {
                var temp = new Date(prevDayTime);
                $rootScope.currentSelectedDate = $filter('date')(temp, 'yyyy-MM-dd');
                sessionStorage.setItem('tabsParamsDataDate', $rootScope.currentSelectedDate);

                var requestData = {
                    keyword: $rootScope.currentSelectedRoadLine,
                    departDate: $rootScope.currentSelectedDate,
                    region: $rootScope.currentSelectedCity
                };

                $myHttpService.post('api/product/queryProductList', requestData, function(data) {
                    console.log(data);
                    $scope.ticketsInfo = data.products;
                    if(data.products.length != 0) {
                        $scope.noticeInfo = data.products[0].productinfo;                    
                    } else {
                        layer.open({
                            content: '当前班次已售罄，请选择往后日期',
                            btn: '确定'
                        });
                    }
                }, function() {
                    $scope.ticketsInfo = [];
                });

            } else {
                var temp = new Date();
                var temp2 = $filter('date')(temp, 'yyyy-MM-dd');
                layer.open({
                    content: '选择日期仅当从' + temp2 + '往后' ,
                    btn: '确定'
                });
            }
        }

        var compareTimeTemp1 = new Date();
        var compareTimeTemp2 = $filter('date')(compareTimeTemp1, 'yyyy-MM-dd');
        var compareTime = new Date(compareTimeTemp2).getTime() + (60 * 86400000); // 60天时间

        $scope.selectDay = function(val) {
            var ipObj1 = {
                callback: function (val) {  // 必选
                    var val2 = new Date(val);
                    $rootScope.currentSelectedDate = $filter('date')(val2, 'yyyy-MM-dd');
                    sessionStorage.setItem('tabsParamsDataDate', $rootScope.currentSelectedDate);

                    var requestData = {
                        keyword: $rootScope.currentSelectedRoadLine,
                        departDate: $rootScope.currentSelectedDate,
                        region: $rootScope.currentSelectedCity
                    };
    
                    $myHttpService.post('api/product/queryProductList', requestData, function(data) {
                        console.log(data);
                        $scope.ticketsInfo = data.products;
                        if(data.products.length != 0) {
                            $scope.noticeInfo = data.products[0].productinfo;                    
                        } else {
                            layer.open({
                                content: '当前班次已售罄，请选择往后日期',
                                btn: '确定'
                            });
                        }
                    }, function() {
                        $scope.ticketsInfo = [];
                    });
                },
                titleLabel: '选择日期',
                closeLabel: '返回',
                from: new Date(),
                to: new Date(compareTime), // 11对应十二月，差1
                dateFormat: 'yyyy-MM-dd', // 可选
                closeOnSelect: true, // 可选,设置选择日期后是否要关掉界面。呵呵，原本是false。
                inputDate: new Date(),
                templateType: 'modal'
              };
              ionicDatePicker.openDatePicker(ipObj1);
        }

        // @购买按钮函数 传递参数
        $scope.purchase = function(item, i) {

            console.log("产品页：点击购买按钮传递的参数");
            console.log(item);
            $state.go('order_confirm_pay', {data: JSON.stringify(item)});

        };

        var check_click_count = 0; // @检测 产品tab 的点击次数
        var check_click_count2 = 0; // @检测 点评tab 的点击次数

        // @产品 信息
        $scope.tab_road = function() {

            if(check_click_count < 1) {
                console.log('产品tab');
            }
            check_click_count++;

        }

        // @点评 信息
        $scope.tab_comment = function() {

            if(check_click_count2 < 1) {
                console.log('点评tab');
            }
            check_click_count2++;

        }

        // @产品信息 下拉刷新
        $scope.doRefreshRoad = function() {
            if(paramsData != null) {

                if(sessionStorage.getItem('questUrlType') == '0') { // @一、图片推荐类型的产品列表

                    console.log("1111");
                    var requestData = {
                        productid: paramsData.productid
                    };
                    // 图片推荐类型产品列表 /web/product/queryProduct
                    $myHttpService.postNoLoad('api/product/queryRecommendProduct', requestData, function(data){
                        console.log(data);
                        $scope.ticketsInfo = data.products;
                        $scope.$broadcast('scroll.refreshComplete');
                        layer.open({
                            content: '刷新成功',
                            skin: 'msg',
                            time: 1
                        });
                    }, function() {
                        $scope.$broadcast('scroll.refreshComplete');                        
                    });

                } else if(sessionStorage.getItem('questUrlType') == '1') { // @二、手动搜索类型的产品列表
                    
                    var requestData = {
                        keyword: $rootScope.currentSelectedRoadLine,
                        departDate: $rootScope.currentSelectedDate,
                        region: $rootScope.currentSelectedCity
                    };
                    console.log(requestData);

                    $myHttpService.postNoLoad('api/product/queryProductList', requestData, function(data){
                        console.log(data);
                        $scope.ticketsInfo = data.products;
                        $scope.$broadcast('scroll.refreshComplete');
                        layer.open({
                            content: '刷新成功',
                            skin: 'msg',
                            time: 1
                        });
                    }, function() {
                        $scope.$broadcast('scroll.refreshComplete');                        
                    });
                }

            } else {

                if(sessionStorage.getItem('questUrlType') == '0') {
                         
                    var requestData = {
                        productid: sessionStorage.getItem('tabsParamsDataProductid')
                    };
                    $myHttpService.postNoLoad('api/product/queryRecommendProduct', requestData, function(data){
                        console.log(data);
                        $scope.ticketsInfo = data.products;
                        $scope.$broadcast('scroll.refreshComplete');
                        layer.open({
                            content: '刷新成功',
                            skin: 'msg',
                            time: 1
                        });
                    }, function() {
                        $scope.$broadcast('scroll.refreshComplete');                        
                    });
                                        
                } else if(sessionStorage.getItem('questUrlType') == '1') {

                    var requestData = {
                        keyword: $rootScope.currentSelectedRoadLine,
                        departDate: $rootScope.currentSelectedDate,
                        region: $rootScope.currentSelectedCity
                    };
                    console.log(requestData);

                    $myHttpService.postNoLoad('api/product/queryProductList', requestData, function(data){
                        console.log(data);
                        $scope.ticketsInfo = data.products;
                        $scope.$broadcast('scroll.refreshComplete');
                        layer.open({
                            content: '刷新成功',
                            skin: 'msg',
                            time: 1
                        });
                    }, function() {
                        $scope.$broadcast('scroll.refreshComplete');                        
                    });
                }
            }
        };

        // @点评信息 下拉刷新
        $scope.isNoComment = false;
        $scope.pageCount = 1;
        $scope.doRefreshComment = function() {

            console.log("产品页：doRefreshComment已执行");
            // if($scope.ticketsInfo.length == 0) {
            //     $scope.isNoComment = true;
            //     $scope.$broadcast('scroll.refreshComplete');                
            //     return;
            // }
            var productid = $scope.paramsProductId;
            $scope.pageCount = 1;
            // @产品评价wechat/product/queryProductHieList
            $myHttpService.postNoLoad('api/product/queryProductHieList', {
                productid: productid,
                offset: '0',
                pagesize: '10'
            }, function(data) {
                console.log("产品页：产品评价API返回的数据(下拉刷新)");
                console.log(data);
                $scope.commentsInfo = data.buslineHierarchys;
                $scope.$broadcast('scroll.refreshComplete');
                if($scope.commentsInfo.length == 0) {
                    $scope.isNoComment = true;
                } else {
                    $scope.isNoComment = false;
                    layer.open({
                        content: '刷新成功',
                        skin: 'msg',
                        time: 1
                    });
                }
            });

        };

        // @点评信息 上拉加载
        $scope.hasmore = true;
        var run = false;
        $scope.loadMoreComment = function() {

            console.log("产品页：loadMoreComment已执行");
            // if($scope.ticketsInfo.length == 0) {
            //     $scope.isNoComment = true;
            //     return;
            // }
            var productid = $scope.paramsProductId;
            var offset = ($scope.pageCount - 1) * 10;
            var requestData = {
                productid: productid,
                offset: offset,
                pagesize: '10'
            };

            if(!run) {
                run = true;
                // @产品评价wechat/product/queryProductHieList
                $myHttpService.post('api/product/queryProductHieList', requestData, function(data) {

                    console.log("产品页：产品评价API返回的数据(上拉加载)");
                    console.log(data);
                    if (data.buslineHierarchys.length < 10) { 
                        $scope.hasmore = false; // @这里判断是否还能获取到数据，如果没有获取数据，则不再触发加载事件 
                    } 
                    $scope.pageCount++; 
                    console.log("计数： " + $scope.pageCount);
                    run = false;
                    console.log("评论加载");
                    $scope.commentsInfo = $scope.commentsInfo.concat(data.buslineHierarchys);
                    console.log($scope.commentsInfo);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if($scope.commentsInfo.length == 0) {
                        $scope.isNoComment = true;
                    }

                });
            }
        }

        // @评论的星星 调用了Star的指令，这里相关是配置的信息
        $scope.max = 5; // @星星数量
        $scope.readonly = true; // @是否可读，此处为可读
        $scope.onHover = function(val){};
        $scope.onLeave = function(){};

    })

    /* @订单页 确认、支付 控制器 */
    .controller('order_confirm_pay', function($rootScope, $filter, $scope, $state, $myHttpService, $interval, $ionicModal) {

        if(JSON.parse($state.params.data) == null) { // @访问此订单页时，如果没有传递过来参数那么将直接倒退2个页面

                window.history.go(-2); // @倒退回到首页，此动作不可逆
                return false; // @兼容处理

        } 
        
        // @访问订单页时，有参数的情况，走正常流程

        $scope.floatObj = floatObj; // @票价处理的运算对象

        $scope.dataContainer = { // @数据容器
            phone: "", // @用户电话
            verificationCode: "", // @验证码
            coupon: false, // @是否使用优惠券
            count: 1
        };

        $scope.sumPrice = 0; // @产品总价
        $scope.ticketSumPrice = 0; // @车票总价
        $scope.ticketSumPrice_forwardTicket = 0;  // @去程车票总价
        $scope.ticketSumPrice_backwardTicket = 0;  // @返程车票总价
        $scope.ticketViewSumPrice = 0; // @门票总价
        $scope.coupon = 0; // @优惠总价

        $rootScope.customerPhone = "18302505304"; // @客服电话

        $scope.currentSelectedDateOrTime = sessionStorage.getItem('tabsParamsDataDate'); // @唯一的当前选择的时间
        if($scope.currentSelectedDateOrTime == null) {
            // var timeTemp = new Date();
            // $filter('date')(new Date(), 'yyyy-MM-dd')
            $scope.currentSelectedDateOrTime = $filter('date')(new Date(), 'yyyy-MM-dd');
        }

        var paramsData = JSON.parse($state.params.data); // @解析传递过来的参数

        console.log("订单页：传递到订单页的参数");
        console.log(paramsData);

        $scope.ticketInfo = paramsData; // @产品对象
        $scope.paramsProductid = $scope.ticketInfo.productid; // @产品ID
        
        $scope.checkPhoneState = false; // 检测电话号码是否正确
        $scope.verificationCodeBtnDisabled = true; // 控制获取验证码按钮的状态
        $scope.verificationCodeInputDisabled = true; // 控制验证码输入框的状态
        $scope.payBtnDisabled = true; // 控制确认支付按钮的状态
        $scope.countdownTxtShow = false; // 控制倒计时文本的状态

        $scope.couponBtnState = false; // 控制优惠券的状态
        $scope.couponTxTShow = false; // 控制优惠券文本的状态


        // ************************************************************************************************
        

        if($scope.ticketInfo.plans != null) { // @检测产品对象是否有车票
            
            $scope.ticketInfo_Ticket_tempRequestParamArr = []; // @临时的车票请求参数数组            

            if($scope.ticketInfo.plans[0] != null) { // @去程票 类型

                $scope.ticketInfo_forwardTicket_haveChoosed = false; // @控制选择出发时间时的 样式表现

                // @去程车票出发时间弹窗对象
                $scope.ticketInfo_forwardTicket_chooseTime_Modal = $ionicModal.fromTemplate('<ion-modal-view>'+
                    '	  '+
                    '        <ion-header-bar class="bar bar-header modal-two" >'+
                    '		'+
                    '		   <button class="button  button-balanced" ng-click="ticketInfo_forwardTicket_chooseTime_OKFn()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">取消</button>'+
                    '          <h1 class="title" style="color: black;font-size: 17px;font-weight: 400;">请选择行程时间</h1>'+
                    '          <button class="button button-balanced" ng-click="ticketInfo_forwardTicket_chooseTime_OKFn()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">确定</button>'+
                    '		'+
                    '        </ion-header-bar>'+
                    '		'+
                    '        <ion-content class="padding" style="background: #ffffff;margin-top: 300px;" >'+
                    // '		    <p style="text-align:center;font-size: 20px;"><span>{{ticketInfo.viewName}}</span></p>	'+
                    '			<ion-radio style="padding: 15px 10px;border: none;font-size: 17px;" ng-repeat="item in ticketInfo_forwardTicket_arr"'+
                    '               ng-value="item.bdid"'+
                    '               ng-model="ticketInfo_forwardTicket_timeType.type">'+
                    '      			{{ item.departTime }} <span style="margin-left: 5px;color: #a2a2a2;font-size: 14px;" >剩 <span style="color: #DF6A0D;">{{ item.leftTickets }}</span>座 / {{ item. totalTickets}}座</span> '+
                    '    		</ion-radio>'+
                    '			'+
                    '        </ion-content>'+
                    '		'+
                    '      </ion-modal-view>', {
                    scope: $scope,
                    animation: 'slide-in-up'
                });

                
                $scope.ticketInfo_forwardTicket_count = 0; // @去程车票数
                $scope.ticketInfo_forwardTicket_price = 0; // @去程车票价格

                $scope.ticketInfo_forwardTicket_lineid = $scope.ticketInfo.plans[0].lineid; // @去程票 线路ID
                
                $scope.ticketInfo_forwardTicket_selectGoTime_Fn = function() { // @去程票选择出发时间函数

                    $scope.ticketInfo_forwardTicket_haveChoosed = false; // @控制选择出发时间时的 样式表现
                
                    // @$filter('date')($scope.currentSelectedDateOrTime, 'yyyy-MM-dd')
                    var requestData = { // @参数封装
                        departDate: $filter('date')($scope.currentSelectedDateOrTime, 'yyyy-MM-dd'),
                        lineid: $scope.ticketInfo_forwardTicket_lineid
                    };

                    console.log(requestData);

                    // @排班出发时间查询 /webchat/product/queryBuslineScheduleDetailsByLineid 
                    $myHttpService.post('api/product/queryBuslineScheduleDetailsByLineid', requestData, function(data) {
                        
                        console.log("订单页：排班出发时间查询API返回的数据");
                        console.log(data);

                        $scope.ticketInfo_forwardTicket_arr = data.details; // @去程车票详情数组

                        if($scope.ticketInfo_forwardTicket_arr.length != 0) {

                            $scope.ticketInfo_forwardTicket_timeType = { // @去程票的时间类型
                                type:  $scope.ticketInfo_forwardTicket_arr[0].bdid // @指定数组的第一个为 默认类型
                            };

                            $scope.ticketInfo_forwardTicket_chooseTime_Modal.show(); // @弹窗显示

                        } else {

                            layer.open({
                                content: '客官，当前没有相关的班次信息，请重新选择日期 (╯-╰)',
                                btn: '确定'
                            });

                        }

                    }, errorFn);

                };

                $scope.ticketInfo_forwardTicket_chooseTime_OKFn = function() { // @出发时间弹窗中的确定、取消函数


                    for(var item in $scope.ticketInfo_forwardTicket_arr) {

                        var objTemp = $scope.ticketInfo_forwardTicket_arr[item];

                        if(objTemp.bdid == $scope.ticketInfo_forwardTicket_timeType.type) {

                            $scope.ticketInfo_forwardTicket_price = objTemp.price; // 找出用户选择的相应出发时间的车票价格
                            $scope.ticketInfo_forwardTicket_time = objTemp.departTime; // 找出用户选择的相应出发时间的车票出发时间
                            $scope.ticketInfo_forwardTicket_leftTickets = objTemp.leftTickets; // 找出用户选择的相应出发时间的车票剩余座位
                            $scope.ticketInfo_forwardTicket_totalTickets = objTemp.totalTickets; // 找出用户选择的相应出发时间的车票总座位
                            $scope.ticketInfo_forwardTicket_bdid = objTemp.bdid; // 找出用户选择的相应出发时间的车票bdid
                            
                        }
                    }

                    // $scope.ticketInfo_forwardTicket_count = 0; // @去程车票数量 清零

                    $scope.ticketInfo_forwardTicket_chooseTime_Modal.hide(); // @弹窗关闭                   

                    $scope.ticketInfo_forwardTicket_haveChoosed = true; // @控制选择出发时间时的 样式表现    
                    
                    // @去程车票票价计算

                    $scope.ticketSumPrice_forwardTicket = 0;  // @去程车票总价 清零，重新计算

                    $scope.ticketSumPrice_forwardTicket = $scope.floatObj.multiply($scope.ticketInfo_forwardTicket_price, $scope.ticketInfo_forwardTicket_count, 2); // @当前选择车票的总价

                    console.log("订单页：去程车票总价");
                    console.log($scope.ticketSumPrice_forwardTicket);
                    
                }

                $scope.ticketInfo_Ticket_tempRequestParamArr[0] = [
                    $scope.ticketInfo_forwardTicket_bdid,
                    $scope.ticketInfo_forwardTicket_count
                ]; 
            

                // @去程车票 票数增加 函数
                $scope.ticketInfo_forwardTicket_incr = function() {

                    if( $scope.ticketInfo_forwardTicket_count < $scope.ticketInfo_forwardTicket_leftTickets ) {

                        $scope.ticketInfo_forwardTicket_count += 1;

                        var tempPrice = $scope.floatObj.multiply($scope.ticketInfo_forwardTicket_price, 1, 2);

                        $scope.ticketSumPrice_forwardTicket = $scope.floatObj.add($scope.ticketSumPrice_forwardTicket, tempPrice, 2);

                        console.log("订单页：去程车票总价");
                        console.log($scope.ticketSumPrice_forwardTicket);

                    } else {

                        layer.open({
                            content: '当前班次余票为: ' + $scope.ticketInfo_forwardTicket_count,
                            btn: '确定'
                        });

                    }
                }

                // @去程车票 票数减少 函数
                $scope.ticketInfo_forwardTicket_decr = function() {

                    if($scope.ticketInfo_forwardTicket_count >= 1) { // @只有当数量大于或者等于1的时候才可以减

                        $scope.ticketInfo_forwardTicket_count -= 1;

                        var tempPrice = $scope.floatObj.multiply($scope.ticketInfo_forwardTicket_price, 1, 2);
                        
                        $scope.ticketSumPrice_forwardTicket = $scope.floatObj.subtract($scope.ticketSumPrice_forwardTicket, tempPrice, 2);

                        console.log("订单页：去程车票总价");
                        console.log($scope.ticketSumPrice_forwardTicket);

                    }
                }

                $scope.$on('$destroy', function() { // @销毁工作
                    $scope.ticketInfo_forwardTicket_chooseTime_Modal.remove(); // @弹窗销毁
                });

            } 

            if($scope.ticketInfo.plans[1] != null) { // @反程票 类型
                
                $scope.ticketInfo_backwardTicket_haveChoosed = false; // @控制选择出发时间时的 样式表现

                // @返程车票出发时间弹窗对象
                $scope.ticketInfo_backwardTicket_chooseTime_Modal = $ionicModal.fromTemplate('<ion-modal-view>'+
                    '	  '+
                    '        <ion-header-bar class="bar bar-header modal-two" >'+
                    '		'+
                    '		   <button class="button  button-balanced" ng-click="ticketInfo_backwardTicket_chooseTime_OKFn()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">取消</button>'+
                    '          <h1 class="title" style="color: black;font-size: 17px;font-weight: 400;">请选择行程时间</h1>'+
                    '          <button class="button button-balanced" ng-click="ticketInfo_backwardTicket_chooseTime_OKFn()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">确定</button>'+
                    '		'+
                    '        </ion-header-bar>'+
                    '		'+
                    '        <ion-content class="padding" style="background: #ffffff;margin-top: 300px;" >'+
                    // '		    <p style="text-align:center;font-size: 20px;"><span>{{ticketInfo.viewName}}</span></p>	'+
                    '			<ion-radio style="padding: 15px 10px;border: none;font-size: 17px;" ng-repeat="item in ticketInfo_backwardTicket_arr"'+
                    '               ng-value="item.bdid"'+
                    '               ng-model="ticketInfo_backwardTicket_timeType.type">'+
                    '      			{{ item.departTime }} <span style="margin-left: 5px;color: #a2a2a2;font-size: 14px;" >剩 <span style="color: #DF6A0D;">{{ item.leftTickets }}</span>座 / {{ item. totalTickets}}座</span> '+
                    '    		</ion-radio>'+
                    '			'+
                    '        </ion-content>'+
                    '		'+
                    '      </ion-modal-view>', {
                    scope: $scope,
                    animation: 'slide-in-up'
                });

                
                $scope.ticketInfo_backwardTicket_count = 0; // @返程车票数
                $scope.ticketInfo_backwardTicket_price = 0; // @返程车票价格

                $scope.ticketInfo_backwardTicket_lineid = $scope.ticketInfo.plans[1].lineid; // @返程票 线路ID
                
                $scope.ticketInfo_backwardTicket_selectGoTime_Fn = function() { // @返程票选择出发时间函数

                    $scope.ticketInfo_backwardTicket_haveChoosed = false; // @控制选择出发时间时的 样式表现
                
                    // @$filter('date')($scope.currentSelectedDateOrTime, 'yyyy-MM-dd')
                    var requestData = { // @参数封装
                        departDate: $filter('date')($scope.currentSelectedDateOrTime, 'yyyy-MM-dd'),
                        lineid: $scope.ticketInfo_backwardTicket_lineid
                    };

                    console.log(requestData);

                    // @排班出发时间查询 /webchat/product/queryBuslineScheduleDetailsByLineid 
                    $myHttpService.post('api/product/queryBuslineScheduleDetailsByLineid', requestData, function(data) {
                        
                        console.log("订单页：排班出发时间查询API返回的数据");
                        console.log(data);

                        $scope.ticketInfo_backwardTicket_arr = data.details; // @返程车票详情数组

                        if($scope.ticketInfo_backwardTicket_arr.length != 0) {

                            $scope.ticketInfo_backwardTicket_timeType = { // @返程票的时间类型
                                type:  $scope.ticketInfo_backwardTicket_arr[0].bdid // @指定数组的第一个为 默认类型
                            };

                            $scope.ticketInfo_backwardTicket_chooseTime_Modal.show(); // @弹窗显示

                        } else {

                            layer.open({
                                content: '客官，当前没有相关的班次信息，请重新选择日期 (╯-╰)',
                                btn: '确定'
                            });

                        }

                    }, errorFn);

                };

                $scope.ticketInfo_backwardTicket_chooseTime_OKFn = function() { // @出发时间弹窗中的确定、取消函数


                    for(var item in $scope.ticketInfo_backwardTicket_arr) {

                        var objTemp = $scope.ticketInfo_backwardTicket_arr[item];

                        if(objTemp.bdid == $scope.ticketInfo_backwardTicket_timeType.type) {

                            $scope.ticketInfo_backwardTicket_price = objTemp.price; // 找出用户选择的相应出发时间的车票价格
                            $scope.ticketInfo_backwardTicket_time = objTemp.departTime; // 找出用户选择的相应出发时间的车票出发时间
                            $scope.ticketInfo_backwardTicket_leftTickets = objTemp.leftTickets; // 找出用户选择的相应出发时间的车票剩余座位
                            $scope.ticketInfo_backwardTicket_totalTickets = objTemp.totalTickets; // 找出用户选择的相应出发时间的车票总座位
                            $scope.ticketInfo_backwardTicket_bdid = objTemp.bdid; // 找出用户选择的相应出发时间的车票bdid
                            
                        }
                    }

                    // $scope.ticketInfo_backwardTicket_count = 0; // @返程车票数量 清零

                    $scope.ticketInfo_backwardTicket_chooseTime_Modal.hide(); // @弹窗关闭                   

                    $scope.ticketInfo_backwardTicket_haveChoosed = true; // @控制选择出发时间时的 样式表现    
                    
                    // @返程车票票价计算

                    $scope.ticketSumPrice_backwardTicket = 0;  // @返程车票总价 清零，重新计算

                    $scope.ticketSumPrice_backwardTicket = $scope.floatObj.multiply($scope.ticketInfo_backwardTicket_price, $scope.ticketInfo_backwardTicket_count, 2); // @当前选择车票的总价

                    console.log("订单页：返程车票总价");
                    console.log($scope.ticketSumPrice_backwardTicket);
                    
                }

                $scope.ticketInfo_Ticket_tempRequestParamArr[1] = [
                    $scope.ticketInfo_backwardTicket_bdid,
                    $scope.ticketInfo_backwardTicket_count
                ]; 
            

                // @返程车票 票数增加 函数
                $scope.ticketInfo_backwardTicket_incr = function() {

                    if( $scope.ticketInfo_backwardTicket_count < $scope.ticketInfo_backwardTicket_leftTickets ) {

                        $scope.ticketInfo_backwardTicket_count += 1;

                        var tempPrice = $scope.floatObj.multiply($scope.ticketInfo_backwardTicket_price, 1, 2);

                        $scope.ticketSumPrice_backwardTicket = $scope.floatObj.add($scope.ticketSumPrice_backwardTicket, tempPrice, 2);

                        console.log("订单页：返程车票总价");
                        console.log($scope.ticketSumPrice_backwardTicket);

                    } else {

                        layer.open({
                            content: '当前班次余票为: ' + $scope.ticketInfo_backwardTicket_count,
                            btn: '确定'
                        });

                    }
                }

                // @返程车票 票数减少 函数
                $scope.ticketInfo_backwardTicket_decr = function() {

                    if($scope.ticketInfo_backwardTicket_count >= 1) { // @只有当数量大于或者等于1的时候才可以减

                        $scope.ticketInfo_backwardTicket_count -= 1;

                        var tempPrice = $scope.floatObj.multiply($scope.ticketInfo_backwardTicket_price, 1, 2);
                        
                        $scope.ticketSumPrice_backwardTicket = $scope.floatObj.subtract($scope.ticketSumPrice_backwardTicket, tempPrice, 2);

                        console.log("订单页：返程车票总价");
                        console.log($scope.ticketSumPrice_backwardTicket);

                    }
                }

                $scope.$on('$destroy', function() { // @销毁工作
                    $scope.ticketInfo_backwardTicket_chooseTime_Modal.remove(); // @弹窗销毁
                });

            } 

            
        }


        // ************************************************************************************************


        if($scope.ticketInfo.viewInfo != null) { // @检测产品对象是否有门票

            var len = $scope.ticketInfo.viewInfo.viewPrices.length; // @临时循环变量

            $scope.ticketInfo_viewInfo_tempRequestParamArr = []; // @临时的门票请求参数数组

            $scope.ticketInfo_viewInfo_priceStr = ''; // @票价字符串
            for(var index in $scope.ticketInfo.viewInfo.viewPrices) {

                var item = $scope.ticketInfo.viewInfo.viewPrices[index];
                $scope.ticketInfo_viewInfo_priceStr += item.viewPriceType + item.couponPrice + '元 ';

                $scope["ticketInfo_viewInfo_count" + index] = 0; // @动态创建相对应的门票数量 变量

            }

            // @门票数量 增加 函数
            $scope.ticket_viewInfo_incr = function(index) {
            
                for(var i = 0; i < len; i++) {
    
                    if(index == i) {
    
                        if($scope["ticketInfo_viewInfo_count" + index] < 99) {
    
                            $scope["ticketInfo_viewInfo_count" + index] += 1;

                            console.log("订单页：相应门票的数量" + $scope["ticketInfo_viewInfo_count" + index]);
    
                            $scope.ticketInfo_viewInfo_tempRequestParamArr[index] = [
                                $scope.ticketInfo.viewInfo.viewPrices[index].viewPriceId,
                                $scope["ticketInfo_viewInfo_count" + index]
                            ];
    
                            var tempPrice = $scope.floatObj.multiply($scope.ticketInfo.viewInfo.viewPrices[index].couponPrice, 1, 2); // @临时的对应门票价格计算
    
                            $scope.ticketViewSumPrice = $scope.floatObj.add($scope.ticketViewSumPrice, tempPrice, 2); // @门票总价计算
    
                            console.log("订单页：门票请求参数数组");
                            console.log($scope.ticketInfo_viewInfo_tempRequestParamArr);
    
                            console.log("订单页：对应的门票价格");
                            console.log(tempPrice);
    
                            console.log("订单页：门票总价");
                            console.log($scope.ticketViewSumPrice);
    
                        }
                    }
                }
            }

            // @门票数量 减少 函数
            $scope.ticket_viewInfo_decr = function(index) {
            
                for(var i = 0; i < len; i++) {
    
                    if(index == i) {
    
                        if($scope["ticketInfo_viewInfo_count" + index] > 1) {
    
                            $scope["ticketInfo_viewInfo_count" + index] -= 1;
                            console.log("订单页：相应门票的数量" + $scope["ticketInfo_viewInfo_count" + index]);
    
                            $scope.ticketInfo_viewInfo_tempRequestParamArr[index] = [
                                $scope.ticketInfo.viewInfo.viewPrices[index].viewPriceId,
                                $scope["ticketInfo_viewInfo_count" + index]
                            ];
    
                            var tempPrice = $scope.floatObj.multiply($scope.ticketInfo.viewInfo.viewPrices[index].couponPrice, 1, 2); // @临时的对应门票价格计算
    
                            
                            $scope.ticketViewSumPrice = $scope.floatObj.subtract($scope.ticketViewSumPrice, tempPrice, 2); // @门票总价计算

                            console.log("订单页：门票请求参数数组");
                            console.log($scope.ticketInfo_viewInfo_tempRequestParamArr);
    
                            console.log("订单页：对应的门票价格");
                            console.log(tempPrice);
    
                            console.log("订单页：门票总价");
                            console.log($scope.ticketViewSumPrice);
    
                        }
                    }
                }
            }

        }
        

        // ************************************************************************************************
        

        // @函数 验证手机号码
        $scope.checkPhone = function() {
            if($scope.dataContainer.phone !=  undefined) {
                if($scope.dataContainer.phone.length == 11) {
                    var phone = $scope.dataContainer.phone.toString();
                    if(!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) { // 正则检测
                        layer.msg("输入的手机号码有误"); 
                        $scope.verificationCodeBtnDisabled = true; // 禁用获取验证码按钮
                        $scope.payBtnDisabled = true; // 禁用确认支付按钮
                        return false; 
                    } else {
                        $scope.verificationCodeBtnDisabled = false; // 启用获取验证码按钮
                    }
                } else{
                    $scope.verificationCodeBtnDisabled = true; // 禁用获取验证码按钮
                    $scope.payBtnDisabled = true; // 禁用确认支付按钮
                }
            } else {
                // 
            }
        }


        // ************************************************************************************************
        

        // @验证码倒计时 处理流程
        var defaultCountdown = 60; // @默认60秒的倒计时时间
        $scope.countdownTime = defaultCountdown;
        var stopCountdownTime;
        $scope.fight = function() {
            $scope.countdownTxtShow = true;
            if ( angular.isDefined(stopCountdownTime) ) {
                return;  // Don't start a new fight if we are already fighting
            }
            stopCountdownTime = $interval(function() {
                if ($scope.countdownTime >  0) {
                    $scope.countdownTime = $scope.countdownTime - 1;
                } else {
                    $scope.stopFight();
                    $scope.countdownTxtShow = false;
                    $scope.verificationCodeBtnDisabled = false;
                    $scope.resetFight();
                }
            }, 1000);
        };
        $scope.stopFight = function() {
            if (angular.isDefined(stopCountdownTime)) {
                $interval.cancel(stopCountdownTime);
                stopCountdownTime = undefined;
            }
        };
        $scope.resetFight = function() {
            $scope.countdownTime = defaultCountdown;
        };
        $scope.$on('$destroy', function() {
            $scope.stopFight(); // Make sure that the interval is destroyed too
        });

        $scope.countdown = function() { // @获取验证码 并开始倒计时

            $scope.verificationCodeBtnDisabled = true;
            console.log("订单页：电话号码 " + $scope.dataContainer.phone);
            $scope.fight();

            // @进行倒计时的同时，还需要向服务器发送获一个获取验证码的请求

            var departDate = $filter('date')($scope.currentSelectedDateOrTime, 'yyyy-MM-dd');
            var checkcode = parseInt($scope.dataContainer.phone) % parseInt($scope.dataContainer.phone.substring(1,4)) ;
            

            // @参数分情况封装
            if($scope.ticketInfo.plans != null) { // @有车票时

                if($scope.ticketInfo.plans[0] != null && $scope.ticketInfo.plans[0] == null) { // @有去程，无返程的情况

                    if($scope.ticketInfo_forwardTicket_haveChoosed == true) {
                        
                        var bsids = $scope.ticketInfo.plans[0].linename + '&' + departDate + '&' + ticketInfo_forwardTicket_time
                        
                        var requestData = {
                            phone: $scope.dataContainer.phone,
                            servicename: 'UserBuyViewTicket',
                            checkcode: checkcode.toString(),
                            bsids: bsids
                        };

                    } else {

                        layer.open({
                            content: '请先选择出发时间',
                            btn: '确定'
                        });
                        
                        return false;
                    }

                } else if($scope.ticketInfo.plans[0] != null && $scope.ticketInfo.plans[0] != null) { // @有去程，有返程的情况

                    if($scope.ticketInfo_forwardTicket_haveChoosed == true && $scope.ticketInfo_backwardTicket_haveChoosed == true) {
                        
                        var bsids = $scope.ticketInfo.plans[0].linename + '&' + departDate + '&' + ticketInfo_forwardTicket_time
                        
                        var requestData = {
                            phone: $scope.dataContainer.phone,
                            servicename: 'UserBuyViewTicket',
                            checkcode: checkcode.toString(),
                            bsids: bsids
                        };
    
                    } else {
    
                        layer.open({
                            content: '请先选择出发时间',
                            btn: '确定'
                        });
                        
                        return false;
                    }
                }

            } else { // @无车票时

                var tickets = $scope.ticketInfo.viewInfo.viewName + '&' + departDate;

                var requestData = {
                    phone: $scope.dataContainer.phone,
                    servicename: 'UserBuyDoorTicket',
                    checkcode: checkcode.toString(),
                    tickets: tickets
                };

            }

            console.log("订单页：验证码请求参数打印");
            console.log(requestData);

            // @获取短信验证码 /wechat/utils/sendCheckAuthcode
            $myHttpService.postNoLoad('api/utils/sendCheckAuthcode', requestData, function(data) {

                console.log("订单页：获取短信验证码API返回的数据");
            
                console.log(data);

            });

        }
        

        // ************************************************************************************************


        $scope.couponChooseModal = $ionicModal.fromTemplate('<ion-modal-view>'+
            '	  '+
            '        <ion-header-bar class="bar bar-header modal-two" >'+
            '		'+
            '		   <button class="button  button-balanced" ng-click="coupon_OKFn()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">取消</button>'+
            '          <h1 class="title" style="color: black;font-size: 17px;font-weight: 400;">请选择优惠券</h1>'+
            '          <button class="button button-balanced" ng-click="coupon_OKFn()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">确定</button>'+
            '		'+
            '        </ion-header-bar>'+
            '		'+
            '        <ion-content class="padding" style="background: #ffffff;margin-top: 300px;" >'+
            // '		    <p style="text-align:center;font-size: 20px;"><span>{{ticketInfo.viewName}}</span></p>	'+
            '			<ion-radio style="padding: 15px 10px;border: none;font-size: 17px;" ng-repeat="item in couponArr"'+
            '               ng-value="item.brcid"'+
            '               ng-model="couponType.type">'+
            '      			{{ item.couponMoney }} <span style="margin-left: 5px;">有效期 {{item.overDate | date:"yyyy-MM-dd"}}</span> '+
            '    		</ion-radio>'+
            '			'+
            '        </ion-content>'+
            '		'+
            '      </ion-modal-view>', {
            scope: $scope,
            animation: 'slide-in-up'
        });


        // @优惠券的检测 函数
        $scope.oldTicketPriceShow = true;
        $scope.newTicketPriceShow = false;
        $scope.useCoupon = false;
        var couponCount = 1;

        $scope.noCouponTxt = false; // @无可用优惠券时，控制文本
        $scope.noCouponTxt2 = false; // @有可用优惠券时，控制文本

        $scope.couponType = { // @优惠券类型，同时也是 brcid
            type: ''
        };

        $scope.checkCoupon2 = function() { 

            // @查询用户是否有优惠卷 wechat/product/queryUserBuslineCoupon
            $myHttpService.post('api/product/queryUserBuslineCoupon', {userid: $rootScope.session.user.userInfo.userid}, function(data) {

                console.log("订单页：查询用户是否有优惠卷API返回的数据");
                console.log(data);

                $scope.couponType = { // @优惠券类型，同时也是 brcid
                    type: ''
                };

                if(data.isHaveCoupon) { // @有优惠券

                    $scope.couponArr = data.buslineCoupons; // @优惠券数组

                    $scope.couponChooseModal.show(); // @优惠券弹窗显示

                } else { // @无优惠券

                    $scope.noCouponTxt = true;
                    $scope.useCoupon = false;

                }


            });

        }

        $scope.coupon_OKFn = function() { // @优惠券弹窗中的确定、取消函数
            
            
            for(var item in $scope.couponArr) {

                var objTemp = $scope.couponArr[item];

                if(objTemp.brcid == $scope.couponType.type) {

                    $scope.coupon = objTemp.couponMoney; // 找出用户选择的相应的优惠券金额

                    $scope.noCouponTxt2 = true;
                    
                }
            }

            $scope.couponChooseModal.hide();            

        }

        /*
            $scope.checkCoupon = function($event) {

                if($scope.ticketInfo.productType == '1') {
                    var requestData = {
                        userid: $rootScope.session.user.userInfo.userid,
                        gobdid: $scope.ticketInfo.gobdid,
                        count: $scope.dataContainer.count,
                        backbdid: $scope.ticketInfo.backbdid
                    }
                } else {
                    var requestData = {
                        userid: $rootScope.session.user.userInfo.userid,
                        gobdid: $scope.ticketInfo.gobdid,
                        count: $scope.dataContainer.count
                    }
                }
                
                if(couponCount % 2 == 1) {

                    $scope.oldTicketPriceShow = false;        
                    $scope.newTicketPriceShow = true;
                    $scope.useCoupon = true;
            
                    $myHttpService.post('api/product/queryUserBuslineCoupon', requestData, function(data) {
                        console.log("优惠券状态");
                        console.log(data.isHaveCoupon);
                        if(data.isHaveCoupon) {
                            // 有优惠券
                            $scope.couponBtnState = true;
                            $scope.couponTxTShow = false;
                            $scope.newTicketPrice = data.showPrice; // 优惠金额
                        } else {
                            // 没有优惠券
                            $scope.couponBtnState = false;
                            $scope.couponTxTShow = true;
                            $scope.newTicketPrice = 0;                
                        }
                    }, errorFn);

                } else {
                        $scope.couponBtnState = false;
                        $scope.oldTicketPriceShow = true;
                        $scope.newTicketPriceShow = false;   
                        $scope.useCoupon = false;         
                }
                couponCount++;
            };

        */


        // ************************************************************************************************


        // @确认支付按钮的状态监控 函数
        $scope.payBtnCheck = function() {
            if($scope.dataContainer.phone !=  undefined) {
                if($scope.dataContainer.phone.length == 11) {
                    var phone = $scope.dataContainer.phone.toString();
                    if(!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) { 
                        layer.msg("输入的手机号码有误"); 
                        $scope.checkPhoneState = false;
                        return false; 
                    } else {
                        $scope.checkPhoneState = true;
                    }
                } else{
                    $scope.checkPhoneState = false;
                }
            } else {
                $scope.checkPhoneState = false;                
            }
            if($scope.checkPhoneState) {
                if($scope.dataContainer.verificationCode) {
                    $scope.payBtnDisabled = false;
                } else {
                    $scope.payBtnDisabled = true;
                }
            } else {
                $scope.payBtnDisabled = true;
            }
        }


        // @支付检验 函数
        $scope.checkRecharge = function() {

            if($scope.ticketInfo.plans != null) { // @有车票
                
                // @有去程时 的情况
                if($scope.ticketInfo.plans[0] != null) {

                    if($scope.ticketInfo_forwardTicket_haveChoosed == false) {
                        layer.open({
                            content: '客官，请选择行程出发时间日期 (╯-╰)',
                            btn: '确定'
                        });
                        return false;
                    }

                }
                
                // @有返程时 的情况
                if($scope.ticketInfo.plans[1] != null) {

                    if($scope.$scope.ticketInfo_backwardTicket_haveChoosed == false) {
                        layer.open({
                            content: '客官，请选择行程出发时间日期 (╯-╰)',
                            btn: '确定'
                        });

                        return false;
                    }

                }
                
                // @有去程，没有返程 的情况
                if($scope.ticketInfo.plans[0] != null && $scope.ticketInfo.plans[1] == null) {
                    
                    if($scope.ticketInfo_forwardTicket_count == 0) {



                    }

                }

                // @有去程，有返程 的情况
                if($scope.ticketInfo.plans[0] != null && $scope.ticketInfo.plans[1] != null) {
                    if($scope.ticketInfo_forwardTicket_count == 0 && $scope.ticketInfo_backwardTicket_count == 0) {

                    }
                }

            }


            $scope.recharge();

        }

        // @车票支付 函数
        $scope.recharge = function() {

            // @没有车票只有门票的情况 检测
            if($scope.ticketInfo.plans == null && $scope.ticketInfo.viewInfo != null) {

                var flag = false;

                // @对门票参数数组进行检测
                for(var i = 0; i < $scope.ticketInfo_viewInfo_tempRequestParamArr.length; i++) {

                    var item = $scope.ticketInfo_viewInfo_tempRequestParamArr[i][1];
                    if(item != 0) {
                        flag = true;
                    }

                }

                if(flag == false) {
                    layer.open({
                        content: '客官，请至少选择一张门票 (╯-╰)',
                        btn: '确定'
                    });
                    return false;
                }

            }

            // @参数封装
            
            // @车票参数数组提取
            var bdids = '';                
            if($scope.ticketInfo_Ticket_tempRequestParamArr != null) {

                for(var i = 0; i < $scope.ticketInfo_Ticket_tempRequestParamArr.length; i++) {

                    if($scope.ticketInfo_Ticket_tempRequestParamArr[i][1] != 0) {
                        bdids += $scope.ticketInfo_Ticket_tempRequestParamArr[i][0] + '&' + $scope.ticketInfo_Ticket_tempRequestParamArr[i][1];
                    }

                }

            }

            // @门票参数数组提取
            var viewPrices = '';
            if($scope.ticketInfo_viewInfo_tempRequestParamArr != null) {

                for(var i = 0; i < $scope.ticketInfo_viewInfo_tempRequestParamArr.length; i++) {
                    
                    if($scope.ticketInfo_viewInfo_tempRequestParamArr[i][1] != 0) {
                        viewPrices += $scope.ticketInfo_viewInfo_tempRequestParamArr[i][0].viewPriceId + '&' + $scope.ticketInfo_viewInfo_tempRequestParamArr[i][1];
                    }

                }
            }
            

            // departDate
            // bdids
            // couponuse
            // userid
            // openid
            // authcode
            // viewPrices
            // brcid
            // productid
            

            // $scope.currentSelectedDateOrTime
            var departDate = $filter('date')($scope.currentSelectedDateOrTime, 'yyyy-MM-dd');
            var userid = $rootScope.session.user.userInfo.userid;
            var openid = $rootScope.session.user.userInfo.openid;
            var authcode = $scope.dataContainer.verificationCode;
            var productid = $scope.paramsProductid;
            var couponuse = $scope.useCoupon;

            var brcid = $scope.couponType.type;

            var data2 = { 
                userid: $rootScope.session.user.userInfo.userid,
                openid: $rootScope.session.user.userInfo.openid,
                gobdid: $scope.ticketInfo.gobdid,
                couponuse: $scope.couponBtnState,
                departDate: departDate,
                count: $scope.dataContainer.count,
                authcode: $scope.dataContainer.verificationCode,
                backbdid: $scope.ticketInfo.backbdid
            };


            console.log("ZW：传递到order_detail_refund的参数");
            console.log(data2); // 即是 api/product/buyProductTicket 接口的参数，也是传递到 order_detail_refund 的参数


            // @支付请求接口 wechat/product/buyProductTicket
            $myHttpService.post("api/product/buyProductTicket", data2, function(data) {

                console.log(data);
                if(data.counponUse != null) {
                    
                    if(data.updateCoupon) {
                        console.log(data2);
                        $state.go('order_detail_refund', {data: JSON.stringify(data2)}, {reload: true});                        
                    } else {
                        layer.open({
                            content: '支付失败',
                            btn: '确定'
                        });
                    }
                } else {

                    $scope.rechargeid = data.rechargeid;

                    var wxData = {
                        "appId": data.appId,   //公众号名称，由商户传入     
                        "timeStamp": data.timeStamp,    //时间戳，自1970年以来的秒数     
                        "nonceStr": data.nonceStr, //随机串     
                        "package": data.package,     
                        "signType": data.signType,   //微信签名方式：     
                        "paySign": data.paySign //微信签名 
                    };

                    function onBridgeReady() {
                        WeixinJSBridge.invoke(
                            'getBrandWCPayRequest',
                            wxData,
                            function(res) {
                                if(res.err_msg == "get_brand_wcpay_request:ok") {
                                    //重新查询一次服务器
                                    $myHttpService.post("api/recharge/verifyWxorderStatus", {
                                        rechargeid: $scope.rechargeid
                                    }, function(data) {
                                        alert("您已成功支付");
                                        console.log("微信订单支付成功，传递参数打印");
                                        console.log(data2);
                                        $state.go('order_detail_refund', {data: JSON.stringify(data2)}, {reload: true});
                                    }, function(data) {
                                        layer.open({
                                            content: '支付失败，请联系客服处理。',
                                            btn: '确定'
                                        });
                                    });
                                } else if(res.err_msg == "get_brand_wcpay_request:cancel") {
                                    layer.open({
                                            content: '你取消了本次支付',
                                            btn: '确定'
                                    });
                                } else {
                                    layer.open({
                                            content: '支付失败，请联系客服处理。',
                                            btn: '确定'
                                    });
                                }
                            }
                        );
                    }

                    if (typeof WeixinJSBridge == "undefined") {
                        if( document.addEventListener ) {
                            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                        } else if (document.attachEvent) {
                            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                        }
                    } else {
                        onBridgeReady();
                    }

                }

            });
        }


        // ************************************************************************************************


        // 门票处理 函数
        if($scope.ticketInfo.haveTicket == 1) { // 有门票时

            $scope.modal = $ionicModal.fromTemplate('<ion-modal-view>'+
                '	  '+
                '        <ion-header-bar class="bar bar-header modal-one" >'+
                '		'+
                '		   <button class="button  button-balanced" ng-click="chooseScenicSpotTicket()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">取消</button>'+
                '          <h1 class="title"> </h1>'+
                '          <button class="button button-balanced" ng-click="chooseScenicSpotTicket()" style="background: rgba(240, 248, 255, 0.09);color: #676464;">确定</button>'+
                '		  '+
                '        </ion-header-bar>'+
                '		'+
                '        <ion-content class="padding" style="background: #ffffff;margin-top: 300px;" >'+
                '		    <p style="text-align:center;font-size: 20px;"><span>{{ticketInfo.viewName}}</span></p>	'+
                '			<ion-radio style="padding: 15px 10px;border: none;font-size: 17px;" ng-repeat="item in scenicSpotTicketArr"'+
                '               ng-value="item.viewPriceType"'+
                '               ng-model="scenicSpotTicket.type">'+
                '      			{{ item.viewPriceType }} <span style="margin-left: 5px;" >{{ item.couponPrice }} 元</span> '+
                '    		</ion-radio>'+
                '			'+
                '        </ion-content>'+
                '		'+
                '      </ion-modal-view>', {
                scope: $scope,
                animation: 'slide-in-up'
            });
          
            $scope.scenicSpotTicketArr = $scope.ticketInfo.viewPrices; // 门票数组

            $scope.scenicSpotTicket = {
                type: $scope.ticketInfo.viewPrices[0].viewPriceType // 指定门票数组的第一个为 默认门票类型
            };
		
            $scope.chooseScenicSpotTicket = function() {
                for(var item in $scope.ticketInfo.viewPrices) {
                    var objTemp = $scope.ticketInfo.viewPrices[item];
                    if(objTemp.viewPriceType == $scope.scenicSpotTicket.type) {
                        $scope.scenicSpotTicketPrice = objTemp.couponPrice; // 找出用户选择的相应类型的门票价格
                        $scope.scenicSpotTicketPriceID = objTemp.viewPriceId; // 同时更新用户选择的门票的ID
                    }
                }
                $scope.price = $scope.floatObj.add($scope.ticketInfo.productPrice, $scope.scenicSpotTicketPrice, 2);

                $scope.sumPrice =  $scope.floatObj.multiply($scope.price, $scope.dataContainer.count, 2); // 全票总价
                console.log("全票总价");
                console.log($scope.sumPrice);

                $scope.sumPrice2 = $scope.floatObj.multiply($scope.price2, $scope.dataContainer.count, 2);  // 车票总价
                console.log("车票总价");
                console.log($scope.sumPrice2); 

                $scope.price3 = $scope.scenicSpotTicketPrice; // 门票
                $scope.sumPrice3 = $scope.floatObj.multiply($scope.price3, $scope.dataContainer.count, 2);  // 门票总价
                console.log("门票总价");
                console.log($scope.sumPrice3);

                $scope.modal.hide();
                console.log($scope.scenicSpotTicketPriceID);
            }


            $scope.$on('$destroy', function() { // @销毁工作
                $scope.modal.remove();
            });

        }
        
    })

    /* 车票购买成功 跳转 */
    .controller('order_detail_refund', function($rootScope, $scope, $filter, $state, $myHttpService, $ionicSlideBoxDelegate) {

        if(JSON.parse($state.params.data) == null) { // 访问此页面时，如果没有传递过来参数

            if(sessionStorage.getItem('order_detail_refund_backbdid') == null) {

                var requestData = {
                    userid: sessionStorage.getItem('order_detail_refund_userid'),
                    departDate: sessionStorage.getItem('order_detail_refund_departDate'),
                    gobdid: sessionStorage.getItem('order_detail_refund_gobdid'),
                    count: sessionStorage.getItem('order_detail_refund_count')
                };

            } else {

                var requestData = {
                    userid: sessionStorage.getItem('order_detail_refund_userid'),
                    departDate: sessionStorage.getItem('order_detail_refund_departDate'),
                    gobdid: sessionStorage.getItem('order_detail_refund_gobdid'),
                    backbdid: sessionStorage.getItem('order_detail_refund_backbdid'),
                    count: sessionStorage.getItem('order_detail_refund_count')
                };

            }
               
            // 获取用户刚刚购买的票
            $myHttpService.post('api/product/queryProductOrderByBdid', requestData, function(data) {
                console.log(data);
                if(data.backViewOrders == null) {
                    $scope.ticketsInfo = data.viewOrders;
                    $scope.ticketsInfoLength = data.viewOrders.length;
                } else {

                    $scope.ticketsInfo = data.viewOrders.concat(data.backViewOrders);
                    $scope.ticketsInfoLength = $scope.ticketsInfo.length;              
                }
                
                $ionicSlideBoxDelegate.update();
            }, errorFn);

        } else { // 访问此页面时，如果有参数传递过来
            
            var paramsData = JSON.parse($state.params.data);
            console.log("支付成功后，传递过来的参数");
            console.log(paramsData);

            sessionStorage.setItem('order_detail_refund_userid', paramsData.userid);
            sessionStorage.setItem('order_detail_refund_departDate', paramsData.departDate);
            sessionStorage.setItem('order_detail_refund_gobdid', paramsData.gobdid);
            sessionStorage.setItem('order_detail_refund_count', paramsData.count);

            if(paramsData.backbdid == null) { // 单程票
                var requestData = { 
                    userid: paramsData.userid,
                    departDate: paramsData.departDate,
                    gobdid: paramsData.gobdid,
                    count: paramsData.count
                };
                if(sessionStorage.getItem('order_detail_refund_backbdid') != null) {
                    sessionStorage.removeItem('order_detail_refund_backbdid)');
                }
            } else { // 往返票
                var requestData = {
                    userid: paramsData.userid,
                    departDate: paramsData.departDate,
                    gobdid: paramsData.gobdid,
                    backbdid: paramsData.backbdid,
                    count: paramsData.count
                };
                sessionStorage.setItem('order_detail_refund_backbdid', paramsData.backbdid);
            }

            // 获取用户刚刚购买的票
            $myHttpService.post('api/product/queryProductOrderByBdid', requestData, function(data) {
                console.log(data);
                if(data.backViewOrders == null) { // 单程票
                    $scope.ticketsInfo = data.viewOrders;
                    $scope.ticketsInfoLength = data.viewOrders.length;
                } else { // 往返票
                    $scope.ticketsInfo = data.viewOrders.concat(data.backViewOrders);
                    $scope.ticketsInfoLength = $scope.ticketsInfo.length;              
                }
                $ionicSlideBoxDelegate.update();
            }, errorFn);
        }

        // 车辆位置 函数
        $scope.getBusPosition = function(i) {
            var data = {
                carid: $scope.ticketsInfo[i].carid,
                lineid: $scope.ticketsInfo[i].lineid
            };
            $state.go('ticket_detail.bus_position', {data: JSON.stringify(data)}, {reload: false});
        }        
    })

    /* 车票 评价 */
    .controller('order_check_comment', function($rootScope, $scope, $timeout, $state, $filter, $myHttpService) {

        $scope.submitBtnIsDiasbled = true; // 控制提交按钮的状态

        if(JSON.parse($state.params.data) == null) {
            $state.go('myplan', {}, {location: 'replace'});
        } else {

            // 接受参数
            $scope.isCommented = JSON.parse($state.params.isCommented);
            $scope.isCommentedText = JSON.parse($state.params.isCommentedText);
            $scope.isCommentedScore = JSON.parse($state.params.isCommentedScore);
            var paramsData = JSON.parse($state.params.data);

            var requestData = {
                viewOrderid: paramsData.viewOrderid
            };

            $myHttpService.post('api/product/queryUserProductTicketDetails', requestData, function(data){

                console.log(data);
                $scope.ticketInfo = data.viewOrder;

            }, errorFn);
            
            // 由于ionic的原因，必须要是对象来接收数据
            $scope.dataContainer = {
                text: ""
            }

            // 星星 调用了Star的指令，这里是相关的配置信息
            $scope.max = 5; // 星星数量
            $scope.ratingVal = 5; // 默认点亮数量
            $scope.readonly = false; // 是否只读
            $scope.onHover = function(val) {$scope.ratingVal = val;};
            $scope.onLeave = function() {};

            // 评价提交按钮状态 监测函数
            $scope.submitBtnCheck = function() {
                if($scope.dataContainer.text) {
                    $scope.submitBtnIsDiasbled = false;
                } else {
                    $scope.submitBtnIsDiasbled = true;
                }
            };

            // 提交数据
            $scope.submitComment = function() {
                // 封装数据
                var data = {
                    viewOrderid: paramsData.viewOrderid, // 订单编号
                    orderScore: $scope.ratingVal, // 订单评分
                    orderhie: $scope.dataContainer.text // 订单评价
                };
                console.log(data);
                $myHttpService.post('api/product/insertViewOrderHierarchy', data, function(data) {
                    layer.open({
                        content: '评价提交成功',
                        btn: '确定',
                        shadeClose: false,
                        yes: function(index){
                            $state.go('myplan', {}, {location: 'replace'});
                            layer.close(index);
                        }
                    });
                }, errorFn);
            };

            // 车辆位置函数
            $scope.getBusPosition = function() {
                var data = {
                    carid: $scope.ticketInfo.carid,
                    lineid: $scope.ticketInfo.lineid
                };
                console.log(data);
                $state.go('ticket_detail.bus_position', {data: JSON.stringify(data)}, {reload: true});
            }
        }
    })

    /* 正在退款中 */
    .controller('order_refunding', function($rootScope, $scope, $state, $myLocationService) {

        if(JSON.parse($state.params.data) == null) {
                $state.go('myplan', {}, {location: 'replace'});
        } else {
            var paramsData = JSON.parse($state.params.data);
            console.log(paramsData);
            $scope.ticketInfo = paramsData;
        }
    })

    /* 我的行程 */
    .controller('myplan', function($rootScope, $scope, $filter, $myHttpService, $state) {

        if(sessionStorage.getItem("myplanCount") == null) {
            var myplanCount = 1;
        } else {
            var myplanCount = sessionStorage.getItem("myplanCount");
        }

        if(myplanCount == 1) {
            $rootScope.ticketsInfo = []; // 车票数组
            sessionStorage.setItem("myplanCount", 2);
            $rootScope.hasmore2 = false; // 首次进入页面时 不触发上拉加载函数
            $scope.pageCount = 1; // 保存的记录页面参数 用于上拉加载分页的记录
            $scope.hasmore = true;
            // 车票首次加载函数
            $scope.doRefreshTicket_first = function() {
                console.log("doRefreshTicket_first执行了");            
                var requestData = {
                    userid: $rootScope.session.user.userInfo.userid,
                    offset: 0,
                    pagesize: 10,
                };
                $myHttpService.postNoLoad('api/product/queryUserProductTicketList', requestData, function(data) {
                    console.log(data);
                    if(data.userViewList.length < 10) {
                        $rootScope.hasmore2 = false;
                    } else {
                        $rootScope.hasmore2 = true;
                        $scope.pageCount = 2;
                    }
                    $rootScope.ticketsInfo = data.userViewList;
                    $rootScope.ticketsTotal = data.totalnum;
                    
                    $scope.$broadcast('scroll.refreshComplete');
                    if($rootScope.ticketsInfo.length == 0) {
                        $scope.ticketsInfoIsEmpty = true;                    
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                }, function() {
                    $scope.$broadcast('scroll.refreshComplete');                
                });
            };
            $scope.doRefreshTicket_first(); // 只在首次进去页面时 自动调用一次！！！
        }

        var run = false;
        $scope.ticketsInfoIsEmpty = false; // 当没有任何票信息时显现
        
        // 车票下拉刷新函数
        $scope.doRefreshTicket = function() {
            console.log("我的行程页：doRefreshTicket执行了");            
            var requestData = {
                userid: $rootScope.session.user.userInfo.userid,
                offset: 0,
                pagesize: 10,
            };
            // 订单列表wechat/product/queryUserProductTicketList
            $myHttpService.postNoLoad('api/product/queryUserProductTicketList', requestData, function(data) {
                console.log("我的行程页：获取所有订单的列表API返回的数据(下拉刷新)");
                console.log(data);
                if(data.userViewList.length < 10) {
                    $rootScope.hasmore2 = false;
                } else {
                    $rootScope.hasmore2 = true;
                    $scope.pageCount = 2;
                }
                $rootScope.ticketsInfo = data.userViewList;
                $rootScope.ticketsTotal = data.totalnum;
                
                $scope.$broadcast('scroll.refreshComplete');
                if($rootScope.ticketsInfo.length == 0) {
                    $scope.ticketsInfoIsEmpty = true;                    
                } else {
                    layer.open({
                        content: '刷新成功',
                        skin: 'msg',
                        time: 1
                    });
                }
                $scope.$broadcast('scroll.refreshComplete');
            }, function() {
                $scope.$broadcast('scroll.refreshComplete');                
            });
        };

        // 比较函数，对票进行排序，从大到小
        var compare = function (prop) {
            return function (obj1, obj2) {
                var val1 = obj1[prop];
                var val2 = obj2[prop];
                if(val1 == undefined) {
                    val1 = 100000;
                }
                if(val2 == undefined) {
                    val2 = 100000;
                }
                if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                    val1 = Number(val1) / 10000;
                    val2 = Number(val2) / 10000;
                }
                return val2 - val1;
            } 
        }
        
        // 上拉加载更多票信息
        $scope.loadMoreTicket = function() {
            console.log("我的行程页：loadMoreTicket执行了");
            var offset = ($scope.pageCount - 1) * 10;
            var requestData = {
                userid: $rootScope.session.user.userInfo.userid,
                offset: offset,
                pagesize: 10,
            };
            if(!run) {
                run = true;
                $myHttpService.postNoLoad('api/product/queryUserProductTicketList', requestData, function(data) {
                    console.log("我的行程页：获取所有订单的列表API返回的数据(上拉加载)");                
                    if (data.userViewList.length < 10) { 
                        $scope.hasmore = false; // 这里判断是否还能获取到数据，如果没有获取数据，则不再触发加载事件 
                        $rootScope.hasmore2 = false;
                    } else {
                        $scope.pageCount++; // 计数
                    }
                    run = false;
                    $rootScope.ticketsInfo = $rootScope.ticketsInfo.concat(data.userViewList); 
                    console.log($rootScope.ticketsInfo);
                    $rootScope.ticketsInfo.sort(compare('departDate'));
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if($rootScope.ticketsInfo.length == 0 ) { // 无票
                        $scope.ticketsInfoIsEmpty = true;
                    }
                }, function() {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }
        }
        
        // 点击未使用车票进入 车票详情界面
        $scope.unusedTicketToDetail = function(item, i) {
            $state.go('ticket_detail.ticketdetail', {data: JSON.stringify(item)}, {reload: false});
        }

        // 点击未使用门票进入 门票详情界面
        $scope.unusedAdmissionTicketToDetail = function(item, i) {
            $state.go('ticket_admission_detail', {data: JSON.stringify(item)}, {reload: false});
        }

        // 点击已使用车票进入 评价界面，同时还会判断是否已评价
        $scope.usedTicketToComment = function(item, i) {
            var isCommented = false;
            var isCommentedText = '';
            var isCommentedScore = 1;
            if(item.orderhie != null) {
                isCommented = true;
                isCommentedText = item.orderhie;
                isCommentedScore = item.orderScore;
            }
            $state.go('order_check_comment', {
                data: JSON.stringify(item),
                isCommented: JSON.stringify(isCommented),
                isCommentedText: JSON.stringify(isCommentedText),
                isCommentedScore: JSON.stringify(isCommentedScore)
            }, {reload: true});
        }

        // 点击正在退款车票 进入 正在退款页面
        $scope.refundingToRefund = function(item, i) {
            $state.go('order_refunding', {data: JSON.stringify(item)}, {reload: false});
        }
    })

     /* 测试 */
    .controller('test', function($rootScope, $scope, $state, $timeout, $myLocationService, $myHttpService, $ionicLoading, $ionicScrollDelegate, $ionicActionSheet, $selectCity, $filter, ionicDatePicker) {

        $scope.selectedDate1;
        $scope.selectedDate2;
    
        $scope.openDatePickerOne = function (val) {
          var ipObj1 = {
            callback: function (val) {  //Mandatory
              console.log('Return value from the datepicker popup is : ' + val, new Date(val));
              $scope.selectedDate1 = new Date(val);
            },
            from: new Date(),
            to: new Date(2099, 11, 31),
            inputDate: new Date(),
            titleLabel: '选择日期',
            setLabel: '选择',
            todayLabel: '今天',
            closeLabel: '返回',
            mondayFirst: false,
            disableWeekdays: [],
            dateFormat: 'yyyy-MM-dd', //可选
            closeOnSelect: false, //可选,设置选择日期后是否要关掉界面。呵呵，原本是false。
            templateType: 'popup'
          };
          ionicDatePicker.openDatePicker(ipObj1);
        };
    
        $scope.openDatePickerTwo = function (val) {
          var ipObj1 = {
            callback: function (val) {  //Mandatory
              console.log('Return value from the datepicker modal is : ' + val, new Date(val));
              $scope.selectedDate2 = new Date(val);
            },
            titleLabel: '选择日期',
            closeLabel: '返回',
            from: new Date(),
            to: new Date(2099, 11, 31),// 11对应十二月，差1
            dateFormat: 'yyyy-MM-dd', //可选
            closeOnSelect: true, //可选,设置选择日期后是否要关掉界面。呵呵，原本是false。
            inputDate: new Date(),
            templateType: 'modal'
          };
          ionicDatePicker.openDatePicker(ipObj1);
        }

        $scope.$on('$destroy', function() {
           
        });
        
        // 微信上传图片
        var wxConfig = {};
        //获取微信签名
        // $myHttpService.post("api/utils/getWechatJsSign", {currenturl: window.location.href.split('#')[0]}, function(data) {
        //     console.log(data);
        //     wxConfig = {
        //         debug: false,
        //         appId: data.appId,
        //         timestamp: data.timestamp,
        //         nonceStr: data.nonceStr,
        //         signature: data.signature,
        //         jsApiList:['chooseImage', 'previewImage', 'uploadImage','downloadImage']
        //     },
        //     wx.config(wxConfig);
        //     wx.ready(function(){
        //         /* wx.onMenuShareAppMessage({
        //          title: "畅巴线路报名分享测试", // 分享标题
        //          desc: '畅巴线路报名分享测试描述', // 分享描述
        //          link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5d18456bf1ece6b3&redirect_uri=http%3a%2f%2fwechat.happyev.com%2fgetUserInfoByCode%3freturn%3dapp%2fbuy&response_type=code&scope=snsapi_base&state=123#wechat_redirect', // 分享链接
        //          type: 'link', // 分享类型,music、video或link，不填默认为link
        //          success: function () {
        //          layer.alert("你已分享成功！")
        //          },
        //          cancel: function () {
        //          layer.msg("你取消了分享！")
        //          // 用户取消分享后执行的回调函数
        //          }
        //          });*/
        //     });
        // });
        $scope.thumb = {};      //用于存放图片的base64
        $scope.getGuid = function() {
            function S4() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            }
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        }
        $scope.chooseImg = function($event) {

            console.log($event);

            wx.chooseImage({
                count: 2, // 默认9
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    for(var i = 0; i < localIds.length; i++) {
                        var guid = $scope.getGuid();   //通过时间戳创建一个随机数，作为键名使用
                        $scope.$apply(function(){
                            $scope.thumb[guid] = {
                                guid : guid,  
                            }
                        });
                    }
                },
                fail : function(res) {
                    alterShowMessage("操作提示", JSON.stringify(res), "1", "确定","", "", "");
                }
            });

        }

    })

    /* 车辆位置 */
    .controller('BusPositionController', function($scope, $myHttpService, $timeout, $state) {

        if(JSON.parse($state.params.data) == null) {
            
            var lineArr = [
                    116.397428, // 经度
                    39.90923 // 纬度
            ];
            var map = new AMap.Map("J_map_canvas", {
                resizeEnable: true,
                center: [lineArr[0], lineArr[1]],
                zoom: 17
            });
            marker = new AMap.Marker({
                map: map,
                position: [lineArr[0], lineArr[1]],
                icon: "http://webapi.amap.com/images/car.png",
                content: '<i class="icon ion-ios-location" style="color: #f71909;font-size:30px"></i>',
                offset: new AMap.Pixel(-26, -13),
                animation: "AMAP_ANIMATION_DROP"
            });
            $timeout(function() {
                layer.open({
                    content: '请求车辆位置出错，请重试',
                    btn: '确定',
                    shadeClose: false,
                    yes: function(index) {
                        $state.go('myplan', {}, {location: 'replace'});
                        layer.close(index);
                    }
                });
            }, 1500);

        } else {

            var paramsData = JSON.parse($state.params.data);
            console.log("传到定位地图页面的参数");
            console.log(paramsData);
            $scope.positionArr = {};
            $myHttpService.post('api/product/queryCarLocation', {
                carid: paramsData.carid,
                lineid: paramsData.lineid
            }, function(data) {        
                console.log(data);
                $scope.positionArr = data.car;
                $scope.busline = data.busline;
                $scope.stations = data.stations;
                // 当前车辆位置 和 地图中心点 经纬度
                var lineArr = [
                    $scope.positionArr.currlon, // 经度
                    $scope.positionArr.currlat // 纬度
                ];
                // 高德地图绘制
                var map = new AMap.Map("J_map_canvas", {
                    resizeEnable: true,
                    center: [lineArr[0], lineArr[1]],
                    zoom: 11
                });

                // 所有站点的经纬度数组
                var allLonLatArr = [];

                // 所有停靠点的经纬度数组
                var stationType1 = [];

                for(var index in $scope.stations) { // 站点、停靠点提取操作
                    var item = $scope.stations[index];
                    var tempArr = [item.stalongitude, item.stalatitude];
                    allLonLatArr.push(tempArr);
                    if(item.stationType == 1) {
                        var tempArr2 = [
                            [
                                item.stalongitude,
                                item.stalatitude
                            ],
                            item.stationname
                        ];
                        stationType1.push(tempArr2);
                    }
                }
                // 起点站点 经纬度
                var startPositionLonLat = [
                    $scope.busline.departlon,
                    $scope.busline.departlat
                ];
                // 终点站点 经纬度
                var endPositionLonLat = [
                    $scope.busline.arrivelon,
                    $scope.busline.arrivelat
                ];
                // 中间站点、途径点
                var allLonLatArr2 = allLonLatArr.slice(1, allLonLatArr.length-1); // 去掉首尾的经纬点

                AMapUI.load(['ui/overlay/SimpleMarker'], function(SimpleMarker) {

                    // 路径规划绘制 
                    AMap.plugin('AMap.Driving', function() {
                        var drving = new AMap.Driving({
                            map: map,
                            hideMarkers: true
                        })
                        drving.search(startPositionLonLat, endPositionLonLat, {waypoints: allLonLatArr2}, function(status, result) {

                            for(var index in stationType1) {
                                var item = stationType1[index];
                                if(index == 0) {
                                    new SimpleMarker({
                                        iconLabel: {
                                            innerHTML: '起',
                                            style: {
                                                color: '#fff',
                                                fontSize: '120%',
                                                marginTop: '2px'
                                            }
                                        },
                                        iconStyle: 'green',
                                        map: map,
                                        position: item[0],
                                        label: {
                                            content: item[1],
                                            offset: new AMap.Pixel(11, 43) // (left, top)
                                        }
                                    });
                                } else if( index == stationType1.length-1) {
                                    new SimpleMarker({
                                        iconLabel: {
                                            innerHTML: '终',
                                            style: {
                                                color: '#fff',
                                                fontSize: '120%',
                                                marginTop: '2px'
                                            }
                                        },
                                        iconStyle: 'red',
                                        map: map,
                                        position: item[0],
                                        label: {
                                            content: item[1],
                                            offset: new AMap.Pixel(11, 43) // (left, top)
                                        }
                                    });
                                } else {
                                    new SimpleMarker({
                                        iconLabel: {
                                            innerHTML: '经',
                                            style: {
                                                color: '#fff',
                                                fontSize: '120%',
                                                marginTop: '2px'
                                            }
                                        },
                                        iconStyle: 'orange',
                                        map: map,
                                        position: item[0],
                                        label: {
                                            content: item[1],
                                            offset: new AMap.Pixel(11, 43) // (left, top)
                                        }
                                    });
                                }
                            }
                        });
                    });
                })

            /* 
                AMapUI.load(['ui/misc/PathSimplifier', 'ui/overlay/SimpleMarker'], function(PathSimplifier, SimpleMarker) {
                    
                    if (!PathSimplifier.supportCanvas) {
                        alert('当前环境不支持 Canvas！');
                        // 起点站点 经纬度
                        var startPositionLonLat = [
                            $scope.busline.departlon,
                            $scope.busline.departlat
                        ];
                        // 终点站点 经纬度
                        var endPositionLonLat = [
                            $scope.busline.arrivelon,
                            $scope.busline.arrivelat
                        ];
                        // 路径规划绘制
                        AMap.plugin('AMap.Driving', function() {
                            var drving = new AMap.Driving({
                                map: map
                            })
                            drving.search(startPositionLonLat, endPositionLonLat);
                        });
                        return;
                    }
                    
                    var pathSimplifierIns = new PathSimplifier({
                        zIndex: 100,
                        //autoSetFitView:false,
                        map: map, //所属的地图实例
                        getPath: function(pathData, pathIndex) {
                            return pathData.path;
                        },
                        getHoverTitle: function(pathData, pathIndex, pointIndex) {
            
                            if (pointIndex >= 0) {
                                //point 
                                return pathData.name + '，点：' + pointIndex + '/' + pathData.path.length;
                            }
                            return pathData.name + '，点数量' + pathData.path.length;
                        },
                        renderOptions: {
                            renderAllPointsIfNumberBelow: 100, //绘制路线节点，如不需要可设置为-1
                                //轨迹线的样式
                            pathLineStyle: {
                                strokeStyle: 'red',
                                lineWidth: 6,
                                dirArrowStyle: true
                            }
                        }
                    });
                    
                    window.pathSimplifierIns = pathSimplifierIns;

                    //设置数据
                    pathSimplifierIns.setData([{
                        name: '车辆运行路线',
                        path: allLonLatArr
                    }]);

                    for(var index in stationType1) {
                        var item = stationType1[index];

                        new AMap.Marker({
                            map: map,
                            position: item[0],
                            content: '<i class="icon ion-flag" style="font-size:22px"></i>',
                            label: {
                                content: item[1],
                                offset: new AMap.Pixel(11, 31) // (left, top)
                            }
                        });

                    }
                    
                    //对第一条线路（即索引 0）创建一个巡航器
                    var navg1 = pathSimplifierIns.createPathNavigator(0, {
                        loop: true, //循环播放
                        speed: 2500 //巡航速度，单位千米/小时
                    });
            
                    navg1.start();
                });
            */
                
                $timeout(function() {
                    var marker = new AMap.Marker({
                        map: map,
                        position: [lineArr[0], lineArr[1]],
                        content: '<i class="icon ion-ios-location" style="color: #f71909;font-size:30px"></i>',
                        animation: "AMAP_ANIMATION_DROP"
                    });
                    var circle = new AMap.Circle({
                        map: map,
                        center: [lineArr[0], lineArr[1]],
                        redius: 100,
                        fillOpacity: 0.1,
                        fillColor: '#09f',
                        strokeColor: '#09f',
                        strokeWeight: 1
                    });
                    // 逆地理编码
                    AMap.plugin('AMap.Geocoder', function() {
                        var str = "加载中>>>";
                        var geocoder = new AMap.Geocoder({});
                        geocoder.getAddress([lineArr[0], lineArr[1]], function(status, result) {
                            if(status == 'complete') {
                               str = result.regeocode.formattedAddress
                               var info = new AMap.InfoWindow({
                                    content: '<div class="title_bus_position">当前车辆位置</div><div class="content_bus_position">'+
                                                    str + '<br/></div>',
                                    offset: new AMap.Pixel(0,-28),
                                    size: new AMap.Size(200,0)
                                });
                                info.open(map,  [lineArr[0], lineArr[1]]);
                            }
                        });
                    });
                }, 1500);

            }, errorFn);
        }
    })

    /* 车票详情 */
    .controller('ticket_detail', function($rootScope, $scope, $filter, $interval, $myHttpService, $state, $myLocationService, $ionicScrollDelegate) {

        $scope.timeShow = false;
        $scope.timeText = "距离发车时间还剩";
        // 倒计时间处理函数
        var stopCountDown = null;
        function ShowCountDown(endTime) { 
			var now = new Date(); 
			var leftTime = endTime - now.getTime();
			if(leftTime > 0) {
				var leftsecond = parseInt(leftTime / 1000);
				$scope.day = Math.floor(leftsecond / (60 * 60 * 24));
				$scope.hour = Math.floor((leftsecond - $scope.day * 24 * 60 * 60) / 3600); 
				$scope.minute = Math.floor((leftsecond - $scope.day * 24 * 60 * 60 - $scope.hour * 3600) / 60); 
				$scope.second = Math.floor(leftsecond - $scope.day * 24 * 60 * 60 - $scope.hour * 3600 - $scope.minute * 60);
			} else {
                clearInterval(stopCountDown);
                $scope.timeText = "";
                $scope.timeShow = false;
			}
		}

        if(JSON.parse($state.params.data) == null) {

            var viewOrderid = sessionStorage.getItem('ticket_detail_viewOrderid');
            $myHttpService.post('api/product/queryUserProductTicketDetails', {
                viewOrderid: viewOrderid
            }, function(data) {
                console.log(data);
                $scope.ticketInfo = data.viewOrder;
                $scope.refundData = {
                    rechargeid: data.viewOrder.rechargeid,
                    userid: $rootScope.session.user.userInfo.userid,
                    openid: $rootScope.session.user.userInfo.openid,
                    viewOrderid: data.viewOrder.viewOrderid,
                    applyResult: false
                };

                // 倒计时处理
                $scope.timeShow = true;
                var temp = $filter('date')($scope.ticketInfo.departDate, 'yyyy/MM/dd') + " " + $scope.ticketInfo.departTime;
                var endTime = (new Date(temp)).getTime();
                stopTime = $interval(function() {
                    ShowCountDown(endTime);
                }, 1000);

            }, errorFn);

        } else {

            var paramsData = JSON.parse($state.params.data);
            var requestData = {
                viewOrderid: paramsData.viewOrderid
            };
            sessionStorage.setItem('ticket_detail_viewOrderid', paramsData.viewOrderid);
            $myHttpService.post('api/product/queryUserProductTicketDetails', requestData, function(data) {
                console.log(data);
                $scope.ticketInfo = data.viewOrder;
                $scope.refundData = {
                    rechargeid: data.viewOrder.rechargeid,
                    userid: $rootScope.session.user.userInfo.userid,
                    openid: $rootScope.session.user.userInfo.openid,
                    viewOrderid: data.viewOrder.viewOrderid,
                    applyResult: false
                };

                // 倒计时处理
                $scope.timeShow = true;
                var temp = $filter('date')($scope.ticketInfo.departDate, 'yyyy/MM/dd') + " " + $scope.ticketInfo.departTime;
                var endTime = (new Date(temp)).getTime();
                stopTime = $interval(function() {
                    ShowCountDown(endTime);
                }, 1000);

            }, errorFn);
        }

        $scope.$on("$destroy", function() {
            $interval.cancel(stopTime);
        });

        $scope.refundBtnState = false;
        var flag = true;

        // 退款函数
        $scope.refund = function() {
            console.log($scope.refundData);
            if($scope.ticketInfo.counponUse) {
                layer.open({
                    content: '您确定要退款吗？',
                    btn: ['退款', '不要'],
                    shadeClose: false,
                    yes: function(index) {
                        $myHttpService.post('api/product/applyRefund', $scope.refundData, function(data) {
                            if(data.data.couponRefund) {
                                $scope.refundBtnState = true;
                                layer.open({
                                    content: '退款成功',
                                    btn: '确定',
                                    shadeClose: false,
                                    yes: function(index) {
                                        $state.go('myplan', {}, {location: 'replace'});
                                        layer.close(index);
                                    }
                                });
                            } else {
                                $scope.refundBtnState = false;
                                layer.open({
                                    content: '申请退款失败，请重试',
                                    btn: '确定',
                                    shadeClose: false,
                                    yes: function(index) {
                                        // $state.go('myplan', {}, {location: 'replace'});
                                        // layer.close(index);
                                    }
                                });
                            }
                        }, errorFn);
                        layer.close(index);
                    }
                });

            } else {

                layer.open({
                    content: '您确定要退款吗？',
                    btn: ['退款', '不要'],
                    shadeClose: false,
                    yes: function(index) {
                        $myHttpService.post('api/product/applyRefund', $scope.refundData, function(data) {
                            $scope.refundBtnState = true;
                            layer.open({
                                content: '申请退款成功，退款将按原路返回到支付账户，预计到账时间为0-3个工作日',
                                btn: '确定',
                                shadeClose: false,
                                yes: function(index) {
                                    $state.go('myplan', {}, {location: 'replace'});
                                    layer.close(index);
                                }
                            });
                        }, errorFn);
                        layer.close(index);
                    }
                });

            }
        };

        // 车辆位置函数
        $scope.getBusPosition = function() {
            var data = {
                carid: $scope.ticketInfo.carid,
                lineid: $scope.ticketInfo.lineid
            };
            console.log(data);
            $state.go('ticket_detail.bus_position', {data: JSON.stringify(data)}, {reload: true});
        }

    })

    /* 我的账户 个人信息保存 编辑 */
    .controller('IUserController', function($rootScope, $scope, $location, $state, $myHttpService) {
        
        $scope.tempUser = {};
        var tempUser2 = {};

        $myHttpService.post("api/user/queryUserinfo", {
            userid: $rootScope.session.user.userInfo.userid
        }, function(data) {
            if(data.flag) {
                $scope.user = data.user;
                if($scope.user.userid.length > 4) {
                    $scope.userOther = $scope.user.userid.substring(0, 6) + "***" + $scope.user.userid.substring($scope.user.userid.length-4);
                } else {
                    $scope.userOther = $scope.user.userid.substring(0, 6) + "***";                    
                }
                tempUser2 = angular.copy($scope.user);
            } else {
                $state.go('auth.login');
            }
        });

        $scope.editMode = false;
        $scope.editCance = false;
        $scope.editButtonText = "设置";

        $scope.edit = function() {
            if($scope.editMode == false) {
                $scope.editCance = true;
                $scope.editMode = !$scope.editMode;
                $scope.tempUser = angular.copy($scope.user);
                $scope.editButtonText = "保存";
            } else {
                // 加个判断，当用户输入长度有误时进行提醒
                if( $scope.tempUser.username.length < 2 || $scope.tempUser.username.length > 4 || !(/^[\u4e00-\u9fa5]{2,4}$/.test($scope.tempUser.username)) || $scope.tempUser.phone.length != 11 || !(/^1(3|4|5|7|8)\d{9}$/.test($scope.tempUser.phone)) ) {
                    if($scope.tempUser.username.length > 4 || $scope.tempUser.username.length < 2 || !(/^[\u4e00-\u9fa5]{2,4}$/.test($scope.tempUser.username))) {
                        layer.open({
                            content: '输入的姓名格式有误，长度为2-4个中文',
                            btn: '确定'
                        });
                    } else if($scope.tempUser.phone.length != 11) {
                        layer.open({
                            content: '输入的手机号有误，长度为11个数字',
                            btn: '确定'
                        });
                    } else if(!(/^1(3|4|5|7|8)\d{9}$/.test($scope.tempUser.phone))) {
                        layer.open({
                            content: '输入的手机号格式有误',
                            btn: '确定'
                        });
                    }
                } else {
                    $scope.editMode = !$scope.editMode;
                    $scope.editButtonText = "设置";
                    $scope.editCance = false;                
                    //保存用户信息
                    $myHttpService.post("api/user/modifyUserInfo", $scope.tempUser, function(data) {
                        $scope.user = angular.copy($scope.tempUser);
                    });
                }
            }
        }

        $scope.cancel = function() {
            $scope.editMode = false;
            $scope.editButtonText = "设置";
            $scope.editCance = false;
            $scope.user = angular.copy(tempUser2);
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
*/
    