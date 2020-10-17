// let log = require('../utils/log')

class Util {
  showToast(title, icon = "error", mask = false) {
    if (icon == "error") {
      var iconStyle = "color:#309BE2; size: 60";
    } else {
      iconStyle = "color:#309BE2; size: 60";
    }
    wx.lin.showToast({
      title,
      icon,
      iconStyle,
      mask,
    });
  }
  //校验正整数
  isInteger(number) {
    return number > 0 && String(number).split(".")[1] == undefined;
  }

  promisic(func) {
    return function (params = {}) {
      return new Promise((resolve, reject) => {
        const args = Object.assign(params, {
          success: (res) => {
            resolve(res);
          },
          fail: (error) => {
            reject(error);
          },
        });
        func(args);
      });
    };
  }

  checkPhone(phone) {
    if (!/^1[3456789]\d{9}$/.test(phone)) {
      return false;
    }
    return true;
  }
  // 获得当前格式化日期
  getNowFormatDate() {
    let date = new Date();
    let seperator1 = "-";
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    let currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
  }

  wxLogin() {
    return new Promise((resolve) => {
      this._wxLogin(resolve);
    });
  }

  //封装wx.login
  _wxLogin(resolve, reject) {
    wx.login({
      success: (res) => {
        resolve(res.code);
      },
    });
  }

  /*获得元素上的绑定的值*/
  getDataSet(event, key) {
    return event.currentTarget.dataset[key];
  }
  getDetailValue(event) {
    return event.detail.value;
  }

  //获取url的参数
  getvar(url, par) {
    let urlsearch = url.split("?");
    let pstr = urlsearch[1].split("&");
    for (let i = pstr.length - 1; i >= 0; i--) {
      let tep = pstr[i].split("=");
      if (tep[0] == par) {
        return tep[1];
      }
    }
    return false;
  }

  /**
   * 表情转码
   */
  utf16toEntities(str) {
    let patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则
    str = str.replace(patt, function (char) {
      let H, L, code;
      if (char.length === 2) {
        H = char.charCodeAt(0); // 取出高位
        L = char.charCodeAt(1); // 取出低位
        code = (H - 0xd800) * 0x400 + 0x10000 + L - 0xdc00; // 转换算法
        return "&#" + code + ";";
      } else {
        return char;
      }
    });
    return str;
  }

  /**
   *表情解码
   */
  uncodeUtf16(str) {
    let reg = /\&#.*?;/g;
    let result = str.replace(reg, function (char) {
      let H, L, code;
      if (char.length == 9) {
        code = parseInt(char.match(/[0-9]+/g));
        H = Math.floor((code - 0x10000) / 0x400) + 0xd800;
        L = ((code - 0x10000) % 0x400) + 0xdc00;
        return unescape("%u" + H.toString(16) + "%u" + L.toString(16));
      } else {
        return char;
      }
    });
    return result;
  }

  //数组分类
  /**
   *
   * @param {数组} data
   * @param {用什么分类} key
   * 返回形式
   * [{
   * item:[{}]
   * title:key[value]
   * }]
   */

  categoryArr(data, key) {
    let moth = [],
      flag = 0,
      list = data;
    let wdy = {
      title: "",
      [key]: "",
    };
    for (let i = 0; i < list.length; i++) {
      let az = "";
      for (let j = 0; j < moth.length; j++) {
        if (moth[j].title == list[i][key]) {
          flag = 1;
          az = j;
          break;
        }
      }
      if (flag == 1) {
        let ab = moth[az];
        ab.item.push(list[i]);
        flag = 0;
      } else if (flag == 0) {
        wdy = {};
        wdy.title = list[i][key];
        wdy.item = new Array();
        wdy.item.push(list[i]);
        moth.push(wdy);
      }
    }
    return moth;
  }

  //身份证校验
  checkID(id) {
    // 1 "验证通过!", 0 //校验不通过 // id为身份证号码
    let format = /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/;
    //号码规则校验
    if (!format.test(id)) {
      return { status: 0, msg: "身份证号码不合规" };
    }
    //区位码校验
    //出生年月日校验  前正则限制起始年份为1900;
    let year = id.substr(6, 4), //身份证年
      month = id.substr(10, 2), //身份证月
      date = id.substr(12, 2), //身份证日
      time = Date.parse(month + "-" + date + "-" + year), //身份证日期时间戳date
      now_time = Date.parse(new Date()), //当前时间戳
      dates = new Date(year, month, 0).getDate(); //身份证当月天数
    if (time > now_time || date > dates) {
      return { status: 0, msg: "出生日期不合规" };
    }
    //校验码判断
    let c = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); //系数
    let b = new Array("1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"); //校验码对照表
    let id_array = id.split("");
    let sum = 0;
    for (let k = 0; k < 17; k++) {
      sum += parseInt(id_array[k]) * parseInt(c[k]);
    }
    if (id_array[17].toUpperCase() != b[sum % 11].toUpperCase()) {
      return { status: 0, msg: "身份证校验码不合规" };
    }
    return { status: 1, msg: "校验通过" };
  }

  checkName(name) {
    let regName = /^[\u4e00-\u9fa5]{2,4}$/;
    if (!regName.test(name)) {
      return false;
    }
    return true;
  }
  /**
   * 检验是否有特殊字符 只能输入汉字和英文
   * @param  t
   */
  checkEmojoAndSpecial(substring) {
    if (substring) {
      let reg = new RegExp("[~#^$@%&!?%*]", "g");
      if (substring.match(reg)) {
        return false;
      }
      for (let i = 0; i < substring.length; i++) {
        let hs = substring.charCodeAt(i);
        if (0xd800 <= hs && hs <= 0xdbff) {
          if (substring.length > 1) {
            var ls = substring.charCodeAt(i + 1);
            let uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;
            if (0x1d000 <= uc && uc <= 0x1f77f) {
              return false;
            }
          }
        } else if (substring.length > 1) {
          var ls = substring.charCodeAt(i + 1);
          if (ls == 0x20e3) {
            return false;
          }
        } else {
          if (0x2100 <= hs && hs <= 0x27ff) {
            return false;
          } else if (0x2b05 <= hs && hs <= 0x2b07) {
            return false;
          } else if (0x2934 <= hs && hs <= 0x2935) {
            return false;
          } else if (0x3297 <= hs && hs <= 0x3299) {
            return false;
          } else if (
            hs == 0xa9 ||
            hs == 0xae ||
            hs == 0x303d ||
            hs == 0x3030 ||
            hs == 0x2b55 ||
            hs == 0x2b1c ||
            hs == 0x2b1b ||
            hs == 0x2b50
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  randomRange(myMin, myMax) {
    return Math.floor(Math.random() * (myMax - myMin + 1)) + myMin;
  }

  countTime(creatTime) {
    let nowDate = Date.parse(new Date());
    const format = creatTime.replace(/-/g, "/");
    let endDate = Date.parse(new Date(format)) + 1800000;
    let res = (endDate - nowDate) / 1000;
    return res;
  }

  ossImgSize(width, height) {
    return "?x-oss-process=image/resize,m_fill,w_" + width + ",h_" + height;
  }

  /**
   * 检查更新
   */
  updateManager() {
    if (!wx.canIUse("getUpdateManager")) {
      return;
    }
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      log.info("onCheckForUpdate", res);
      if (res.hasUpdate) {
        wx.showLoading({
          title: "正在更新新版本...",
          mask: true,
        });

        updateManager.onUpdateReady(function () {
          log.info("onUpdateReady", res);
          wx.hideLoading();
          wx.showModal({
            title: "更新提示",
            content: "新版本已经准备好，是否重启应用？",
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
              } else {
                // util2.showToast("您需要更新后才可使用新版本")
                updateManager.applyUpdate();
              }
            },
          });
        });

        updateManager.onUpdateFailed(function () {
          log.info("onUpdateFailed", res);
          wx.hideLoading();
          // util2.showToast('更新失败,请检查网络')
          // 新版本下载失败
        });

        setTimeout(() => {
          wx.hideLoading();
        }, 2000);
      }
    });
  }

  async downloadFile(data) {
    return new Promise((resolve, reject) => {
      if (Object.prototype.toString.call(data) !== "[object Object]") {
        reject("请传入对象");
        return;
      }
      let ary = Object.keys(data);
      let _obj = {};
      for (let i = 0; i < ary.length; i++) {
        wx.downloadFile({
          url: data[ary[i]], //需要下载的图片url
          success: (res) => {
            _obj[ary[i]] = res.tempFilePath;
            // 全部下载完成
            if (Object.keys(_obj).length === ary.length) {
              console.log("下载完成", _obj);
              resolve(_obj);
            }
          },
          fail: (err) => {
            reject(`图片下载失败`, ary[i]);
          },
        });
      }
    });
  }

  //时间戳转换
  changeUnixtime(unixtime) {
    var date = new Date(unixtime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    var d = date.getDate();
    d = d < 10 ? "0" + d : d;
    var h = date.getHours();
    h = h < 10 ? "0" + h : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    // return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;//年月日时分秒
    return y + "-" + m + "-" + d + " " + h + ":" + minute;
  }
}

export { Util };
