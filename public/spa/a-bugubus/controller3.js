/**
 * Created by 滕召维 
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

/* 浮点数运算对象 */
var floatObj = function() {
    /*
     * 判断obj是否为一个整数
     */
    function isInteger(obj) {
        return Math.floor(obj) === obj
    }
    /*
     * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
     * @param floatNum {number} 小数
     * @return {object}
     *   {times:100, num: 314}
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
     * 核心方法，实现加减乘除运算，确保不丢失精度
     * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
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
    // 加减乘除的四个接口
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
    // exports
    return {
        add: add,
        subtract: subtract,
        multiply: multiply,
        divide: divide
    }
}();

app
    /* 城市选择控制器 %%%%%%%% */
    .controller('City_select', function($rootScope, $scope, $state, $timeout, $interval, $myLocationService, $myHttpService, $ionicSlideBoxDelegate, $ionicActionSheet, $selectCity, $filter) {
        
        // 确保推荐在未关闭页面之前只请求一次 优化
        if(sessionStorage.getItem("recommendImgCount") == null) {
            var recommendImgCount = 1;
            $rootScope.recommendProducts2 = [];
            var slideImageTimer = null;
        } else {
            var recommendImgCount = sessionStorage.getItem("recommendImgCount");
        }

        $scope.showDefaultImg = true;
        $scope.dataContainer = {
            input: "", // 用户输入
            btnDisabled: true // 控制搜索按钮状态
        }
        
        if(recommendImgCount == 1) {
            sessionStorage.setItem("recommendImgCount", 2);
            // 请求获取推荐路线数据
            $myHttpService.postNoLoad('api/product/queryRecommendProductList', {}, function(data) {
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
            if($rootScope.recommendProducts2 instanceof Array) { // 加个判断，在调试时容易出错，请求不到数据，导致length属性不存在
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
        }, 3000);

        $scope.$on("$destroy", function() {
            $interval.cancel(slideImageTimer);
        });
        //当DOM元素从页面中被移除时，AngularJS将会在scope中触发$destory事件。这让我们可以有机会来cancel任何潜在的定时器
        $scope.$on('$ionicView.beforeLeave', function(event, data) {
            clearTimeout(slideImageTimer);
        });

        // 推荐路线数据详情，点击图片进行跳转到tabs页面
        $scope.recommendProductsDetail = function(item, i) {
            var data = {
                productid: item.productid
            };
            $state.go('tabs', {data: JSON.stringify(data)}, {reload: true});
        };

        // 所在城市
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
        
        // 查询城市区域
        // 对象数组去重函数
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

        // 时间
        if(sessionStorage.getItem('jqztc_search_time') != null) {
            var tempTime = sessionStorage.getItem('jqztc_search_time');
        } else {
            var tempTime = new Date();
        }
        $scope.goDate = {
            title: '选择日期',
            time: tempTime
        };

        // 进行预售期60天的时间判断
        $scope.detectionDate = function() { 
            var compareTime = new Date().getTime() + (60 * 86400000); // ms
            var selectTime = $scope.goDate.time.getTime();
            if(selectTime > compareTime) {
                layer.open({
                    content: '不在预售范围内，预售期仅为60天，请重新选择',
                    btn: '确定'
                });
                $scope.goDate.time = new Date();
            }
        };

        // 当所有输入完成，开启搜索按钮
        $scope.btnCheck = function() {
            if($scope.dataContainer.input) {
                $scope.dataContainer.btnDisabled = false;
            } else {
                $scope.dataContainer.btnDisabled = true;
            }
        }

        // 点击搜索的同时，需要把数据传递到下一个tabs页面
        $scope.goTabs = function() {
            // 封装参数
            var data = {
                city: $scope.cityssss, // 城市
                input: $scope.dataContainer.input.trim(), // 用户输入
                date: $filter('date')($scope.goDate.time, 'yyyy-MM-dd') // 时间
            };

            sessionStorage.setItem('jqztc_search_time', data.date);
            sessionStorage.setItem('search_city', $scope.cityssss);
            sessionStorage.setItem('search_input', $scope.dataContainer.input.trim());

            $state.go('tabs', {data: JSON.stringify(data)}, {reload: true});
        }
    })

    /* 路线、点评、须知 */
    .controller('Tabs', function($rootScope, $scope, $state, $timeout,  $myHttpService, $myLocationService) {

        $scope.ticketsInfo = []; // 车票数据
        $scope.commentsInfo = []; // 评论数据
        $scope.noticeInfo = ''; // 须知数据

        // Mock数据 接口 api/product/queryProductList
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

        // 接收jqztc_search.html页面传递过来的参数，并解析
        var paramsData = JSON.parse($state.params.data);

        if(paramsData != null) {
            if(paramsData.hasOwnProperty('productid')) {

                sessionStorage.setItem('questUrlType', '0');
                sessionStorage.setItem('tabsParamsDataProductid', paramsData.productid);

                console.log("1111");
                var requestData = {
                    productid: paramsData.productid
                };
                $myHttpService.post('api/product/queryRecommendProduct', requestData, function(data) {
                    console.log(data);
                    $scope.ticketsInfo = data.products;
                    if(data.products.length != 0) {
                        $scope.noticeInfo = data.products[0].productinfo;                        
                    } else {
                        layer.open({
                            content: '当前选择的推荐主题路线，今日已售完',
                            btn: '确定'
                        });
                    }
                }, errorFn);
                
            } else {

                sessionStorage.setItem('questUrlType', '1');
                sessionStorage.setItem('tabsParamsDataInput', paramsData.input);
                sessionStorage.setItem('tabsParamsDataDate', paramsData.date);
                sessionStorage.setItem('tabsParamsDataCity', paramsData.city);

                var requestData = {
                    keyword: paramsData.input,
                    departDate: paramsData.date,
                    region: paramsData.city
                };

                $myHttpService.post('api/product/queryProductList', requestData, function(data){
                    console.log(data);
                    $scope.ticketsInfo = data.products;
                    if(data.products.length != 0) {
                        $scope.noticeInfo = data.products[0].productinfo;                    
                    } else {
                        layer.open({
                            content: '当前班次，今日已售完，请选择往后日期',
                            btn: '确定'
                        });
                    }
                }, errorFn);

            }
        } else {

            if(sessionStorage.getItem('questUrlType') == '0') {
                var requestData = {
                    productid: sessionStorage.getItem('tabsParamsDataProductid')
                };
                $myHttpService.post('api/product/queryRecommendProduct', requestData, function(data){
                    console.log(data);
                    $scope.ticketsInfo = data.products;
                    if(data.products.length != 0) {
                        $scope.noticeInfo = data.products[0].productinfo;                    
                    } else {
                        layer.open({
                            content: '当前选择的推荐主题路线，今日已售完',
                            btn: '确定'
                        });
                    }                 
                }, errorFn);
            } else if(sessionStorage.getItem('questUrlType') == '1') {
                var requestData = {
                    keyword: sessionStorage.getItem('tabsParamsDataInput'),
                    departDate: sessionStorage.getItem('tabsParamsDataDate'),
                    region: sessionStorage.getItem('tabsParamsDataCity')
                };
                console.log(requestData);

                $myHttpService.post('api/product/queryProductList', requestData, function(data){
                    console.log(data);
                    $scope.ticketsInfo = data.products;
                    if(data.products.length != 0) {
                        $scope.noticeInfo = data.products[0].productinfo;                    
                    } else {
                        layer.open({
                            content: '当前班次，今日已售完，请选择往后日期',
                            btn: '确定'
                        });
                    }                  
                }, errorFn);

            } else {
                $state.go('search');
            }
        }

        // 购买按钮函数 传递参数
        $scope.purchase = function(item, i) {
            console.log("购买按钮传递的参数：");
            console.log(item);
            $state.go('order_confirm_pay', {data: JSON.stringify(item)});
        };

        var check_click_count = 0; // 检测tab项的点击次数
        var check_click_count2 = 0;

        // 路线信息
        $scope.tab_road = function() {
            if(check_click_count < 1) {
                console.log('road');
            }
            check_click_count++;
        }

        // 评论信息
        $scope.tab_comment = function() {

            if(check_click_count2 < 1) {
                console.log('comment');
            }
            check_click_count2++;
        }

        // 须知信息
        $scope.tab_notice = function() {
            console.log('notice');
        }

        // 路线信息下拉刷新
        $scope.doRefreshRoad = function() {
            if(paramsData != null) {

                if(sessionStorage.getItem('questUrlType') == '0') {

                    console.log("1111");
                    var requestData = {
                        productid: paramsData.productid
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
                        keyword: paramsData.input,
                        departDate: paramsData.date,
                        region: paramsData.city
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
                        keyword: sessionStorage.getItem('tabsParamsDataInput'),
                        departDate: sessionStorage.getItem('tabsParamsDataDate'),
                        region: sessionStorage.getItem('tabsParamsDataCity')
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

        $scope.pageCount = 1;
        // 评论下拉刷新
        $scope.isNoComment = false;
        $scope.doRefreshComment = function() {
            if($scope.ticketsInfo.length == 0) {
                $scope.isNoComment = true;
                $scope.$broadcast('scroll.refreshComplete');                
                return;
            }
            var viewaddress = $scope.ticketsInfo[0].viewaddress;
            $scope.pageCount = 1;
            $myHttpService.postNoLoad('api/product/queryProductHieList', {
                viewaddress: viewaddress,
                offset: '0',
                pagesize: '10'
            }, function(data) {
                console.log("评论刷新");
                $scope.commentsInfo = data.viewOrders;
                console.log(data);
                $scope.$broadcast('scroll.refreshComplete');
                if($scope.commentsInfo.length == 0) {
                    $scope.isNoComment = true;
                } else {
                    layer.open({
                        content: '刷新成功',
                        skin: 'msg',
                        time: 1
                    });
                }
            });
        };

        // 评论上拉加载更多
        $scope.hasmore = true;
        var run = false;
        $scope.loadMoreComment = function() {

            if($scope.ticketsInfo.length == 0) {
                $scope.isNoComment = true;
                return;
            }
            var viewaddress = $scope.ticketsInfo[0].viewaddress;
            var offset = ($scope.pageCount - 1) * 10;
            var requestData = {
                viewaddress: viewaddress,
                offset: offset,
                pagesize: '10'
            };

            if(!run) {
                run = true;
                $myHttpService.post('api/product/queryProductHieList', requestData, function(data) {
                    if (data.viewOrders.length < 10) { 
                        $scope.hasmore = false;//这里判断是否还能获取到数据，如果没有获取数据，则不再触发加载事件 
                    } 
                    $scope.pageCount++; 
                    console.log("计数： " + $scope.pageCount);
                    run = false;
                    console.log("评论加载");
                    $scope.commentsInfo = $scope.commentsInfo.concat(data.viewOrders);
                    console.log($scope.commentsInfo);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if($scope.commentsInfo.length == 0) {
                        $scope.isNoComment = true;
                    }
                });
            }
        }
        // 评论的星星 调用了Star的指令，这里相关是配置的信息
        $scope.max = 5; // 星星数量
        $scope.readonly = true; // 是否可读
        $scope.onHover = function(val){};
        $scope.onLeave = function(){};

    })

    /* 车票订单 确认、支付 */
    .controller('order_confirm_pay', function($rootScope, $filter, $scope, $state, $myHttpService, $interval, $ionicModal) {

        if(JSON.parse($state.params.data) == null) { // 访问此页面时，如果没有传递过来参数那么将直接倒退2个页面
                window.history.go(-2); // 倒退到第一个页面，此动作不可逆
                return;
        } else { // 访问此页面时，有参数的情况，正常流程

            $scope.dataContainer = { // 数据容器
                phone: "",
                verificationCode: "",
                coupon: false,
                count: 1
            };

            $rootScope.customerPhone = "18302505304"; // 客服电话

            var paramsData = JSON.parse($state.params.data); // 解析传递过来的参数
            $scope.ticketInfo = paramsData; // 全部车票信息
            console.log("ZW：传递到 order_confirm_pay 页面的全部车票信息");
            console.log($scope.ticketInfo);

            $scope.leftTickets = $scope.ticketInfo.leftTickets; // 余票，用户可购票数不能超过余票

            $scope.checkPhoneState = false; // 检测电话号码是否正确
            $scope.verificationCodeBtnDisabled = true; // 控制获取验证码按钮的状态
            $scope.verificationCodeInputDisabled = true; // 控制验证码输入框的状态
            $scope.payBtnDisabled = true; // 控制确认支付按钮的状态
            $scope.countdownTxtShow = false; // 控制倒计时文本的状态

            $scope.couponBtnState = false; // 控制优惠券的状态
            $scope.couponTxTShow = false; // 控制优惠券文本的状态

            // 函数 验证手机号码
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

            // 验证码倒计时 处理流程
            var defaultCountdown = 60; // 默认60秒的倒计时时间
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
            $scope.countdown = function() {
                $scope.verificationCodeBtnDisabled = true;
                console.log("电话号码：" + $scope.dataContainer.phone);
                $scope.fight();
                // 进行倒计时的同时，还需要向服务器发送获一个取验证码的请求
                var departDate = $filter('date')($scope.ticketInfo.departdate, 'yyyy-MM-dd');
                var bsids = $scope.ticketInfo.golinename + '&' + departDate + '&' + $scope.ticketInfo.departtime
                var checkcode = parseInt($scope.dataContainer.phone) % parseInt($scope.dataContainer.phone.substring(1,4)) ;
                var requestData = {
                    phone: $scope.dataContainer.phone,
                    servicename: 'UserBuyViewTicket',
                    checkcode: checkcode.toString(),
                    bsids: bsids
                };
                console.log("验证码请求参数打印：");
                console.log(requestData);
                $myHttpService.postNoLoad('api/utils/sendCheckAuthcode', requestData, function(data){
                    console.log(data);
                });
            }
        };
        
        // 票价计算
        $scope.floatObj = floatObj; // 票价处理的运算对象
        if($scope.ticketInfo.haveTicket == 1) { // 有门票时
            console.log("有车票时");
            $scope.scenicSpotTicketPrice = $scope.ticketInfo.viewPrices[0].couponPrice; // 指定门票数组的第一个为默认门票价
            $scope.scenicSpotTicketPriceID = $scope.ticketInfo.viewPrices[0].viewPriceId; // 同时找出相应的默认门票的ID
            console.log($scope.scenicSpotTicketPriceID);
            // $scope.price = $scope.ticketInfo.productPrice + $scope.scenicSpotTicketPrice;
            // 只要是涉及小数的运算，都必须使用 floatObj运算对象来保证正确的计算结果！
            $scope.price = $scope.floatObj.add($scope.ticketInfo.productPrice, $scope.scenicSpotTicketPrice, 2); // 全票价格，车票 + 门票
            $scope.price2 = $scope.ticketInfo.productPrice; // 车票
            $scope.price3 = $scope.scenicSpotTicketPrice; // 门票

            $scope.sumPrice = $scope.price; // 全票总价 车票 + 门票
            console.log("全票总价");
            console.log($scope.sumPrice);

            $scope.sumPrice2 = $scope.price2; // 车票总价
            console.log("车票总价");
            console.log($scope.sumPrice2);        

            $scope.sumPrice3 = $scope.price3; // 门票总价
            console.log("门票总价");
            console.log($scope.sumPrice3);

        } else { // 没有门票时
            console.log("无车票时");

            $scope.price  = $scope.ticketInfo.productPrice; // 全票价格，车票
            $scope.sumPrice = $scope.price; // 全票总价，车票
            console.log("全票总价");
            console.log($scope.sumPrice);

        }
        
        // 票数增加 函数
        $scope.incr = function() {
            if( this.dataContainer.count < $scope.leftTickets ) {
                this.dataContainer.count += 1;
                $scope.sumPrice =  $scope.floatObj.multiply($scope.price, $scope.dataContainer.count, 2); // 全票总价
                if($scope.ticketInfo.haveTicket == 1) {
                    $scope.sumPrice2 = $scope.floatObj.multiply($scope.price2, $scope.dataContainer.count, 2);  // 车票总价                                    
                    $scope.sumPrice3 = $scope.floatObj.multiply($scope.price3, $scope.dataContainer.count, 2);  // 门票总价
                }
            } else {
                layer.open({
                    content: '当前班次余票为: ' + $scope.leftTickets,
                    time: 5
                });
            }
        }
        // 票数减少 函数
        $scope.decr = function() {
            if(this.dataContainer.count > 1) { //只有当数量大于一的时候才减
                this.dataContainer.count -= 1;
                $scope.sumPrice = $scope.floatObj.multiply($scope.price, $scope.dataContainer.count, 2); // 全票总价
                if($scope.ticketInfo.haveTicket == 1) {
                    $scope.sumPrice2 = $scope.floatObj.multiply($scope.price2, $scope.dataContainer.count, 2);  // 车票总价                    
                    $scope.sumPrice3 = $scope.floatObj.multiply($scope.price3, $scope.dataContainer.count, 2);  // 门票总价
                }
            }
        }

        // 优惠券的检测 函数
        $scope.oldTicketPriceShow = true;
        $scope.newTicketPriceShow = false;
        $scope.useCoupon = false;
        var couponCount = 1;
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

        // 确认支付按钮的状态监控 函数
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

        // 车票支付 函数
        $scope.recharge = function() {

            var departDate = $filter('date')($scope.ticketInfo.departdate, 'yyyy-MM-dd');

            // 参数处理 api/product/buyProductTicket 接口
            if($scope.ticketInfo.productType == '1') { // 往返类型

                if($scope.ticketInfo.haveTicket == 0) { // 没有门票时

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

                } else { // 有门票时

                    var data2 = { 
                        userid: $rootScope.session.user.userInfo.userid,
                        openid: $rootScope.session.user.userInfo.openid,
                        gobdid: $scope.ticketInfo.gobdid,
                        couponuse: $scope.couponBtnState,
                        departDate: departDate,
                        count: $scope.dataContainer.count,
                        authcode: $scope.dataContainer.verificationCode,
                        backbdid: $scope.ticketInfo.backbdid,
                        viewPriceId: $scope.scenicSpotTicketPriceID
                    };

                }
                    
            } else { // 单程类型
                if($scope.ticketInfo.haveTicket == 0) { // 没有门票时

                    var data2 = {
                        userid: $rootScope.session.user.userInfo.userid,
                        openid: $rootScope.session.user.userInfo.openid,
                        gobdid: $scope.ticketInfo.gobdid,
                        couponuse: $scope.couponBtnState,
                        departDate: departDate,
                        count: $scope.dataContainer.count,
                        authcode: $scope.dataContainer.verificationCode
                    };

                } else { // 有门票时
                    var data2 = {
                        userid: $rootScope.session.user.userInfo.userid,
                        openid: $rootScope.session.user.userInfo.openid,
                        gobdid: $scope.ticketInfo.gobdid,
                        couponuse: $scope.couponBtnState,
                        departDate: departDate,
                        count: $scope.dataContainer.count,
                        authcode: $scope.dataContainer.verificationCode,
                        viewPriceId: $scope.scenicSpotTicketPriceID
                    };
                }
                    
            }
            console.log("ZW：传递到order_detail_refund的参数");
            console.log(data2); // 即是 api/product/buyProductTicket 接口的参数，也是传递到 order_detail_refund 的参数
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

        // 门票处理 函数
        if($scope.ticketInfo.haveTicket == 1) { // 有门票时

            $scope.modal = $ionicModal.fromTemplate('<ion-modal-view>'+
                '	  '+
                '        <ion-header-bar class="bar bar-header bar-light">'+
                '		'+
                // '		  <button class="button  button-balanced" ng-click="modal.hide()">取消</button>'+
                '          <h1 class="title"> </h1>'+
                '          <button class="button button-balanced" ng-click="chooseScenicSpotTicket()">确定</button>'+
                '		  '+
                '        </ion-header-bar>'+
                '		'+
                '        <ion-content class="padding">'+
                '		    <p style="text-align:center;font-size: 18px;"><span>{{ticketInfo.viewName}}</span></p>	'+
                '			<ion-radio style="padding: 15px 10px;border: none;border-bottom-style: solid;border-bottom-width: 1px;border-bottom-color: #ddd;border-top-width: 1px;border-top-color: #ddd;border-top-style: solid;" ng-repeat="item in scenicSpotTicketArr"'+
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

            $scope.$on('$destroy', function() {
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
            $rootScope.hasmore2 = true;
            $scope.pageCount = 1; // 保存的记录页面参数，用于上拉加载分页的记录
            $scope.hasmore = true;
            
        }
        var run = false;
        $scope.ticketsInfoIsEmpty = false; // 当没有任何票信息时显现

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
        if($rootScope.hasmore2) {
            $scope.loadMoreTicket = function() {
                console.log("loadMoreTicket执行了");
                var offset = ($scope.pageCount - 1) * 10;
                var requestData = {
                    userid: $rootScope.session.user.userInfo.userid,
                    offset: offset,
                    pagesize: 10,
                };
                if(!run) {
                    run = true;
                    $myHttpService.postNoLoad('api/product/queryUserProductTicketList', requestData, function(data) {
                        if (data.userViewList.length < 10) { 
                            $scope.hasmore = false; // 这里判断是否还能获取到数据，如果没有获取数据，则不再触发加载事件 
                            $rootScope.hasmore2 = false;
                        } else {
                            $scope.pageCount++; // 计数
                        }
                        run = false;
                        $rootScope.ticketsInfo = $rootScope.ticketsInfo.concat(data.userViewList); // 报错
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
        }
        
        // 车票下拉刷新函数
        $scope.doRefreshTicket = function() {
            var requestData = {
                userid: $rootScope.session.user.userInfo.userid,
                offset: 0,
                pagesize: 10,
            };
            $scope.pageCount = 2; // 车票下拉刷新后，重置上拉加载更多函数的基本配置
            $rootScope.hasmore2 = true;
            $myHttpService.postNoLoad('api/product/queryUserProductTicketList', requestData, function(data) {
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
        
        // 点击未使用车票进入 车票详情界面
        $scope.unusedTicketToDetail = function(item, i) {
            $state.go('ticket_detail.ticketdetail', {data: JSON.stringify(item)}, {reload: false});
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
    .controller('test', function($rootScope, $scope, $state, $timeout, $myLocationService, $myHttpService, $ionicLoading, $ionicScrollDelegate, $ionicActionSheet, $selectCity, $filter) {

        // $scope.ssss = function() {
        //     $ionicLoading.show({
        //         template: '<ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>',
        //         noBackdrop: true
        //     });
        // }

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


        $scope.sumArr = [
            {
                type: 'single',
                msg: '单程票，贵阳-武汉'
            },
            {
                type: 'single',
                msg: '单程票，贵阳-杭州'
            },
            {
                type: 'single',
                msg: '单程票，贵阳-北京'
            },
            {
                type: 'double',
                msg: '往返票，贵阳-拉萨'
            },
            {
                type: 'double',
                msg: '往返票，贵阳-新疆'
            },
            {
                type: 'double',
                msg: '往返票，贵阳-墨脱'
            }
        ];

        $scope.cccccccc = function() {
            layer.open({
                content: '您确定要刷新一下本页面吗？',
                btn: ['刷新', '不要'],
                shadeClose: false,
                yes: function(index){
                    location.reload();
                    layer.close(index);
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

                for(var index in $scope.stations) {
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
    