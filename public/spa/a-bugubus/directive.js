//=====
// input自动聚焦指令，进入页面时会自动聚焦，触摸其他元素时自动失焦
// 使用方式 <input type="text" focus-auto>
app.directive('focusAuto', function($document) {
    return {
        link: function(scope, element, attrs) {
            element[0].id = "J_focus_auto_"+new Date().getTime();
            document.body.addEventListener('touchstart', function(e) {
                if(e.target.id != element[0].id) {
                    element[0].blur();
                }
            });
            element[0].focus();
        }
    }
});

//=====
// 生成条形码指令
// 使用方式 <canvas barcode ng-model='xxx'></canvas>
app.directive('barcode', function($document) {
    return {
        link: function(scope, element, attrs) {
            var id = "J_barcode" + new Date().getTime();
            element[0].id = id;
            JsBarcode("#" + id, scope.$parent.$eval(attrs.ngModel));
            scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                JsBarcode("#" + id, newValue); //重新绘图
            })
        }
    }
});

// =====
//过滤器，字面量转义输出
app.filter('transfer', function() {
    
    return function(input, fieldName) {

        if(fieldName == undefined) {
            alert("变量名称不能为空");
        } else {

            //定义字面量
            var dict  = {
                sex:{
                    "0":"男",
                    "1":"女"
                },
                ticketStatus:{
                    "0":"车票已过期",
                    "1":"车票有效"
                }
            };
            return dict[fieldName][input];
        }

    }
});

/*滑动*/
app.directive('touch', function() {
    return {
        //startX触摸开始的坐标，moveX滑动的距离,
        link: function($scope, element, attr) {
            var startX,
                moveX;
            var dom = element[0];
            dom.addEventListener('touchstart', function(e) {
                if(dom) {
                    startX = e.targetTouches[0].pageX;
                }

            });
            dom.addEventListener('touchmove',function(e){
                var targetMarginLeft = dom.style.marginLeft.replace('px','');
                moveX = e.changedTouches[0].pageX;
                if(targetMarginLeft>=0&&(startX-moveX)<0){

                }else if(targetMarginLeft>=-80&&(startX-moveX)<0){
                    dom.style.marginLeft=-(startX-moveX)-80+'px';
                }else if(targetMarginLeft>-80){
                    if((startX-moveX)>=80){
                        dom.style.marginLeft=-80+'px';
                    }else{
                        dom.style.marginLeft=-(startX-moveX)+'px';
                    }
                }
            });
            dom.addEventListener('touchend',function(e){
                var endX = e.changedTouches[0].pageX;
                if(startX-endX>30){
                    var interval = setInterval(function(){

                        var targetMarginLeft = dom.style.marginLeft.replace('px','');

                        if(targetMarginLeft>-80){
                            var temp = --targetMarginLeft;
                            dom.style.marginLeft = --temp+'px';
                        }else{
                            clearInterval(interval);
                            dom.style.marginLeft = -80 +'px';
                        }
                    },2)
                }else{
                    var interval = setInterval(function(){
                        var targetMarginLeft = dom.style.marginLeft.replace('px','');
                        if(targetMarginLeft<0){
                            var temp = ++targetMarginLeft;
                            dom.style.marginLeft = ++temp+'px';
                        }else{
                            clearInterval(interval);
                            dom.style.marginLeft = -0 +'px';
                        }
                    },2)
                }
            });

        }
    }
});

/*选星星*/
app.directive('xinxin', function() {
    return{
        link: function($scope, element, attr) {
            var startX;
            var moveX;
            var dom = element[0];
                dom.addEventListener('touchstart', function(e) {
                    if(dom) {
                        startX = e.targetTouches[0].pageX;

                    }
                });

        }
    }
});

//=====
// 选择城市指令
app.directive('selectcity', function($window) {
    return{
        restrict: 'AE',
        template: '<div  style="position: absolute;z-index: 4;top: 44px;left: -1px">' +
        '<i style="position: absolute;left:20px;top:-10px;width: 0;height: 0;border-left: 10px solid transparent;border-right: 10px solid transparent;border-bottom: 14px solid #ffffff;"></i>' +
        '<div style="background-color: #ffffff;border-radius: 4px;min-width: 60px;">贵阳市</div>' +
        '</div>',
        //{{city.cityname}}
        replace: true,
        link: function($scope, element, attr) {
            $scope.city = {
                cityname:'贵州市'
            };
            var dom = element[0];
            dom.addEventListener('touchend', function(e) {
                if(dom) {
                    if($scope.city.cityname != $scope.positionCity) {
                        $scope.check = true;
                        $scope.positionCity = $scope.city.cityname;
                        //$window.localStorage.setItem('cityKEY',$scope.city.cityname);
                    } else {
                        $scope.check = true;
                        //$window.localStorage.setItem('cityKEY',$scope.city.cityname);
                    }
                }
            })

        }
    }
});

//=====
// 生成条二维码指令
// 使用方式 <qrcode infostr='xxx'></qrcode>
app.directive('qrcode', function() {

    // 指令的推荐写法，var directive = {}; return directive; 能避免很多错误
    var directive = {
        restrict: 'EA',
        replace: true, // 为true，被挂载的元素会被下面的template替换掉
        scope: {
            infostr: '@' // 属性必须要小写
        },
        template: '<div id="qrcode"></div>',
        link: function($scope, element, attrs) {

            (function($) {

                var q = $('#qrcode');
                var draw = function() {

                    var option = {
                        height: 100,
                        width: 100,
                        text: $scope.infostr
                    };

                    new QRCode(q, option);
                }
                draw();

            })(document.querySelector.bind(document));
        }
    }
    return directive;
});

//=====
// 生成条星星指令
// 使用方式 <span star rating-value="ratingVal" max="max" on-hover="onHover" on-leave="onLeave" readonly="{{readonly}}"></span>
app.directive('star', function () { 
  return {  
    template: '<ul class="rating" ng-mouseleave="leave()">' +  
        '<li ng-repeat="star in stars" ng-class="star" ng-click="click($index + 1)" ng-mouseover="over($index + 1)">' +  
        '\u2605' +  
        '</li>' +  
        '</ul>',  
    scope: {  
      ratingValue: '=',  
      max: '=',  
      readonly: '@',  
      onHover: '=',  
      onLeave: '='
    },  
    controller: function($scope) {  
      $scope.ratingValue = $scope.ratingValue || 0;  
      $scope.max = $scope.max || 5;  
      $scope.click = function(val) {  
        if ($scope.readonly && $scope.readonly === 'true') {  
          return;  
        }  
        $scope.ratingValue = val; 
      };  
      $scope.over = function(val) {  
        $scope.onHover(val);  
      };  
      $scope.leave = function() {  
        $scope.onLeave();  
      }  
    },  
    link: function (scope, elem, attrs) {  // elem指向被挂载的当前的元素
      // elem.css("text-align", "center"); 
      var updateStars = function () { 
        scope.stars = [];  
        for (var i = 0; i < scope.max; i++) {  
          scope.stars.push({  
            filled: i < scope.ratingValue  
          });  
        }  
      };  
      updateStars();  
   
      scope.$watch('ratingValue', function (oldVal, newVal) {  
        if (oldVal) {  
          updateStars();  
        }  
      });  
      scope.$watch('max', function (oldVal, newVal) {  
        if (newVal) {  
          updateStars();  
        }  
      });  
    }  
  };  
});

//=====
// 自定义双向绑定指令
// 使用方式 <div class="icon-arrow-title title-color-2" my-ng-model="true" ng-model="param.MobileNum" />
app.directive('my-ng-model', function() {

    // 指令的推荐写法，var directive = {}; return directive; 能避免很多错误
    var directive = {
        restrict: 'A',
        require: '?ngModel', // 此指令所代替的函数
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            } // do nothing if no ng-model
            // Specify how UI should be updated
            ngModel.$render = function() {
                element.html(ngModel.$viewValue || '');
            };
            // Listen for change events to enable binding
            element.on('blur keyup change', function() {
                scope.$apply(readViewText);
            });
            // No need to initialize, AngularJS will initialize the text based on ng-model attribute
            // Write data to the model
            function readViewText() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html === '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
    return directive;
});

//=====
// 放大图片指令
// enlargePic指令名称，写在需要用到的地方img中即可实现放大图片  
// 使用方式 <div class="icon-arrow-title title-color-2" enlargePic />
app.directive('enlargePic', function() { 
    return {    
        restrict: "AE",    
        link: function(scope, elem, attrs) {    
            elem.bind('click', function($event) {
                angular.element(document.querySelector(".mask"))[0].style.display = "block";    
                angular.element(document.querySelector(".bigPic"))[0].src = attrs.src; 
            })    
        }    
    }    
});

//=====
// 关闭图片指令
// 使用方式 <div class="icon-arrow-title title-color-2" closePic />
app.directive('closePic', function() {    
    return {    
        restrict: "AE",    
        link: function(scope, elem) {    
            elem.bind('click', function($event) {    
                angular.element(document.querySelector(".mask"))[0].style.display = "none";    
            })    
        }    
    }    
});

//=====
// 图片加载错误指令
// 使用方式 <img ng-src="yyy" err-src="xxx" />
app.directive('errSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});
//=====
// 图片加载动画
// 使用方式  <loadinganimation ></loadinganimation>
app.directive('loadinganimation', function() {
    var directive = {
        restrict: 'EA',
        replace: true, 
        scope: {
            infostr: '@'
        },
        template: '<div id="loader">'+
        '    <div id="lemon" style="transition: all linear 1s;"></div>'+
        '    <div id="straw" style="transition: all linear 1s;"></div>'+
        '    <div id="glass">'+
        '        <div id="cubes">'+
        '            <div style="transition: all linear 1s;" ></div>'+
        '            <div style="transition: all linear 1s;"></div>'+
        '            <div style="transition: all linear 1s;"></div>'+
        '        </div>'+
        '        <div id="drink" style="transition: all linear .5s;"></div>'+
        '        <span id="counter"></span>'+
        '    </div>'+
        '    <div id="coaster"></div>'+
        '</div>',
        link: function($scope, element, attrs) {
            console.log(angular.element(angular.element( element.children()[2] ).children()[0]).children());
            var worker = null;
            var loaded = 0;
            var count = 1;
            function increment() {
                if(count % 2 == 1) {
                    if(count == 1) {
                        angular.element(angular.element( element.children()[2] ).children()[2]).html(loaded+'%');
                    }
                    angular.element(angular.element( element.children()[2] ).children()[1]).css('top', (100-loaded*.89)+'%');
                    if(loaded==25) angular.element(angular.element(angular.element( element.children()[2] ).children()[0]).children()[0]).css('opacity', '1');
                    if(loaded==50) angular.element(angular.element(angular.element( element.children()[2] ).children()[0]).children()[1]).css('opacity', '1');
                    if(loaded==75) angular.element(angular.element(angular.element( element.children()[2] ).children()[0]).children()[2]).css('opacity', '1');
                    if(loaded==100) {
                        angular.element(element.children()[0]).css('opacity', '1');
                        angular.element(element.children()[1]).css('opacity', '1');
                        loaded = 11;
                        stopLoading();
                        setTimeout(startLoading, 1000);
                        count++;
                    } else {
                        loaded++;    
                    }
                } else {
                    if(count != 1) {
                        angular.element(angular.element( element.children()[2] ).children()[2]).html("");
                    }
                    angular.element(angular.element( element.children()[2] ).children()[1]).css('top', (loaded*.89)+'%');
                    if(loaded==25) angular.element(angular.element(angular.element( element.children()[2] ).children()[0]).children()[2]).css('opacity', '0');
                    if(loaded==50) angular.element(angular.element(angular.element( element.children()[2] ).children()[0]).children()[1]).css('opacity', '0');
                    if(loaded==75) angular.element(angular.element(angular.element( element.children()[2] ).children()[0]).children()[0]).css('opacity', '0');  
                    if(loaded==100) {
                        angular.element(element.children()[0]).css('opacity', '0');
                        angular.element(element.children()[1]).css('opacity', '0');
                        loaded = 10;
                        stopLoading();
                        setTimeout(startLoading, 1000);
                        count++;
                    } else {
                        loaded++;    
                    }
                }
            }
            function startLoading() {
                if(count %2 == 1) {
                    angular.element(element.children()[0]).css('opacity', '0');
                    angular.element(element.children()[1]).css('opacity', '0');
                    angular.element(angular.element( element.children()[2] ).children()[0]).children().css('opacity', '0');
                } else {
                    angular.element(element.children()[0]).css('opacity', '1');
                    angular.element(element.children()[1]).css('opacity', '1');
                    angular.element(angular.element( element.children()[2] ).children()[0]).children().css('opacity', '1');
                }
                worker = setInterval(increment, 60);
            }
            function stopLoading() {
                clearInterval(worker);
            }
            startLoading();
        }
    }
    return directive;
});