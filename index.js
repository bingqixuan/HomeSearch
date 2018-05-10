/**
 * Created by bingqixuan on 2018/5/9.
 */
(function () {
    const map = new AMap.Map('container', {
        resizeEnable: true,
        zoom: 10,
        center: [116.480983, 40.0958]
    });


    var transService, stationService, linesearchService;

    var drawArray = [];


    init(); // 初始化所有插件


    function init() {

        //加载公交换乘插件
        AMap.service(["AMap.Transfer"], function () {
            //构造公交换乘类
            transService = new AMap.Transfer({
                map: map,
                city: '北京市',                            //公交城市
                //cityd:'乌鲁木齐',
                policy: AMap.TransferPolicy.LEAST_TIME //乘车策略
            });

        });

        AMap.plugin(["AMap.StationSearch"], function () {
            //实例化公交站点查询类
            stationService = new AMap.StationSearch({
                pageIndex: 1, //页码
                pageSize: 1, //单页显示结果条数
                city: '010'    //确定搜索城市
            });
        });

        //实例化公交线路查询类，只取回一条路线
        AMap.service(["AMap.LineSearch"], function () {
            linesearchService = new AMap.LineSearch({
                pageIndex: 1,
                city: '北京',
                pageSize: 1,
                extensions: 'all'
            });
        })
    }


//根据起、终点坐标查询公交换乘路线
    document.getElementById('search').onclick = function () {
        map.remove(drawArray);
        let value = document.getElementById('input').value;
        stationSearch(value);
    };


    /*公交站点查询*/
    function stationSearch(name) {
        stationService.search(name, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                stationSearch_CallBack(result);
            } else {
                alert(result);
            }
        });
    }

    /*公交站点查询返回数据解析*/
    function stationSearch_CallBack(searchResult) {
        var stationArr = searchResult.stationInfo;
        var searchNum = stationArr.length;
        if (searchNum > 0) {
//            document.getElementById('tip').innerHTML = '查询结果：共' + searchNum + '个站点';
            for (var i = 0; i < searchNum; i++) {
                var marker = new AMap.Marker({
                    position: stationArr[i].location,
                    map: map,
                    title: stationArr[i].name,
                    icon:"location.png"
                });
                drawArray.push(marker);
                marker.info = new AMap.InfoWindow({
                    content: stationArr[i].name,
                    offset: new AMap.Pixel(0, -30)
                });
                marker.on('click', function (e) {
                    e.target.info.open(map, e.target.getPosition())
                });
                var buslines = stationArr[i].buslines;
                for(let j =0,length = buslines.length; j<length;j++){
                    let busName = (buslines[j].name.split('('))[0];
                    lineSearch(busName)
                }
            }
            map.setFitView();
        }
    }

    function lineSearch(name) {
        linesearchService.search(name, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                lineSearch_Callback(result);
            } else {
                alert(result);
            }
        });
    }


    /*
     * 公交路线查询服务返回数据解析概况
     * param Array[]  lineArr     返回公交线路总数
     * param String   lineName    公交线路名称
     * param String   lineCity    公交所在城市
     * param String   company     公交所属公司
     * param Number   stime       首班车时间
     * param Number   etime       末班车时间
     * param Number   bprice      公交起步票价
     * param Number   tprice      公交全程票价
     * param Array[]  pathArr     公交线路路径数组
     */
    function lineSearch_Callback(data) {
        var lineArr = data.lineInfo;
        var lineNum = data.lineInfo.length;
        if (lineNum == 0) {
            resLine = data.info;
        }
        else {
            for (var i = 0; i < lineNum; i++) {
                var pathArr = lineArr[i].path;
                var stops = lineArr[i].via_stops;
                var startPot = stops[0].location;
                var endPot = stops[stops.length - 1].location;
                var name = lineArr[i].name;

                if (i == 0) drawbusLine(startPot, endPot, pathArr, name);
            }
        }
    }

    /*
     *绘制路线
     */
    function drawbusLine(startPot, endPot, BusArr, name) {
        //绘制起点，终点
        let stmarker = new AMap.Marker({
            map: map,
            position: [startPot.lng, startPot.lat], //基点位置
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/start.png",
            zIndex: 10
        });
        stmarker.info = new AMap.InfoWindow({
            content: name,
            offset: new AMap.Pixel(0, -30)
        });
        stmarker.on('click', function (e) {
            e.target.info.open(map, e.target.getPosition())
        });
        drawArray.push(stmarker);
        // var endmarker = new AMap.Marker({
        //     map: map,
        //     position: [endPot.lng, endPot.lat], //基点位置
        //     icon: "https://webapi.amap.com/theme/v1.3/markers/n/end.png",
        //     zIndex: 10
        // });
        //绘制乘车的路线
        var busPolyline = new AMap.Polyline({
            map: map,
            path: BusArr,
            strokeColor: "#09f",//线颜色
            strokeOpacity: 0.8,//线透明度
            strokeWeight: 6//线宽
        });
        drawArray.push(busPolyline)
        map.setFitView();
    }

})();
