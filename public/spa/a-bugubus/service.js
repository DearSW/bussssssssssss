app

// @地理定位服务
.service('$myLocationService', function($ionicLoading) {

    var el = document.createElement('div');
    el.id = "map" + new Date().getTime();
    el.style = "width:0;height:0";
    document.body.appendChild(el)
    var map, geolocation, geocoder;

    //加载地图，调用浏览器定位服务
    if(  typeof AMap  != "undefined" && AMap.Map instanceof Function ) {

        map = new AMap.Map(el.id, {
            resizeEnable: true
        });
        geocoder = new AMap.Geocoder({
            radius: 1000,
            city:'027',
            extensions: "all"
        });

        this.getCurrentPosition = function(callback) {
            //$ionicLoading.show();
            /**
             * 获取用户的当前位置
             */
            map.plugin('AMap.Geolocation', function() {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    convert:true
                });
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', function(data) {
                    geocoder.getAddress(data.position, function(status, result) {
                        //$ionicLoading.hide();
                        // document.body.removeChild(el);
                        if (status === 'complete' && result.info === 'OK') {
                            if(result.regeocode.pois && result.regeocode.pois.length > 0) {
                                callback(result.regeocode.pois);
                            } else {
                                callback([]);
                            }
                        }
                    });
                });//返回定位信息
                AMap.event.addListener(geolocation, 'error', function(data) {
                    alert("您禁止了授权定位信息,若想继续操作请输入地址信息");
                });
            });
        };
        /**
         *根据经纬度获取附近的兴趣点列表
        */
        this.getPoisByLngLat = function(lngLat, callback) {
            geocoder.getAddress(lngLat, function(status, result) {
                // document.body.removeChild(el);
                if (status === 'complete' && result.info === 'OK') {
                    if(result.regeocode.pois && result.regeocode.pois.length > 0) {
                        callback(result.regeocode.pois);
                    } else {
                        callback([]);
                    }
                }
            });
        }
        /**
         * 根据关键词返回兴趣点列表
         * @param address 关键词
         * @param callback
         */
        this.AddressByKeyword = function(keyword, callback) {
            geocoder.getLocation(keyword, function(status, result) {
                console.log(status);
                if (status === 'complete' && result.info === 'OK') {
                    console.log(result);
                    if(result.geocodes.pois && result.regeocode.pois.length > 0) {
                        //callback(result.regeocode.pois);
                    } else {
                        //callback([]);
                    }
                }
            });
        }
        //{city:"武汉",datatype:"poi"}
        this.getPoisByKeyword = function(keyword, callback) {
            AMap.service(['AMap.Autocomplete'], function() {
                var auto = new AMap.Autocomplete({city:"武汉",datatype:"all"});
                if(keyword.length > 0) {
                    auto.search(keyword,function(status,result) {
                        if(status == "complete") {
                            callback(result.tips);
                        } else if(status == "no_data") {
                            callback([]);
                        }
                    });
                }
            })
        }

    } else {
        console.log("AMap未定义");
    }
    
})

// @封装HTTP请求服务
.service('$myHttpService', function($http, $ionicLoading) {

    // @带遮罩层的POST请求
    this.post = function(url, data, success, error) {

        // $ionicLoading，用一个覆盖层表示当前处于活动状态，来阻止用户的交互动作。
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner><div style="font-weight: bold;font-size: 14px;">加载中</div>',
            noBackdrop: true
        });

        $http.post(url, data).success(function(data) {
            window.setTimeout(function() {
                $ionicLoading.hide();
            }, 250);
            if(data.code == 0) {
                success(data.data);
            } else {
                var errorMsg = "";
                if(data.data.msg) {
                    errorMsg = data.data.msg;
                } else {
                    errorMsg = data.data;
                }
                if(layer) {
                    layer.alert(errorMsg);
                } else {
                    alert(errorMsg);
                }
                if(error) {
                    error(data.data);
                }
            }
            //$scope.dt = $scope.driver.birthday;
        }).error(function(e) {
            $ionicLoading.hide();
            if(layer) {
                layer.alert(e.message);
            } else {
                alert(e.message);
            }
            if(error) {
                error(e);
            }
        });

    };

    // @不带遮罩层的POST请求
    this.postNoLoad = function(url, data, success, error) {

        $http.post(url, data).success(function(data) {
            if(data.code == 0) {
                success(data.data);
            } else {
                var errorMsg = "";
                if(data.data.msg) {
                    errorMsg = data.data.msg;
                } else {
                    errorMsg = data.data;
                }
                if(layer) {
                    layer.alert(errorMsg);
                } else {
                    alert(errorMsg);
                }
                if(error) {
                    error(data.data);
                }
            }
            //$scope.dt = $scope.driver.birthday;
        }).error(function(e) {
            if(layer) {
                layer.alert(e.message);
            } else {
                alert(e.message);
            }
            if(error) {
                error(e);
            }
        });

    };

    // @带遮罩层的GET请求
    this.get = function(url, data, success, error) {

        $ionicLoading.show({
            template: '<ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>',
            noBackdrop: true
        });

        $http.get(url, data).success(function(data) {
            $ionicLoading.hide();
            if(data.code == 0) {
                success(data.data);
            } else {
                var errorMsg = "";
                if(data.data.msg) {
                    errorMsg = data.data.msg;
                } else {
                    errorMsg = data.data;
                }
                if(layer) {
                    layer.alert(errorMsg);
                } else {
                    alert(errorMsg);
                }
                if(error) {
                    error(data.data);
                }
            }
            //$scope.dt = $scope.driver.birthday;
        }).error(function(e) {
            $ionicLoading.hide();
            if(layer) {
                layer.alert(e.message);
            } else {
                alert(e.message);
            }
            if(error) {
                error(e);
            }
        });

    }

})

// @城市服务
.service('$selectCity', function() {

    this.getCity = function(callback) {
        var citysearch = new AMap.CitySearch();
        citysearch.getLocalCity(function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                if (result && result.city ) {
                    callback(result.city);
                } else {
                    callback([]);
                }
            }
        })
    }
    
});


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
