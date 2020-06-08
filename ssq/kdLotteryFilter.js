;(function(fs, superagent, cheerio){
	'use strict';

	var utils = (function(){
		/*
	    * Check Data Type
	    * @public
	    * @param {Any}
	    * @return {String}
	    */
	    var datatype = function(obj){
	        return Object.prototype.toString.apply(obj)
	            .toLowerCase()
	            .replace('[object ', '')
	            .replace(']', '');
	    };

	    var isNumberic = function(obj){
	        return !isNaN(parseFloat(obj)) && isFinite(obj);
	    };

	    var addZero = function(num, len, mark){
	        if(isNumberic(num) === false) return num;

	        len = len || 2;
	        return (Array(len).join(mark || '0') + num).slice(-len);
	    };

	    /*
	    * Factorial
	    * n! = 1 * 2 * 3 * ... * n
	    */
	    var factorial = function(n, i){
	        i = (i === undefined || i < 1) ? 1 : i;
	        var result = 1;
	        if(n < 0) return 0;
	        if(n === 0) return 1;
	        for(; i <= n; i++){
	            result *= i;
	        }
	        return result;
	    };
	    /*
	    * Arrangement
	    * A(n, m) = n!/(n-m)!
	    */
	    var A = function(n, m){
	        return n < m ? 0 : factorial(n, n - m + 1);
	    };
	    /*
	    * Combination
	    * C(n, m) = n!/m!(n-m)!
	    */
	    var C = function(n, m){
	        return n < m ? 0 : parseInt(factorial(n, n - m + 1) / factorial(m), 10);
	    };

	    var forEach = function(obj, fn, context){
	        var key, index = -1, len;
	        if(datatype(obj) === 'array'){
	            for(key = 0, len = obj.length; key < len; key++){
	                if(fn.apply(context, [obj[key], key, obj]) === false){
	                    break;
	                }
	            }
	        }else{
	            for(key in obj){
	                if(!obj.hasOwnProperty(key)) continue;
	                index++;
	                if(fn.apply(context, [obj[key], key, index, obj]) === false){
	                    break;
	                }
	            }
	        }
	    };

	    var map = function(obj, fn, context){
	        var key, index = -1, len, rs;
	        if(datatype(obj) === 'array'){
	            rs = [];
	            for(key = 0, len = obj.length; key < len; key++){
	                rs[key] = fn.apply(context, [obj[key], key, obj]);
	            }
	        }else{
	            rs = {};
	            for(key in obj){
	                if(!obj.hasOwnProperty(key)) continue;
	                index++;
	                rs[key] = fn.apply(context, [obj[key], key, index, obj]);
	            }
	        }
	        return rs;
	    };

	    var unique = function(arr){
	        var rs = [], cache = {};
	        forEach(arr, item => {
	            if(cache.hasOwnProperty(item)) return;
	            cache[item] = true;
	            rs.push(item);
	        });
	        return rs;
	    };

	    /**
	    ** 判断质数和合数
	    ** prime 质数
	    ** composite 合数
	    **/
	    var primeOrComposite = function(num){
	        var factor = 2;
	        var len = 0;

	        num = Math.abs(num);

	        if(num < 1) return "misc";

	        for(; factor < num; factor++){
	            if(num % factor === 0) len++;
	        }

	        return len === 0 ? "prime" : "composite";
	    };

	    /**
	    ** 判断大数和小数
	    ** large 大数
	    ** small 小数
	    **/
	    var largeOrSmall = function(num, separator, middle){
	        if(middle !== undefined){
	            if(num === middle) return "middle";
	        }
	        return num < separator ? "small" : "large";
	    };

	    /**
	    ** 判断奇数和偶数
	    ** odd 奇数
	    ** even 偶数
	    **/
	    var oddOrEven = function(num){
	        return num % 2 == 0 ? "even" : "odd";
	    };

	    /**
	    ** 获取指定位数的数
	    ** 1 为个位数
	    ** 2 为十位数
	    ** 3 为百位数
	    ** 4 为千位数
	    ** 5 为万位数
	    ** n 以此类推
	    **/
	    var getDigit = function(num, pos){
	        num = addZero(num);

	        var na = num.split('').reverse();

	        return parseInt(na[pos > 0 ? pos - 1 : 0], 10);
	    };

	    /**
	    ** 分区
	    ** $datas 数组
	    ** $areaType = null | 'area3-12' | 'modArea3-12' | 'element'
	    **/
	    var areaRate = function(data, check){
	        var hash = {}, rate = {};
	        forEach(data, (item, key, index) => {
	            rate[key] = 0;
	            forEach(item, hashKey => {
	                hash[hashKey] = key;
	            });
	        });
	        check.forEach(item => {
	            rate[hash[item]]++;
	        });
	        return rate;
	    };

	    /**
	    ** AC值
	    **/
	    var getAC = function(data){
	        var rs = [];
	        data.forEach(item => {
	            data.forEach(item2 => {
	                let val = Math.abs(item - item2);
	                if(val > 0) rs.push(val);
	            });
	        });
	        rs = unique(rs);
	        return rs.length - (data.length - 1);
	    };

	    /**
	    ** n舍n+1入
	    ** $precision 要保留的小数位数 默认是0
	    ** >= $flag 就入， < $flag 就舍 默认是4
	    **/
	    var round = function(num, precision = 0, flag = 4){
	        var chars = String(num).split('.');
	        var integer = parseInt(chars[0]);
	        var floor = 0;
	        if(chars[1] === undefined) return integer;

	        var len = chars[1].length;
	        var add = 0;
	        if(precision > 0){
	            for(var i = len - 1; i >= 0; i--){
	                if(i > precision){
	                    continue;
	                }else if(i == precision){
	                    if(chars[1][i] * 1 >= flag){
	                        add = 1; 
	                    }
	                }else{
	                    floor = (add ? chars[1][i] * 1 + 1 : chars[1][i]) + '' + floor;
	                    add = 0;
	                }
	            }
	            num = parseFloat(integer + '.' + floor);
	        }else{
	            num = chars[1][0] * 1 >= flag ? integer + 1 : integer;
	        }
	        return num;
	    };

	    /*
		* @param Array
		* @param Number
		* @return Object
		*/
		var combination = function(data, choose){
			var dataObj = (function(){
		        var obj = {
		            length: data.length
		        };
		        for(var i = 0; i < obj.length; i++){
		            obj[i] = data[i];
		        }
		        return obj;
		    })();

		    var combsLength = C(dataObj.length, choose);

		    var allCombs = [];
		    var list = function(index, level, prevdata){
	            level = level === undefined ? 0 : level;
	            index = (index === undefined ? -1 : index) + 1;
	            var end = dataObj.length - choose + level + 1;
	            if(level >= choose){
	                allCombs.push(prevdata);
	            }else{
	                for(; index < end; index++){
	                    list(index, level + 1, (prevdata === undefined ? '' : prevdata + ',') + dataObj[index]);
	                }
	            }
	        };

	        list();

		    return {
		    	length: combsLength,
		    	list: allCombs
		    };
		};

	    var readJsonFile = function(file){
	        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file).toString()) : {};
	    };

	    // Date & Time
	    var dt = {};
	    dt.dateObject = function(datetime){
	    	if(!!datetime === false){
	    		return new Date();
	    	}
	    	if(datatype(datetime) === 'number'){
	    		if(datetime.toString().length === 10){
	    			datetime *= 1000;
	    		}
	    		return new Date(datetime);
	    	}

	    	var tmp = datetime.toString().split(/-|:|\s+/);
	    	var tmpLen = tmp.length;
	    	var i = 0;
	    	var d = new Date();

	    	for(; i < tmpLen; i++){
	    		tmp[i] = parseInt(tmp[i], 10);
	    	}

	    	d.setFullYear(tmp[0]);
	    	d.setMonth(tmp[1] - 1, 1);
	    	d.setDate(tmp[2]);
	    	d.setHours(tmp[3] || 0);
	    	d.setMinutes(tmp[4] || 0);
	    	d.setSeconds(tmp[5] || 0);
	    	d.setMilliseconds(tmp[6] || 0);

	    	d.format = function(format){
	    		format = format.replace('%Y', d.getFullYear());
	    		format = format.replace('%M', addZero(d.getMonth() + 1));
	    		format = format.replace('%D', addZero(d.getDate()));
	    		format = format.replace('%h', addZero(d.getHours()));
	    		format = format.replace('%i', addZero(d.getMinutes()));
	    		format = format.replace('%s', addZero(d.getSeconds()));

	    		return format;
	    	};

	    	return d;
	    };
		dt.timestamp = function(datetime, isSeconds){
	    	var result = null;
	    	return isSeconds ? Math.floor(dt.dateObject(datetime).getTime() / 1000) : dt.dateObject(datetime).getTime();
	    };
		dt.datetime = function(timestamp, format){
	    	format = format || 'Y-M-D h:i:s';

	    	var d = datatype(timestamp) === 'date' ? timestamp : dt.dateObject(timestamp);
	    	var o = {
	    		Y: d.getFullYear(),
	    		M: addZero(d.getMonth() + 1),
	    		D: addZero(d.getDate()),
	    		h: addZero(d.getHours()),
	    		i: addZero(d.getMinutes()),
	    		s: addZero(d.getSeconds())
	    	};
	    	for(var i in o){
	    		if(o.hasOwnProperty(i)){
	    			format = format.replace(i, o[i]);
	    		}
	    	}
	    	return format;
	    };
	    dt.seconds = function(time){
	    	if(datatype(time) !== 'string'){
	    		throw new Error("param `time` should be a string.");
	    	}
			time = time.split(':');

			for(var i = 0, len = time.length; i < len; i++){
				time[i] = parseInt(time[i], 10);
				if(isNaN(time[i])){
					throw new Error();
				}
			}

	    	return time[0] * 60 * 60 + time[1] * 60 + time[2];
	    };
	    dt.atTime = function(startTime, endTime, checkTime){
	    	startTime = dt.seconds(startTime);
	    	endTime = dt.seconds(endTime);
	    	checkTime = dt.seconds(checkTime === undefined ? dt.datetime(null, 'h:i:s') : checkTime);

	    	return startTime > endTime ? checkTime >= startTime || checkTime <= endTime : checkTime >= startTime && checkTime <= endTime;
	    };
	    var _computeYMDhis = function(seconds){
	    	var o = {
	    		s: 0,
	    		i: 0,
	    		h: 0,
	    		D: 0,
	    		M: 0,
	    		Y: 0
	    	};
	    	var tmp = 0;

	    	// compute seconds
	    	tmp = seconds % 60;
	    	o.s = tmp;

	    	// compute minutes
	    	tmp = Math.floor(seconds / 60);
	    	o.i = tmp > 0 ? (tmp % 60) : o.i;

	    	// compute hours
	    	tmp = Math.floor(seconds / 60 / 60);
	    	o.h = tmp > 0 ? (tmp % 24) : o.h;

	    	// compute days
	    	tmp = Math.floor(seconds / 60 / 60 / 24);
	    	o.D = tmp > 0 ? (tmp % 30) : o.D;

	    	var hgn = 365 * 24 * 60 * 60 + 5 * 60 * 60 + 48 * 60 + 46;
	    	// compute months
	    	// using average one month = hgn / 12 = 2629743.833333...
	    	tmp = Math.floor(seconds / (hgn / 12));
	    	o.M = tmp > 0 ? (tmp % 12) : o.M;

	    	// compute years
	    	// using one year = 46 seconds 48 minutes 5 hours 365 days
	    	tmp = Math.floor(seconds / hgn);
	    	o.Y = tmp > 0 ? tmp : o.Y;

	    	return o;
	    };
	    dt.format = function(seconds, format){
	    	format = format || '%h:%i:%s';

	    	var has = {
	    		D: /%D/.test(format),
	    		M: /%M/.test(format),
	    		Y: /%Y/.test(format)
	    	};
	    	var o = _computeYMDhis(seconds);

	    	if(has.Y && o.Y){
	    		format = format.replace('%Y', o.Y);
	    	}else{
	    		format = format.replace(/%Y./, '');
	    		o.M += o.Y * 12;
	    	}
	    	if(has.M && o.M){
	    		format = format.replace('%M', addZero(o.M));
	    	}else{
	    		format = format.replace(/%M./, '');
	    		o.D += o.M * 30;
	    	}
	    	if(has.D && o.D){
	    		format = format.replace('%D', addZero(o.D));
	    	}else{
	    		format = format.replace(/%D./, '');
	    		o.h += o.D * 24;
	    	}

	    	format = format.replace('%s', addZero(o.s));
	    	format = format.replace('%i', addZero(o.i));
	    	format = format.replace('%h', addZero(o.h));

	    	return format;
	    };
	    dt.week = function(datetime){
	    	var d = dt.dateObject(datetime);
	    	return d.getDay();
	    };

	    var random = function(start, end, exclude){
	    	exclude = exclude || [];
		    var n = Math.round(Math.random() * (end + 1 - start));

		    return (isNaN(n) || n < start || n > end || exclude.indexOf(n) > -1) ? random(start, end, exclude) : n;
	    };

	    return {
	    	datatype,
	    	isNumberic,
	    	addZero,
	    	factorial,
	    	A,
	    	C,
	    	forEach,
	    	map,
	    	unique,
	    	primeOrComposite,
	    	largeOrSmall,
	    	oddOrEven,
	    	getDigit,
	    	areaRate,
	    	getAC,
	    	round,
	    	combination,
	    	readJsonFile,
	    	dt,
	    	random
	    };
	})();

	var Class = (function(){
	    function argumentNames(){
	        var names = this.toString().match(/^[\s\(]*function[^\(]*\(([^\)]*)\)/)[1]
	            .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
	            .replace(/\s+/g, '')
	            .split(',');
	        return names.length == 1 && !names[0] ? [] : names;
	    }
	    function Class(baseClass, prop){
	        if(typeof baseClass === 'object'){
	            prop = baseClass;
	            baseClass = null;
	        }
	        function F(){
	            if(baseClass){
	                this.base = baseClass.prototype;
	            }
	            this.init.apply(this, arguments);
	        }
	        if(baseClass){
	            var middleClass = function(){};
	            middleClass.prototype = baseClass.prototype;
	            F.prototype = new middleClass();
	            F.prototype.constructor = F;
	        }

	        function _super(name, fn){
	            return function(){
	                var that = this,
	                    $super = function(){
	                        return baseClass.prototype[name].apply(that, arguments);
	                    };
	                return fn.apply(this, Array.prototype.concat.apply($super, arguments));
	            };
	        }
	        for(var name in prop){
	            if(prop.hasOwnProperty(name)){
	                if(baseClass && typeof prop[name] === 'function' && argumentNames.call(prop[name])[0] === '$super'){
	                    F.prototype[name] = _super(name, prop[name]);
	                }else{
	                    F.prototype[name] = prop[name];
	                }
	            }
	        }
	        return F;
	    }
	    return Class;
	}());

	var History = (function(){
		var jsonFile = __dirname + '/ssq-history.json';

	    var _listOfHistory = fs.existsSync(jsonFile) ? utils.readJsonFile(jsonFile) : {
		    "length": 0,
		    "currentIssue": "2003001"
	    };

		function removeItem(arr, item){
		    let index = arr.indexOf(item);
		    if(index > -1){
		        arr.splice(index, 1);
		    }
		    return arr;
		}

		var totalPages = 1;
		var responseTimeout = 5000; // Wait 5 seconds for the server to start sending,
		var deadlineTimeout = 45000; // but allow 0.5 minute (30 seconds) for the file to finish loading.
		function getLengthAndCurrentIssue(obj){
		    var keys = Object.keys(obj), index;
		    keys = removeItem(keys, 'length');
		    keys = removeItem(keys, 'currentIssue');
		    keys.sort(function(a, b){
		        return 1*b - 1*a;
		    });
		    return {
		        length: keys.length,
		        currentIssue: keys[0]
		    };
		}
		function fetchHistoryFromZCW(all = false, num = 1){
		    var year = (new Date()).getFullYear() + 1;
		    var targetURL = 'http://kaijiang.zhcw.com/lishishuju/jsp/ssqInfoList.jsp?czId=1&beginIssue=2003001&endIssue=' + year + '001&&currentPageNum=' + num;
		    superagent.get(targetURL).timeout({
		        response: responseTimeout,
		        deadline: deadlineTimeout,
		    }).end(function(err, res){
		        if(err && err.timeout){
		            console.log(err);
		            fetchHistoryFrom500(all);
		        }else{
		            let $ = cheerio.load(res.text), data, issue, value, lc;
		            $('.chaJie table tbody tr').each(function(){
		                data = {
		                    issue: null, // 期号
		                    date: null, // 开奖日期
		                    balls: null, // 中奖号码
		                    saleroom: null, // 销售额(元)
		                    prize1: { // 一等奖
		                        count: null, // 注数
		                        bonus: null, // 奖金
		                    },
		                    prize2: { // 二等奖
		                        count: null, // 注数
		                        bonus: null, // 奖金
		                    },
		                    prize3: { // 三等奖
		                        count: null, // 注数
		                        bonus: null, // 奖金
		                    },
		                    jackpot: null, // 奖池
		                };
		                $(this).children('td').each(function(index){
		                    if(index === 0 || index === 12) return;
		                    if(index === 3){
		                        value = $(this).html().replace(/[^\d\s]/g, '');
		                    }else{
		                        value = index === 1 ? $(this).html() : parseInt($(this).html().replace(/,/g, ''), 10);
		                    }
		                    if(index === 1){
		                        data.date = value;
		                    }else if(index === 2){
		                        issue = value;
		                        data.issue = value;
		                    }else if(index === 3){
		                        data.balls = value;
		                    }else if(index === 4){
		                        data.saleroom = value;
		                    }else if(index === 5){
		                        data.prize1.count = value;
		                    }else if(index === 6){
		                        data.prize1.bonus = value;
		                    }else if(index === 7){
		                        data.prize2.count = value;
		                    }else if(index === 8){
		                        data.prize2.bonus = value;
		                    }else if(index === 9){
		                        data.prize3.count = value;
		                    }else if(index === 10){
		                        data.prize3.bonus = value;
		                    }else if(index === 11){
		                        data.jackpot = value;
		                    }
		                });
		                _listOfHistory[issue] = JSON.parse(JSON.stringify(data));
		            });
		            lc = getLengthAndCurrentIssue(_listOfHistory);
		            _listOfHistory.length = lc.length;
		            _listOfHistory.currentIssue = lc.currentIssue;

		            if(all){
		                if(num === 1){
		                    totalPages = $('select[onchange^="gopage"]').children('option').length;
		                }
		                if(num < totalPages){
		                    fetchHistoryFromZCW(all, num + 1);
		                }else{
		                    fs.writeFileSync(jsonFile, JSON.stringify(_listOfHistory, null, 4));
		                }
		            }else{
		                fs.writeFileSync(jsonFile, JSON.stringify(_listOfHistory, null, 4));
		            }
		        }
		    });
		}
		function fetchHistoryFrom500(all = false){
		    var year = (new Date()).getFullYear() - 2000;
		    var targetURL = 'http://datachart.500.com/ssq/history/newinc/history.php?start=' + (all ? '03' : (year <= 9 ? '0' : '') + year) + '001&end=' + (year <= 8 ? '0' : '') + (year + 1) + '001';

		    superagent.get(targetURL).timeout({
		        response: responseTimeout,
		        deadline: deadlineTimeout
		    }).end(function(err, res){
		        if(err && err.timeout){
		            console.error("timeout!");
		            fetchHistoryFromZCW(all);
		        }else{
		            let $ = cheerio.load(res.text), data, issue, value, lc;
		            $('#tdata tr').each(function(){
		                data = {
		                    issue: null, // 期号
		                    date: null, // 开奖日期
		                    balls: null, // 中奖号码
		                    saleroom: null, // 销售额(元)
		                    prize1: { // 一等奖
		                        count: null, // 注数
		                        bonus: null, // 奖金
		                    },
		                    prize2: { // 二等奖
		                        count: null, // 注数
		                        bonus: null, // 奖金
		                    },
		                    prize3: { // 三等奖
		                        count: null, // 注数
		                        bonus: null, // 奖金
		                    },
		                    jackpot: null, // 奖池
		                };
		                $(this).children('td').each(function(index){
		                    if(index === 8) return;
		                    if(index >= 1 && index <= 7){
		                        data.balls = (data.balls !== null ? data.balls + ' ' : '') + $(this).html();
		                    }else{
		                        value = index === 15 ? $(this).html() : parseInt((index === 0 ? '20' : '') + $(this).html().replace(/,/g, ''), 10);
		                    }
		                    if(index === 0){
		                        issue = value;
		                        data.issue = value;
		                    }else if(index === 9){
		                        data.jackpot = value;
		                    }else if(index === 10){
		                        data.prize1.count = value;
		                    }else if(index === 11){
		                        data.prize1.bonus = value
		                    }else if(index === 12){
		                        data.prize2.count = value;
		                    }else if(index === 13){
		                        data.prize2.bonus = value;
		                    }else if(index === 14){
		                        data.saleroom = value;
		                    }else if(index === 15){
		                        data.date = value;
		                    }
		                });
		                _listOfHistory[issue] = JSON.parse(JSON.stringify(data));
		            });
		            lc = getLengthAndCurrentIssue(_listOfHistory);
		            _listOfHistory.length = lc.length;
		            _listOfHistory.currentIssue = lc.currentIssue;

		            fs.writeFileSync(jsonFile, JSON.stringify(_listOfHistory, null, 4));
		        }
		    });
		}

		return Class({
	        init: function(){
	            this.currentIssue = _listOfHistory.currentIssue;
	            this.length = _listOfHistory.length;

			    this.indexes = {
			    	redBall6: { // red ball indexes
			    		// '08 11 28 29 31 33': 2017013
			    	},
			    	redBall5: { // five red ball indexes
			    		//
			    	},
			    	order: { // order indexes, 2003001 is 0
			    		// '100': 2017013
			    	},
			    	issue: { // issue indexes
			    		// '2017013': 100
			    	},
			    	issueNo: { // issue number Indexes
			    		// '013': [2017013]
			    	},
			    	fullDate: { // full date indexes
			    		// '2017-02-05': 2017013
			    	},
			    	year: { // year indexes
			    		// '2017': [2017013]
			    	},
			    	month: { // month indexes
			    		// '02': [2017013]
			    	},
			    	date: { // date indexes
			    		// '02-05': [2017013]
			    	},
			    	day: { // day indexes
			    		// '05': [2017013]
			    	},
			    	week: { // week indexes
			    		// 0: [2017013]
			    	}
			    };

	            utils.forEach(_listOfHistory, (item, key, index) => {
	                if(/[^\d]/.test(key)) return;

	                let redBalls = item.balls.replace(/\s+\d\d$/, '');
	                this._createIndexes('redBall6', redBalls, key, true);
	                utils.forEach(redBalls.split(/\s+/), ball => {
		                this._createIndexes('redBall5', redBalls.replace(ball, '00'), key, true);
		            });
	                this._createIndexes('order', index, key, true);
	                this._createIndexes('issue', key, index, true);
	                this._createIndexes('issueNo', key.substring(4), key);
	                
	                let $date = utils.dt.dateObject(item.date);
	                this._createIndexes('fullDate', item.date, key, true);
	                this._createIndexes('year', $date.getFullYear(), key);
	                this._createIndexes('month', utils.addZero($date.getMonth() + 1), key);
	                this._createIndexes('date', item.date.replace(/^\d{4}-/, ''), key);
	                this._createIndexes('day', utils.addZero($date.getDate()), key);
	                this._createIndexes('week', utils.dt.week(item.date), key);
	            });
	            fs.writeFileSync(__dirname + '/indexes.json', JSON.stringify(this.indexes));
	        },
	        _createIndexes: function(type, indexName, value, single){
	        	if(single){
	        		this.indexes[type][indexName] = value;
	        	}else{
		        	if(this.indexes[type][indexName] === undefined){
	                	this.indexes[type][indexName] = [value];
	                }else{
	                	this.indexes[type][indexName].push(value);
	                }
	            }
	        },
		    fetch: function(all = false, type = 'zcw'){
		        if(type === 'zcw'){
		            fetchHistoryFromZCW(all);
		        }else{
		            fetchHistoryFrom500(all);
		        }
	        },
	        getAll(){
	            let rs = [];
	            utils.forEach(this.indexes.order, (item, key, index) => {
	                rs.push(_listOfHistory[item]);
	            });
	            return rs;
	        },
	        getByOrder(start, end){// start from 0
	        	let issue;
	        	if(end === undefined){
	        		if(this.indexes.order[start] === undefined) return null;
	        		issue = this.indexes.order[start];
	        		return _listOfHistory.hasOwnProperty(issue) ? _listOfHistory[issue] : null;
	        	}else{
		            let rs = [];
		            for(; start <= end; start++){
		            	issue = this.indexes.order[start];
		            	let item = _listOfHistory[issue];
		            	if(item) rs.push(item);
		            }
		            return rs;
		        }
	        },
	        getByIssue(start, end){// 历史某一期 or 历史从某期到某期这个范围
	        	if(end === undefined){
		            return _listOfHistory.hasOwnProperty(start) ? _listOfHistory[start] : null;
	        	}else{
		            return this.getByOrder(this.indexes.issue[start], this.indexes.issue[end]);
		        }
	        },
	        getByIssueNo(issueNo){// 历史同期
	        	issueNo = utils.addZero(issueNo, 3);
	        	if(this.indexes.issueNo[issueNo] === undefined) return [];

	        	let rs = [];
	        	utils.forEach(this.indexes.issueNo[issueNo], issue => {
	        		let item = this.getByIssue(issue);
	        		if(item) rs.push(item);
	        	});
	        	return rs;
	        },
	        getByFullDate(start, end){// 某一天，或者从某一天到某一天
	        	let issue;
	        	if(end === undefined){
	        		if(this.indexes.fullDate[start] === undefined) return null;
	        		issue = this.indexes.fullDate[start];
	        		return _listOfHistory.hasOwnProperty(issue) ? _listOfHistory[issue] : null;
	        	}else{
	        		start = utils.dt.dateObject(start);
	        		end = utils.dt.dateObject(end);

	        		if(start <= end){
		        		let current = utils.dt.dateObject(this.getByIssue(this.currentIssue).date);
		        		if(start > current) return [];
		        		if(end > current) end = current;

		        		let startDate = start.format('%Y-%M-%D');
		        		let endDate = end.format('%Y-%M-%D');

	        			if(this.indexes.fullDate[startDate] === undefined){
	        				start.setDate(start.getDate() + 1);
	        				return this.getByFullDate(start.format('%Y-%M-%D'), endDate);
	        			}
	        			if(this.indexes.fullDate[endDate] === undefined){
	        				end.setDate(end.getDate() - 1);
	        				return this.getByFullDate(startDate, end.format('%Y-%M-%D'));
	        			}

	        			start = this.indexes.fullDate[startDate];
	        			end = this.indexes.fullDate[endDate];
	        			return this.getByIssue(start, end);
	        		}else{
	        			return [];
	        		}
	        	}
	        },
	        getByYear(year){// 历史同年
	        	if(this.indexes.year[year] === undefined) return [];

	            let rs = [];
	            utils.forEach(this.indexes.year[year], issue => {
	            	let item = this.getByIssue(issue);
	            	if(item) rs.push(item);
	            });
	            return rs;
	        },
	        getByMonth(month){// 01-12 历史同月
	        	month = utils.addZero(month);
	        	if(this.indexes.month[month] === undefined) return [];

	        	let rs = [];
	        	utils.forEach(this.indexes.month[month], issue => {
	        		let item = this.getByIssue(issue);
	        		if(item) rs.push(item);
	        	});
	        	return rs;
	        },
	        getByDate(date){// 01-01 ~ 12-31 历史同月日
	        	date = date.replace(/^[^\d]+|[^\d+]$/, '').split(/[^\d]+/);
	        	date[0] = utils.addZero(date[0]);
	        	date[1] = utils.addZero(date[1]);
	        	date = date.join('-');

	        	if(this.indexes.date[date] === undefined) return [];

	        	let rs = [];
	        	utils.forEach(this.indexes.date[date], issue => {
	        		let item = this.getByIssue(issue);
	        		if(item) rs.push(item);
	        	});
	        	return rs;
	        },
	        getByDay(day){// 01-31 历史同日
	        	day = utils.addZero(day);
	        	if(this.indexes.day[day] === undefined) return [];

	        	let rs = [];
	        	utils.forEach(this.indexes.day[day], issue => {
	        		let item = this.getByIssue(issue);
	        		if(item) rs.push(item);
	        	});
	        	return rs;
	        },
	        getByWeek(day){// 周二、周四、周日 历史同星期N
	        	var marks = [
	        		'周日 周一 周二 周三 周四 周五 周六'.split(' '),
	        		'星期日 星期一 星期二 星期三 星期四 星期五 星期六'.split(' ')
	        	];
	        	var markIndex = marks[0].indexOf(day);
	        	if(markIndex === -1){
	        		markIndex = marks[1].indexOf(day);
	        	}
	        	if(markIndex === -1) return [];
	        	if(this.indexes.week[markIndex] === undefined) return [];

	        	let rs = [];
	        	utils.forEach(this.indexes.week[markIndex], issue => {
	        		let item = this.getByIssue(issue);
	        		if(item) rs.push(item);
	        	});
	        	return rs;
	        },
	        getLastIssues(len, dependIssue){
	        	var rs = [], end, start;
	        	if(dependIssue === undefined || this.indexes.issue[dependIssue] === undefined){
	        		end = this.length - 1;
		        	start = this.length - len;
	        	}else{
	        		end = this.indexes.issue[dependIssue] - 1;
	        		start = end - len + 1;
	        	}
	        	for(; start <= end; start++){
	        		let issue = this.indexes.order[start];
	        		let item = _listOfHistory[issue];
	        		if(item) rs.push(item);
	        	}
	        	return rs;
	        },
	        nextIssue(){
	        	var days = [0,2,4];
	        	var lotteryDays = [];
	        	var lotteryIssues = [];
	        	var currentIssue = this.currentIssue;
	        	var year = utils.dt.dateObject().getFullYear();
	        	var d = utils.dt.dateObject(_listOfHistory[this.currentIssue].date);
	        	var i = 0;
	        	do{
	        		if(d.getFullYear() > year) break;
	        		if(days.indexOf(d.getDay()) > -1){
	        			let date = d.format('%Y-%M-%D');
		        		lotteryDays.push(date);
		        		lotteryIssues.push(currentIssue++);
		        	}
	        		i++;
	        		d.setDate(d.getDate() + 1);
	        	}while(i < 3);

	        	return {
	        		date: lotteryDays[1],
	        		issue: lotteryIssues[1]
	        	};
	        },
	        isOpened(redBall, types){
	        	redBall = redBall.replace(/,/g, ' ');
	        	let flag = false;

	        	if(types.indexOf('6') > -1){
		        	flag = this.indexes.redBall6[redBall] !== undefined;
		        }
	        	if(flag === false){
	        		if(types.indexOf('5') > -1){
		        		utils.forEach(redBall.split(/\s+/), ball => {
		        			if(this.indexes.redBall5[redBall.replace(ball, '00')] !== undefined){
		        				flag = true;
		        				return false;
		        			}
		        		});
		        	}
	        	}

	        	return flag;
	        }
	    });
	})();
	
	var $h = new History();

    var BasicQuantity = (function(){
        return Class({
            init(){},
            //
            /*
            * Basic Quantity
            本期期号%issue
            上期期号%prev1.issue = xxxxxxx
            上上期期号%prev2.issue = xxxxxxx
            前几期期号%prevs10.issue = []

            本期红一%red1
            上期红一%prev1.red1
            前几期期号%prevs2.red1 = []

            单期属性：
                期号 issue
                红一 red1
                红二 red2
                红三 red3
                红四 red4
                红五 red5
                红六 red6
                蓝球 blue
                年份 year
                月份 month
                日期 date
                星期 week

            */
        });
    })();

	var Lottery = (function(){
		return Class({
			init(str, issue){
	            this.issue = issue;
	            let balls = this.parseLottery(str);
	            this.blue = balls.blue;
	            this.reds = balls.reds;
	        },
	        parseLottery(str){
	            let balls = str.split(/\s+|,|\+/);
	            let blue = parseInt(balls.pop(), 10);
	            let reds = utils.map(balls, ball => {
	                return parseInt(ball, 10);
	            });
	            return {
	                blue,
	                reds
	            };
	        },
	        output(betweenRed = ',', beforeBlue = '+'){
	            return utils.map(this.reds, red => {
	                return utils.addZero(red);
	            }).join(betweenRed) + beforeBlue + utils.addZero(this.blue);
	        },
	        getAC(){
	            return utils.getAC(this.reds);
	        },
	        getAndValue(){
	            let rs = 0;
	            utils.forEach(this.reds, item => {
	                rs += item;
	            });
	            return rs;
	        },
	        getAverageValue(){
	            let rs = 0;
	            utils.forEach(this.reds, item => {
	                rs += item;
	            });
	            return Math.round(rs / this.reds.length);
	        },
	        get3AreaRate(){
	            let rate = utils.areaRate({
	                1: [ 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11],
	                2: [12,13,14,15,16,17,18,19,20,21,22],
	                3: [23,24,25,26,27,28,29,30,31,32,33]
	            }, this.reds);
	            return rate[1] + ':' + rate[2] + ':' + rate[3];
	        }
	    });
	})();

	var SSQFilter = (function(){
        var _conditions = {
            name: {
                name: 'name',
                quantity(){
                    //
                },
                condition(){
                    //
                }
            }
        };
        var _conditionIndexes = ['name'];

		return Class({
			init: function(data, conditions){
				this.nextIssue = $h.nextIssue();
				this.allCombs = utils.combination(data, 6);
				this.result = [];
			},
			start: function(){
				utils.forEach(this.allCombs.list, item => {
					var l = new Lottery(item + '+1', this.nextIssue);
					if(false){
						this.result.push(l.output());
					}
				});
			}
		});
	})();

	module.exports = {
		utils,
		Class,
		$h,
		BasicQuantity,
		Lottery,
		SSQFilter
	};

	// return;

	;(function(){
		utils.forEach($h.getAll(), item => {
			let l = new Lottery(item.balls, item.issue);

			console.log(l.output() + ' : ' + l.getAC() + ' : ' + l.getAndValue());
		});
	});

	// 从官方网站上获取历史数据
	;(function(){
	    $h.fetch(true);
	});

	// 统计某些条件下的历史数据
	;(function(){
	    // var list = $h.getByYear('2017');
	    var list = $h.getAll();
	    var total = 0;
	    utils.forEach(list, (item, index) => {
	        let lottery = new Lottery(item.balls, item.issue);
	        let ac = lottery.getAC();
	        let anv = lottery.getAndValue();
	        let areas3 = lottery.get3AreaRate();

	        if((function(){
	            return ac === 9 || ac === 8 || ac === 7 || ac === 6;
	        }()) && (function(){
	            // return !/0/.test(areas3);
	            return true;
	        }())){
	            total++;
	            console.log('%s-%s AC:%s AndValue:%s AverageValue:%s 3AreasRate:%s', lottery.issue, lottery.output(), ac, anv, lottery.getAverageValue(), areas3);
	        }
	    });
	    console.log(total + '/' + $h.length, (total / $h.length * 100).toFixed(0) + '%');
	});

	// 统计历史数据-AC值
	(function(){
	    var AC = {
	        0: 0,
	        1: 0,
	        2: 0,
	        3: 0,
	        4: 0,
	        5: 0,
	        6: 0,
	        7: 0,
	        8: 0,
	        9: 0,
	        10: 0
	    };
	    var list = $h.getAll();
	    utils.forEach(list, (item, index) => {
	        let lottery = new Lottery(item.balls, item.issue);
	        AC[lottery.getAC()]++;
	    });
	    console.log(list.length);
	    console.log(AC);
	});

	// 生成组合
	;(function(){
		var balls = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33];
		// var balls = [4,8,9,11,14,16,17,18,20,27];

		// kills
		utils.forEach([/*1,6,8,10,11,18,20,21,22,26,29,30,31*/], ball => {
    		let index = balls.indexOf(ball);
    		if(index > -1){
    			balls.splice(index, 1);
    		}
        });
	    var c = utils.combination(balls, 6);
	    var content = [];
	    var nextIssue = $h.nextIssue();
	    var prevData = $h.getLastIssues(1)[0];
	    var prevLottery = new Lottery(prevData.balls, prevData.issue);

	    var andValueScope = generateAndValueScope(nextIssue.issue);

	    utils.forEach(c.list, item => {
	        var l = new Lottery(item + '+01', nextIssue.issue);
	        if((function(){
	            let ac = l.getAC();
	            return ac === 9 || ac === 8 || ac === 7 || ac === 6;
	        }())/* && (function(){
	        	return andValueScope.indexOf(l.getAndValue()) > -1;
	        }())*/&& (function(){
	        	return l.getAndValue() === prevLottery.getAndValue() ? false : true;
	        }()) /*&& (function(){
	            let areas3 = l.get3AreaRate();

	            return areas3 === '1:1:4'
					|| areas3 === '1:2:3'
					|| areas3 === '1:3:2'
					|| areas3 === '1:4:1'
					|| areas3 === '2:1:3'
					|| areas3 === '2:2:2'
					|| areas3 === '2:3:1'
					|| areas3 === '3:1:2'
					|| areas3 === '3:2:1'
					|| areas3 === '4:1:1';
	        }()) */&& (function(){
	            return $h.isOpened(l.output(' ', ' ').replace(/\s+\d\d$/, ''), '5') ? false : true;
	        }())){
	            content.push(l.output());
	        }
	    });

	    fs.writeFileSync(__dirname + '/combs.txt', content.join('\n'));
	    fs.writeFileSync(__dirname + '/combs.json', JSON.stringify(content, null, 4));
	    fs.writeFileSync(__dirname + '/combs.js', 'var possibleLotteries = ' + JSON.stringify(content, null, 4) + ';\n');
	    console.log('combination is finished.');
	});

	function printLottery(lottery){
		let lotteries = utils.datatype(lottery) === 'array' ? lottery : [lottery];
		let counter = 0;
		utils.forEach(lotteries, l => {
	        let ac = l.getAC();
	        let anv = l.getAndValue();
	        let ave = l.getAverageValue();
	        let areas3 = l.get3AreaRate();
	        let andValuesText = '-';
	        if(l.andValues){
	        	let right = l.andValues[l.andValues.length - 1];
	        	let first = l.andValues[0];
	        	let last = l.andValues[l.andValues.length - 2];
	        	counter += right ? 1 : 0;
	        	andValuesText = utils.addZero(first, 3, ' ') + ' - ' + utils.addZero(last, 3, ' ') + '<' + utils.addZero(l.andValues.length - 1, 3, ' ') + '>' + ' | ' + (right ? 1 : 0);// l.andValues.join(',');
	        }

            console.log('%s | %s | AC:%s AndValue:%s(%s) | AverageValue:%s | 3AreasRate:%s', l.issue, l.output(), utils.addZero(ac, 2, ' '), utils.addZero(anv, 3, ' '), andValuesText, utils.addZero(ave, 2, ' '), areas3);
		});
		if(counter > 0){
			console.log('AndValue is in scope, total times: %s, right rate: %s', counter + '/' + lotteries.length, (counter / lotteries.length * 100).toFixed(2) + '%');
		}
	}
	function generateAndValueScope__old(dependIssue){
		let prevs = $h.getLastIssues(10, dependIssue);
		let andValues = [];
		let excludeAndValues = [];
		utils.forEach(prevs, prevItem => {
			let pl = new Lottery(prevItem.balls, prevItem.issue);
			let ands = [pl.getAndValue()];
			for(let i = 1; i <= 5; i++){
				ands.push(ands[0] + i);
				ands.push(ands[0] - i);
			}
			excludeAndValues.push(ands[0]);
			andValues = andValues.concat(ands);
		});
		andValues.sort((a, b) => {
			return a - b;
		});
		andValues = utils.unique(andValues);
		utils.forEach(excludeAndValues, avItem => {
			let index = andValues.indexOf(avItem);
			if(index > -1){
				andValues.splice(index, 1);
			}
		});

		return andValues;
	}
	function generateAndValueScope(dependIssue){
		let prevs = $h.getLastIssues(10, dependIssue);
		let andValues = [0, 0];
		// let excludeAndValues = [];
		utils.forEach(prevs, prevItem => {
			let pl = new Lottery(prevItem.balls, prevItem.issue);
			let av = pl.getAndValue();
			// excludeAndValues.push(av);
			andValues[0] = andValues[0] === 0 ? av : Math.min(andValues[0], av);
			andValues[1] = andValues[1] === 0 ? av : Math.max(andValues[1], av);
		});
		let init = andValues[0] - 1;
		let end  = andValues[1] + 1;
		andValues = [];
		for(; init <= end; init++){
			// if(excludeAndValues.indexOf(init) > -1) continue;
			andValues.push(init);
		}
		return andValues;
	}
	// 根据生成的结果(组合列表)，随机生成n条数据
	// 并且 查看属性
	;(function(){
		function randLotteries(data, len, cache, pos){
	        var rs = [], cachedIndexes = cache || [], index, dataLen = data.length;
	        var fn = function(){
	            index = utils.random(0, dataLen);
	            if(cachedIndexes.indexOf(index) > -1){
	                return fn();
	            }else{
	                return index;
	            }
	        };
	        var i;
	        if(cache){
	            for(i = 0; i < cache.length; i++){
	                rs.push(data[cache[i]]);
	            }
	        }
	        if(pos !== undefined){
	            index = fn();
	            cachedIndexes[pos] = index;
	            rs[pos] = data[index];
	        }else{
	            for(i = 0; i < len; i++){
	                index = fn();
	                cachedIndexes.push(index);
	                rs.push(data[index]);
	            }
	        }
	        return {
	            indexes: cachedIndexes,
	            lotteries: rs
	        };
	    }

		var jsonFile = __dirname + '/combs.json';
	    var list = utils.readJsonFile(jsonFile);
	    var rs = randLotteries(list, 1);
	    rs.lotteries = utils.map(rs.lotteries, item => {
	    	let blue = utils.random(1, 16);
	    	return item.replace(/\d\d$/, utils.addZero(blue));
	    });

	    fs.writeFileSync(__dirname + '/random.json', JSON.stringify(rs.lotteries, null, 4));

	    var nextIssue = $h.nextIssue().issue;
	    console.log('generate random lotteries: ');
	    printLottery(utils.map(rs.lotteries, item => {
	    	return new Lottery(item, nextIssue);
	    }));
	})();

	// 查看历史数据
	;(function(){
		var nextIssue = $h.nextIssue().issue;
		// var data = $h.getLastIssues(100);
		// var data = $h.getByYear(2017);
		var data = [
			'08,09,11,17,18,20+03'
		];
		console.log('view histories: ');
		printLottery(utils.map(utils.datatype(data) === 'array' ? data : [data], item => {
			// return new Lottery(item.balls, item.issue);
			return new Lottery(item, nextIssue);
		}));
	});

	// 验证： 历史前10期的和值，各自上下扩展5位，并且排除前10期的和值，即为围和
	;(function(){
		var nextIssue = $h.nextIssue().issue;
		// var data = $h.getByOrder($h.length - 2000, $h.length - 1);
		var data = $h.getByYear(2017);
		console.log('view histories: ');
		printLottery(utils.map(utils.datatype(data) === 'array' ? data : [data], item => {
			let andValues = generateAndValueScope(item.issue);
			let x = new Lottery(item.balls, item.issue);
			andValues.push(andValues.indexOf(x.getAndValue()) > -1);
			x.andValues = andValues;
			return x;
		}));
		// 取得前10期的和值（围和）
		let andValues = generateAndValueScope(nextIssue);
		console.log(nextIssue + ' Possible andValues: ' + andValues.join(','));
	});

	// 实验室
	;(function(){
		console.log(utils.combination(['05','10','17','19','29','32'], 4));
	});
})(
	require('fs'),
	require('superagent'),
	require('cheerio')
);
