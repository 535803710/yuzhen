const { Util } = require("../../util/util2");
const util = new Util();
var app = getApp();

// miniprogram/pages/active/active.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    active: [],

    minDate: new Date().getTime(),
    currentStartDate: new Date().getTime(),
    currentEndDate: "",

    chooseStartTime: false,
    chooseEndTime: false,
    startTime: "请选择开始时间",
    endTime: "请选择结束时间",

    start: 0,
    loadAll: false,
  },

  onLoad: function (options) {},
  onReady: function () {},
  async onShow() {
    await this.getActive();
    this.setData({
      userInfo: app.globalData.userInfo,
    });
  },

  onPullDownRefresh: function () {
    this.setData({
      active: [],
      loadAll: false,
      start: 0,
    });
  },

  onReachBottom: function () {
    this.getActive();
  },
  onShareAppMessage: function () {},

  async addActive() {
    wx.navigateTo({
      url: "/pages/addActive/addActive",
    });
    // const { result } = await wx.cloud.callFunction({
    //   name: "addActive",
    //   data: {
    //     name: "VAS@VasLive瓦肆现场",
    //     startTime: "2020-10-18",
    //     endTime: "2020-10-18",
    //     content: "rosedoggy演出嘉宾土豆老师@于贞Ingrita敬请期待！",
    //     address: "上海BUDX",
    //     type: "现场嘉宾",
    //     subscribeAbled: true,
    //   },
    // });
    // console.log(result);
  },

  async getActive() {
    if (this.data.loadAll) {
      return;
    }
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    const { result } = await wx.cloud.callFunction({
      name: "getActive",
      data: { start: this.data.active.length },
    });

    result.data.forEach((el) => {
      el.create_time = new Util().changeUnixtime(Date.parse(el.create_time));
      el.activeStatus = this._overdue(el.startTime, el.endTime);
    });

    let active = this.data.active.concat(result.data);
    this.setData({
      active,
      loadAll: result.loadAll,
    });
    wx.hideLoading();
  },

  sub(e) {
    const item = util.getDataSet(e, "item");
    console.log(item);
  },
  _overdue(startTime, endTime) {
    const date1 = new Date(startTime);
    const start = Date.parse(date1);

    const date2 = new Date(endTime);
    const end = Date.parse(date2);

    const nowDate = new Date();
    const now = Date.parse(nowDate);

    if (now > start && now < end) {
      return "进行中";
    } else if (now < start) {
      return "未开始";
    } else {
      return "已结束";
    }
  },

  chooseStartTime(event) {
    this.setData({
      startTime: event.detail,
    });
  },

  chooseEndTime(event) {
    this.setData({
      endTime: event.detail,
    });
  },

  showTime(e) {
    const type = util.getDataSet(e, "type");
    console.log(e);
    this.setData({
      [type]: true,
    });
  },
});
