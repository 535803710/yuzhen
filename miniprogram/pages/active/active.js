const { Util } = require("../../util/util2");
const util  = new Util()

// miniprogram/pages/active/active.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    active: [],
  },

  onLoad: function (options) {},
  onReady: function () {},
  async onShow() {
    await this.getActive()
  },

  onPullDownRefresh: function () {},

  onReachBottom: function () {},
  onShareAppMessage: function () {},

  async addActive() {
    const { result } = await wx.cloud.callFunction({
      name: "addActive",
      data: {
        name: "VAS@VasLive瓦肆现场",
        startTime: "2020-10-18",
        endTime: "2020-10-18",
        content: "rosedoggy演出嘉宾土豆老师@于贞Ingrita敬请期待！",
        address: "上海BUDX",
        type: "现场嘉宾",
        subscribeAbled: true,
      },
    });
    console.log(result);
  },

  async getActive() {
    const { result } = await wx.cloud.callFunction({
      name: "getActive",
      data: { start: 0 },
    });

    result.data.forEach((el) => {
      el.create_time = new Util().changeUnixtime(Date.parse(el.create_time));
    });

    console.log(result);
    this.setData({
      active: result.data,
    });
  },

  sub(e){
    const item = util.getDataSet(e,'item')
    console.log(item);
  }
});
