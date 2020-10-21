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

  async onLoad(options) {
    await this.getActive();
    this.setData({
      userInfo: app.globalData.userInfo,
    });
  },
  onReady: function () {},
  async onShow() {
    
  },

  async onPullDownRefresh(e) {
    console.log("eeee", e);
    this.setData({
      active: [],
      loadAll: false,
      start: 0,
    });

    await this.getActive();
  },

  onReachBottom: function () {
    this.getActive();
  },
  onShareAppMessage: function () {
    return {
      title: "来看看于贞最近在做什么?",
    };
  },

  async addActive() {
    this.setData({
      showAdd: true,
    });
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

  async sub(e) {
    // const item = util.getDataSet(e, "item");
    // console.log(item);
    wx.requestSubscribeMessage({
      tmplIds: ["1IwA78zgg5RI1ZafkHduvJ6w8eHt2OrGoY2BmDJcQuI"],
      success(res) {
        console.log(res);
        wx.cloud.callFunction({
          name: "subActive",
          data: { tmplIds: ["1IwA78zgg5RI1ZafkHduvJ6w8eHt2OrGoY2BmDJcQuI"] },
        });
      },
      fail(err){
        console.log('fail');
        console.log('fail',err);
      }
    });
    // const res =await this.promiseSetting();

  
  },

  promiseSetting() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        withSubscriptions: true,
        success: (res) => {
          console.log(res);
          console.log(
            res.subscriptionsSetting.itemSettings[
              "1IwA78zgg5RI1ZafkHduvJ6w8eHt2OrGoY2BmDJcQuI"
            ]
          );
          if (
            res.subscriptionsSetting.itemSettings[
              "1IwA78zgg5RI1ZafkHduvJ6w8eHt2OrGoY2BmDJcQuI"
            ] === "reject"
          ) {
            resolve(false);
          }else{
            resolve(true);
          }
        },
        fail: () => {},
        complete: () => {},
      });
    });
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
