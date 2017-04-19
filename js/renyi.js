/**
 * Created by Administrator on 2017/3/15.
 */
var renyi = null;

(function () {
    renyi = {
        init: function (callback) {
            //init 初始化所有窗口
            //目前总共4个页面 _FIND(发现), _PERSONAL(我) ,_NEWS(消息), _LOGIN(不一直存在)

            if (this.getLogin()) {
                //显示主页
                this.webView.create('_FIND', 'find.html', {left: '60px' ,'popGesture':'none'});//创建并打开发现页面
                this.webView.down('_LOGIN', 'close');

/*                this.webView.create('_PERSONAL', 'personal.html', {type: 'hide', left: '60px' ,'popGesture':'none'});//创建个人中心
                this.webView.create('_NEWS', 'news.html', {type: 'hide', left: '60px', 'popGesture':'none'});//创建个人中心*/
            } else {

                //如果没有登录，启动登录窗口
                this.webView.create('_LOGIN', 'login.html');
                
                this.webView.down('_FIND', 'close');
                this.webView.down('_PERSONAL', 'close');
                this.webView.down('_NEWS', 'close');
            }
            if(callback) { 
            	callback();
            }
        },
        setLogin: function (id, name, image, amount, fun) {
            var selfName   = name || null,
                selfId     = id || null,
                selfImage  = image || null,
                selfAmount = amount || null;

            if (selfId && selfName) {

                //保存登录状态
                window.localStorage.setItem('userId', selfId);
                window.localStorage.setItem('userName', selfName);
                window.localStorage.setItem('userImage', selfImage);
                window.localStorage.setItem('userAmount', selfAmount);// 时光币
            }

            //如果最后一项是方法
            if (typeof arguments[arguments.length - 1] == 'function') {
                arguments[arguments.length - 1]();
            }
        },
        getLogin: function () {

            if (window.localStorage.getItem('userId') &&
                    window.localStorage.getItem('userName') &&
                    window.localStorage.getItem('userImage') &&
                    window.localStorage.getItem('userAmount') ) {

                //如果 userId和userName都存在数据
                return {
                    userId: window.localStorage.getItem('userId'),
                    userName: window.localStorage.getItem('userName'),
                    userImage: window.localStorage.getItem('userImage'),
                    userAmount: window.localStorage.getItem('userAmount')
                }
            } else {
                return null;
            }
        },
        webView: {
            create: function (id, url, obj) {
                var _obj = obj || {};//如果没有传入对象，那就为空对象

                var _bool     = _obj['type'] || 'show',// show 显示， hide不显示只创建,默认显示
                    _left     = _obj['left'] || '0px',//默认左边距离为0
                    _hideLeft = _obj['hideLeft'] || '100px',// 定义隐藏时左边距离，对于一些特殊要加比如0
                    _duration = _obj['duration'] || 400,
                    _typeShow = _obj['typeShow'] || 'fade-in', // 默认淡入淡出
                    _timeOut  = _obj['timeOut'] || 400,//定义延迟时间
                    _popGesture = _obj['popGesture'] || 'close',// 侧滑返回默认为关闭，none关闭侧滑返回
                    webviews  = null;

                //判断是否存在该窗口,不存在则创建
                webviews = plus.webview.getWebviewById(id);
                if (webviews == null) {
                    webviews = plus.webview.create(url, id);
                }

                //设置隐藏时位置
                webviews.setStyle({left: _left,'popGesture':_popGesture});

                //是否显示
                if (_bool === 'show') {
                    (function () {
                        var settime = setTimeout(function () {
                            plus.webview.show(id, _typeShow, _duration); // 显示窗口

                            clearTimeout(settime);
                            settime = null;
                        }, _timeOut);//之所以要延迟显示是因为给dom加载的时间
                    })();
                }
            },
            down: function (id, bool) {
                var _bool = bool || 'hide',// close 为关闭，hide为隐藏,默认隐藏
                    webviews = null;

                //判断传入的是字符串还是窗口对象
                if (typeof id == 'string') {
                    //判断是否有这窗口
                    webviews = plus.webview.getWebviewById(id);
                } else {
                    webviews = id;
                }

                if (webviews != null) {

                    //是关闭 还是隐藏
                    if (_bool === 'close') {
                        plus.webview.close(webviews, "fade-out", 500);
                    } else {
                        plus.webview.hide(webviews, "fade-out", 500);
                    }
                }
            }
        },
        ajax: function (obj) {

            if (!('url' in obj)) {
                throw new Error("必须填写url");
            }
            var mydata = '';
//          var xhr = new XMLHttpRequest();
            var xhr = new plus.net.XMLHttpRequest();
            xhr.onreadystatechange = function () {
                switch (xhr.readyState) {
                    case 0:
                        //console.log( "xhr请求已初始化" );
                        break;
                    case 1:
                        //console.log( "xhr请求已打开" );
                        break;
                    case 2:
                        if ('beforeSend' in obj) {
                            obj['beforeSend']();
                        }
                        //console.log( "xhr请求已发送" );
                        break;
                    case 3:
                        //console.log( "xhr请求已响应");
                        break;
                    case 4:
                        if (xhr.status == 200) {
                            if ('success' in obj) {
                                obj['success'](xhr.responseText);
                            }
                        } else {
                            if ('error' in obj) {
                                obj['error'](xhr.responseText);
                            }
                        }
                        break;
                    default :
                        break;
                }
            };

            //默认 post请求
            if (!('type' in obj)) {
                obj['type'] = 'get';
            }

            //是否有数据
            if ('data' in obj) {
                (function () {
                    var i;
                    for (i in obj['data']) {
                        mydata += (i + '=' + obj['data'][i] + '&');
                        //data : 'form=along&age=17',
                    }
                })()
            }

            if (obj['type'] == 'post' || obj['type'] == 'POST') {
                xhr.open("POST", obj['url']);
                //想要发送这个post，必须加下面这句话
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                //data : 'form=along&age=17',
                xhr.send(mydata);
            } else {
                xhr.open("GET", obj['url'] + '?' + mydata);
                xhr.send();
            }
        },
        Map: {
            setUserLocation: function (id, fun) {
                this.getUserLocation(id, function (x, y, adress) {
                    window.localStorage.setItem('x', x);
                    window.localStorage.setItem('y', y);
                    window.localStorage.setItem('address', adress);
                    fun(x, y, adress);
                })
            },
            getUserLocation: function (id, fun) {
                /*            renyi.Map.getUserLocation('map', function (x,y,address) {
                 alert(x);
                 alert(y);
                 alert(address);
                 });*/
                if (arguments.length < 1) {
                    throw new error('必须向构造函数中传入dom对象');
                }
                // 要求传入dom的id值
                var map = null;
                // H5 plus事件处理
                function plusReady() {
                    // 确保DOM解析完成
/*                    if (!window.plus || map) {
                        return
                    }*/
                    map = new plus.maps.Map(id);
                    getUserLocation();
                }
                plusReady();

/*                if (window.plus) {
                    plusReady();
                } else {
                    //这个时候我还没有完成
                    document.addEventListener("plusready", plusReady, false);
                }*/

                // DOMContentloaded事件处理
/*                document.addEventListener("DOMContentLoaded", function () {
                    plusReady();
                }, false);*/

                // 获取用户的当前位置信息
                function getUserLocation() {
                    map.getUserLocation(function (state, point) {
                        if (0 == state) {
                            //fun(point['longitude'], point['latitude']);

                            (function () {
                                var point2 = new plus.maps.Point(point['longitude'], point['latitude']);
                                plus.maps.Map.reverseGeocode(point2, {}, function (event) {
                                    var address = event.address;  // 转换后的地理位置
                                    fun(point['longitude'], point['latitude'], address);
                                }, function (e) {
                                    fun(JSON.stringify(e));
                                });
                            })();

                        } else {
                            alert('获取地址失败');
                        }
                    });
                }
            }
        },
        Time: {
            getDateDiff: function (startTime, endTime) {
                //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
                startTime = startTime.replace(/\-/g, "/");
                endTime = endTime.replace(/\-/g, "/");

                //将计算间隔类性字符转换为小写

                var sTime = new Date(startTime),  //开始时间
                    eTime = new Date(endTime),   //结束时间
                    //作为除数的数字
                    divNum = 1,
                    diffType = null,
                    endType = '',
                    mistiming = parseInt(Math.abs(eTime.getTime() - sTime.getTime())) / 1000;//相差的秒数

                if (mistiming < 60) {
                    //小于60秒
                    diffType = "second";
                    endType = "秒";

                } else if (mistiming / 60 < 60) {
                    // 小于60分钟
                    diffType = "minute";
                    endType = "分钟";

                } else if (mistiming / 3600 < 24) {
                    //小于24小时
                    diffType = "hour";
                    endType = "小时";

                } else if (mistiming / (3600 * 24) < 30) {
                    //小于30天
                    diffType = "day";
                    endType = "天";

                } else if (mistiming / (3600 * 24 * 30) < 12) {
                    diffType = "month";
                    endType = "月";
                } else {
                    diffType = "year";
                    endType = "";
                }

                switch (diffType) {
                    case "second":
                        divNum = 1000;// 表
                        break;
                    case "minute":
                        divNum = 1000 * 60;
                        break;
                    case "hour":
                        divNum = 1000 * 3600;
                        break;
                    case "day":
                        divNum = 1000 * 3600 * 24;
                        break;
                    case "month":
                        divNum = 1000 * 3600 * 24 * 30;
                        break;
                    default:
                        break;
                }

                if (diffType === 'year') {
                    return endTime;
                } else {
                    return parseInt(Math.abs(eTime.getTime() - sTime.getTime()) / parseInt(divNum)) + endType;
                }
            },
            getNowFormatDate: function () {
                var date = new Date();
                var seperator1 = "-";
                var seperator2 = ":";
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                    + " " + date.getHours() + seperator2 + date.getMinutes()
                    + seperator2 + date.getSeconds();
                return currentdate;
            }
        },
        File : {
        /*  renyi.File.fileDownload({
                fileName : '20170409170553391.JPG',
                fileUrl  : 'userImage/',
                URL      : 'http://clevok.cn/other/renyi/img/user-image/20170409170553391.JPG'
            }, function (obj) {
                alert(obj.msg);
                alert(obj.url);
            });*/

            //获取本地文件
            fileReader : function (obj, callback) {
                // fileUrl为图片本地路径 ，URL为图片远程URL，fileName为图片名字

                //obj => {fileName:20170409170553391.JPG,'fileUrl':'userImage/'，ULR:'http://'},fileUrl必须带 / 或者不带,
                //URL远程网址目标的url

                //  url示例 "_downloads/userImage/20170409170553391.JPG"
                plus.io.resolveLocalFileSystemURL( "_downloads/"+obj['fileUrl']+obj['fileName'], function( entry ) {

                    // 找到
                    entry.file( function(file){
                        var fileReader = new plus.io.FileReader();
                        //alert("getFile:" + JSON.stringify(file)); 这里保存了个对象有size，type，name还有这个图片的地址
                        fileReader.readAsText(file, 'utf-8');
                        fileReader.onloadend = function(evt) {
                            //console.log(JSON.stringify(evt) );
                            callback({url: evt.target.fileName, status: 1, msg:'成功获取'});//返回绝对路径直接用
                            // alert(evt.target.fileName);//路径
                            //alert("evt.target" + evt.target);
                            //alert(evt.target.result);//null
                        };
                        //alert(file.size + '--' + file.name);// 单位字节 字节/1024 = k ; 加 名字
                    } );
                }, function ( e ) {
                    callback({url:'null', status: 0, msg:'该文件不存在'});//表示该文件不存在
                    //e.message是文件没有发现
                    //alert( "Resolve file URL failed: " + e.message );
                } );
            },

            //下载文件,url要下载的文件
            fileDownload : function (obj, callback) {
                // fileUrl为图片本地路径 ，URL为图片远程完整URL，fileName为图片名字
                //obj => {fileName:20170409170553391.JPG,'fileUrl':'userImage/'，ULR:'http://'},fileUrl必须带 / 或者不带,

                //远程obj['URL']示例 http://clevok.cn/other/renyi/img/user-image/20170409170553391.JPG
                var dtask = plus.downloader.createDownload( obj['URL'], {filename:'_downloads/'+obj['fileUrl']}, function ( d, status ) {

                    // 下载完成
                    if ( status == 200 ) {
                        //alert( "Download success: " + d.filename );//这是相对的_downloads/userImage/，地址加原本的名字
                        if(callback) {
                            callback( {status:1, url:plus.io.convertLocalFileSystemURL(d.filename) , msg:'下载成功'} );//转化为绝对路径
                        }
                    } else {
                        this.removeFile(obj);//如果下载失败就要移除一个特殊的缓冲文件
                        if(callback) {
                            callback( {status:0, url:status ,msg:'下载失败'} );
                        }
                        //alert( "Download failed: " + status );
                    }
                });
                //dtask.addEventListener( "statechanged", onStateChanged, false );
                dtask.start();
            },
            removeFile : function (obj, callback) {
                //删除
                plus.io.resolveLocalFileSystemURL("_downloads/"+obj['fileUrl']+obj['fileName'], function(entry) {
                    entry.remove(function(entry) {
                        if(callback) {
                            callback({status:1 ,msg:'删除成功'});//成功
                        }
                    }, function(e) {
                        if(callback) {
                            callback({status:0, msg:'删除失败'});//成功
                        }
                    });
                });
            },

            //组合性文件
            groupSet : function (obj, fun) {
                var self = this;

                //先读取本地文件
                this.fileReader(obj, function (data) {

                    //如果该文件不存在
                    if(data.status == 0) {

                        //开始下载
                        self.fileDownload(obj, function (mydata) {
                            if(mydata.status == 1) {
                                console.log('下载成功');
                                if(fun) {
                                    fun( { status: 1 ,url:mydata.url, msg:'下载成功'} );
                                }
                            }else {
                                if(fun) {
                                    fun( { status: -1 ,url:null, msg:'下载失败'} );
                                }
                                console.log('下载失败')
                            }
                        })
                    }else {
                        // 存在直接返回绝对路径
                        if(fun) {
                            fun( { status: 0 ,url:data.url, msg:'该文件已存在,直接调用'} );
                        }
                    }
                })
            }
        }


    }

})();