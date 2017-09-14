angular
.module('app', [
        'ionic',
        'ion-datetime-picker',
        'ngAnimate'
])
// run  方法初始化全局的数据 , 只对全局作用域起作用  如 $rootScope，局部的$scope不管用
.run(function($rootScope, $ionicPlatform, $ionicPickerI18n, $location, $state) {

    //初始化页面相关的配置信息
    $rootScope.session = {
        user: window.global.config.user // 获取放在Express的session中的用户信息，在index.ejs中已经把user的信息放在了window.global上
    };

    $ionicPlatform.ready(function() {
        /**
         * date time picker选择器国际化
         */
        $ionicPickerI18n.weekdays = ["日", "一", "二", "三", "四", "五", "六"];
        $ionicPickerI18n.months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
        $ionicPickerI18n.ok = "确认";
        $ionicPickerI18n.cancel = "取消";
        $ionicPickerI18n.okClass = "button-positive";
        $ionicPickerI18n.cancelClass = "button-stable";
    });

    // $on 订阅、监听，监听 路由改变开始，相当于路由监听过滤器
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams, fromState) {
        console.log('>>>>>>>>路由监听中>>>>>>>>');
        console.log(toState);
        console.log(toStateParams);
        if((toState.name.indexOf("i.") !=-1 || toState.name.indexOf("search") !=-1 || toState.name.indexOf("myplan") !=-1 ||  toState.name.indexOf("bus_service1") !=-1 || toState.name.indexOf("bus_service_history") !=-1 ) && $rootScope.session.user.userInfo == undefined) {

            event.preventDefault();//取消默认跳转行为
            //截取字符串
            var url = "/" + toState.name.replace('.', '/');
            if(toStateParams) {
                var paramStr = "", i = 0;
                for(var key in toStateParams) {
                    var value = toStateParams[key];
                    i > 0 && value != undefined ? paramStr += "&" : '';
                    value != undefined ? paramStr += key + "=" + value:'';
                    i++;
                }
                if(paramStr != "") {
                    url = encodeURIComponent(url += "?" + paramStr);
                } else {
                    url = encodeURIComponent(url);
                }
            }
            $state.go("auth.login", {url: url}, {location: 'replace'});
        }
    });

})
.config( // 配置
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) { 
        // 跨平台配置
        $ionicConfigProvider.platform.ios.tabs.style('standard'); 
        $ionicConfigProvider.platform.ios.tabs.position('top');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('top');
        $ionicConfigProvider.platform.ios.navBar.alignTitle('center'); 
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');
        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');        
        $ionicConfigProvider.platform.ios.views.transition('ios'); 
        $ionicConfigProvider.platform.android.views.transition('android');

        // 把$stateprovider和$urlrouterprovider路由引擎作为函数参数传入,为应用程序配置路由
        var basePath = "a-bugubus/";

        $urlRouterProvider.otherwise('/search');

        $stateProvider

            /************************ 
             * 
             ****** 登录注册   开始
             * 
             ************************/

            .state('auth', { 
                abstract: true,
                url: '/auth',
                template: '<div ui-view class="fadeInUp animated"></div>'
            })
            .state('auth.login', {
                //跳转到用户登录页面
                url: '/login?url',
                templateUrl: basePath+'tpl/login.html' // 向ui-view中插入HTML模板文件
            })

            /************************ 
             * 
             ****** 登录注册 结束
             * 
             ************************/

            /************************ 
             * 
             ****** 选择地址 开始
             * 
             ************************/
            .state('select_location',{
                url: '/select_location/{params}/{status}',
                templateUrl:basePath+'tpl/select-location.html'
            })
            .state('select_address',{
                url:'/select_address/{params}',
                templateUrl:basePath+'tpl/select-address.html'
            })
            /************************ 
             * 
             ****** 选择地址 结束
             * 
             ************************/


            /************************ 
             * 
             ****** 发起新线路 开始
             * 
             ************************/
            //发起新线路
            .state('create_route',{
                url:'/create_route?openid&java',
                templateUrl:basePath+'tpl/create-route.html'
            })
            //添加新线路成功
            .state('create_route_success',{
                url:'/create_route_success',
                templateUrl:basePath+'tpl/create-route-success.html'
            })
            //带开通班次列表
            .state('schedule_will_open',{
                url:'/schedule_will_open',
                templateUrl:basePath+'tpl/schedule-will-open.html'
            })
            //已开通班次列表
            .state('schedule_opened',{
                url:'/schedule_opened',
                templateUrl:basePath+'tpl/schedule-opened.html'
            })
            
            .state('ticket',{
                //乘车界面主目录，展示用户购买的车票，此目录下需要对用户进行权限过滤
                abstract: true,
                url:'/ticket',
                template: '<div ui-view class="fadeInUp animated"></div>'
            })
            .state('ticket.month',{
                //跳转到月票界面
                url:'/month',
                templateUrl:basePath+'tpl/ticket_month.html'
            })
            .state('ticket.pay',{
                //跳转到月票界面
                url:'/pay?bsid&chargingtype&staddr&edaddr&addprice&addtime',
                templateUrl:basePath+'tpl/schedule-ticket-pay.html'
            })
            .state('ticket.daypay',{
                //跳转到次票界面
                url:'/daypay?bsid&chargingtype',
                templateUrl:basePath+'tpl/schedule-ticketday-pay.html'
            })
            .state('ticket.detail',{
                //跳转到车票详情界面
                url:'/detail?ticketid',
                templateUrl:basePath+'tpl/ticket_detail.html'
            })
            .state('ticket.store',{
                //跳转到月票界面
                url:'/store',
                templateUrl:basePath+'tpl/ticket_store.html'
            })
            //班次主目录
            .state('schedule',{
                abstract: true,
                url:'/schedule',
                template:'<div ui-view class="fadeInUp animated"></div>' // 向ui-view中插入简单的HTML内容
            })
            //班次详情

            //url:'/detail?bsid&mode&chargingtype&staddr&edaddr&stoplist',
            .state('schedule.detail',{
                //我的用户主目录 ids 表示需要在地图上显示的多个班次ID, buyMode表示是否显示购买按钮,0表示显示，1表示不显示
                url:'/detail?stopStationobj',
                templateUrl:basePath+'tpl/schedule-detail.html',
            })
            //班次详情
            .state('schedule.detail2', {
                //我的用户主目录 ids 表示需要在地图上显示的多个班次ID, buyMode表示是否显示购买按钮,0表示显示，1表示不显示
                url: '/detail2?bsid&mode&chargingtype',
                templateUrl: basePath + 'tpl/schedule-detail2.html',
            })
            /************************ 
             * 
             ****** 发起新线路 结束
             * 
             ************************/

            /************************ 
             * 
             ****** 我的账户  开始
             * 
             ************************/

            //我的账户 信息二级页面
            .state('i', {
                abstract: true,
                url: '/i',
                template: '<div ui-view class="fadeInUp animated"></div>',
            })

            //账户信息
            .state('i.user', {
                //我的用户主目录
                url: '/user',
                templateUrl: basePath + 'tpl/i-user.html'
            })

            /************************ 
             * 
             ****** 我的账户 结束
             * 
             ************************/

            .state('signup_success',{
                //报名成功后跳转的页面
                url:'/signup_success?goBsid&backBsid',
                templateUrl:basePath+'tpl/signup-success.html',
            })
            //订单主目录
            .state('order',{
                abstract: true,
                url:'/order',
                template:'<div ui-view class="fadeInUp animated"></div>',
            })
            .state('order.list',{
                //报名成功后跳转的页面
                url:'/list',
                templateUrl:basePath+'tpl/pay-order-list.html',
            })
            .state('ticket.recharge',{
                //报名成功后跳转的页面
                url:'/recharge',
                templateUrl:basePath+'tpl/ticket_recharge.html',
            })
            .state('ticket.recharge2',{
                //跳转到第二充值页面
                url:'/recharge2',
                templateUrl:basePath+'tpl/ticket_recharge_2.html',
            })
            .state('ticket.pay_success',{
                //购票成功
                url:'/pay_success?orderList',
                templateUrl:basePath+'tpl/schedule-ticket-pay-success.html',
            })

            /************************ 
             * 
             ****** 包车服务   开始
             * 
             ************************/
            //包车服务
            .state('bus_service1',{
                //申请包车
                url:'/bus_service1',
                templateUrl:basePath+'tpl/bus_service_1.html',
            })
            //填写信息
            .state('bus_service_mess', {
                url:'/bus_service2?usermessobj',
                templateUrl:basePath+'tpl/bus_service_2.html',
            })
            //用户完整信息
            .state('bus_service_all',{
                url:'/bus_service_all?charterid&caseStatus',
                templateUrl:basePath+'tpl/bus_service_3.html',
            })

            /*提交成功界面*/
            .state('bus_submit_success',{
                url:'/bus_submit_success?charterid&caseStatus',
                templateUrl:basePath+'tpl/bus_service_success.html',
            })

            //包车订单的历史信息
            .state('bus_service_history',{
                url:'/bus_service_history',
                templateUrl:basePath+'tpl/bus_service_history.html'
            })
            //链接跳转的界面
            //.state('bus_href_success',{
            //    url:'/bus_href_success',
            //    templateUrl:basePath+'tpl/bus_href_success.html'
            //})
            //跳转支付界面
            .state('bus_service_pay',{
                url:'/bus_service_pay?totalfee&charterid',
                templateUrl:basePath+'tpl/bus_service_pay.html'
            })

            /************************ 
             * 
             ****** 包车服务   结束
             * 
             ************************/

            //景观主目录
            .state('sight_recommend_list',{
                url:'/sight_recommend_list',
                templateUrl:basePath+'tpl/sight_recommend_list.html'
            })

            /*详情列表*/
            .state('sight_details_list',{
                url:'/sight_details_list',
                templateUrl:basePath+'tpl/sight_details_list.html'
            })
            /*详情页*/
            .state('sight_details_page',{
                url:'/sight_details_page',
                templateUrl:basePath+'tpl/sight_details_page.html'
            })
            /*景区直通车预定*/
            .state('sight_pay',{
                url:'/sight_pay',
                templateUrl:basePath+'tpl/sight_pay.html'
            })
            /*城市选择*/
            .state('select_city',{
                url:'/select_city',
                templateUrl:basePath+'tpl/select_city.html'
            })

            /***********************************
             * 
             ****** 景区直通车 、我的行程 开始
             * 
             ***********************************/

            /*景区直通车：搜索、主页*/
            .state('search', {
                url: '/search',
                templateUrl: basePath + 'tpl/jqztc_search.html'
            })

            /*景区直通车：路线、点评、须知*/
            .state('tabs', {
                url: '/tabs',
                cache: true,
                params: {
                    data: null
                },
                templateUrl: basePath + 'tpl/jqztc_tab1.html'
            })

            /*景区直通车测试页面*/
            .state('test', {
                url: '/test',
                templateUrl: basePath + 'tpl/jqztc_test.html'
            })

            /*景区直通车：订单确认、支付*/
            .state('order_confirm_pay', {
                url: '/order_confirm_pay',
                params: {
                    data: null
                },
                templateUrl: basePath + 'tpl/jqztc_order_confirm_pay.html'
            })

            /*景区直通车：订单详情、退款*/
            .state('order_detail_refund', {
                url: '/order_detail_refund',
                params: {
                    data: null
                },
                templateUrl: basePath + 'tpl/jqztc_order_detail_refund.html'
            })

            /*景区直通车：订单验证、评论*/
            .state('order_check_comment', {
                url: '/order_check_comment',
                params: {
                    data: null,
                    isCommented: null,
                    isCommentedText: null,
                    isCommentedScore: null
                },
                templateUrl: basePath + 'tpl/jqztc_order_check_comment.html'
            })

            /*景区直通车：订单退款中*/
            .state('order_refunding', {
                url: '/order_refunding',
                params: {
                    data: null
                },
                templateUrl: basePath + 'tpl/jqztc_order_refunding.html'
            })

            /*景区直通车：我的行程*/
            .state('myplan', {
                url: '/myplan',
                templateUrl: basePath + 'tpl/jqztc_myplan.html'
            })

            /*景区直通车：车辆位置地图1*/
            // .state('bus_position', {
            //     url: '/bus_position',
            //     templateUrl: basePath + 'tpl/jqztc_bus_position.html'
            // })

            /*景区直通车：车票详情*/
            .state('ticket_detail', {
                abstract: true,
                url: '/ticket_detail',
                template: '<div ui-view class="fadeInUp animated"></div>'
            })

            /*景区直通车：车票详情*/
            .state('ticket_detail.ticketdetail', {
                url: '/ticketdetail', 
                cache: true,
                params: {
                    data: null
                },
                templateUrl: basePath + 'tpl/jqztc_ticket_detail.html'
            })

            /*景区直通车：车辆位置地图2*/
            .state('ticket_detail.bus_position', {
                url: '/bus_position', 
                params: {
                    data: null
                },
                templateUrl: basePath + 'tpl/jqztc_bus_position.html'
            })

            /***********************************
             * 
             ****** 景区直通车 、我的行程 结束
             * 
             ***********************************/


    }
)

