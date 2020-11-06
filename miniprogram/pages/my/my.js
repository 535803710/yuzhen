import { Util } from "../../util/util2";
const util = new Util();

const app = getApp();

Page({
  data: {
    avatarUrl: "./user-unlogin.png",
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: "",
    login: false,
    showCollapse: ["1"],
    mySticker: [],
  },

  async onLoad() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: "../chooseLib/chooseLib",
      });
      return;
    }

    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              });
              // console.log(Object.keys(res.userInfo).length);
              // if (Object.keys(res.userInfo).length > 0) {
              //   this.setData({
              //     login: true,
              //   });
              // }
            },
          });
        } else {
          console.log(res);
        }
      },
    });

    await this.getMyFavour();
  },

  async onShow() {
    console.log(
      Object.keys(app.globalData.userInfo).indexOf("nickName") !== -1
    );
    this.setData({
      login: Object.keys(app.globalData.userInfo).indexOf("nickName") !== -1,
    });
    await this.getConfig();
    this.setData({
      switch: app.globalData.userInfo.openid === "okIoi5exrIzma3K-ZVWCSvAWo9FA",
    });
    console.log(app.globalData.userInfo);
  },

  async onPullDownRefresh(e) {
    console.log(e);
    wx.showLoading({
      title: "加载中...",
      mask: true,
    });
    this.data.mySticker = []
    this.data.loadAll = false
    await this.getMyFavour();
    wx.hideLoading();
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
      });
    }
  },

  getUserInfo(res) {
    const userInfo = (res && res.detail.userInfo) || null;
    if (!userInfo) {
      return;
    }
    wx.cloud
      .callFunction({
        name: "login",
        data: { userInfo },
      })
      .then((res) => {
        console.log("getUserInfo", res);
        this.setData({
          login: true,
        });
      });
  },

  onGetOpenid: function () {
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    // 调用云函数
    wx.cloud.callFunction({
      name: "login",
      data: {},
      success: (res) => {
        console.log("[云函数] [login] user openid: ", res.result.openid);
        app.globalData.openid = res.result.openid;
        this.setData({
          login: true,
        });
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: (err) => {
        console.error("[云函数] [login] 调用失败", err);
        wx.navigateTo({
          url: "../deployFunctions/deployFunctions",
        });
      },
      complete: (e) => {
        wx.hideLoading();
      },
    });
  },

  async uploadSwitch(e) {
    console.log(e);
    await wx.cloud.callFunction({
      name: "getConfig",
      data: {
        config: e.detail.value,
      },
    });
  },

  async getConfig() {
    const { result } = await wx.cloud.callFunction({
      name: "getConfig",
    });
    this.setData({
      config: result.data,
    });
  },

  async getMyFavour() {
    if (this.data.loadAll) {
      return;
    }
    wx.showLoading({
      title: "加载中...",
      mask: true,
    });
    const { result } = await wx.cloud.callFunction({
      name: "getMyFavour",
      data: {
        start: this.data.mySticker.length,
      },
    });
    let mySticker = this.data.mySticker.concat(result.data);
    this.setData({
      mySticker,
      loadAll: result.loadAll,
    });
    wx.hideLoading();
  },

  async likeImage(e) {
    console.log(e);
    wx.showLoading({
      title: "加载中...",
      mask: true,
    });
    const id = util.getDataSet(e, "id");
    const index = util.getDataSet(e, "index");
    console.log(id);
    const { result } = await wx.cloud.callFunction({
      name: "like",
      data: {
        type: "like",
        id,
      },
    });
    let title = "";
    if (result.success) {
      title = "点赞成功❤";
    } else {
      title = "取消点赞";
    }
    wx.showToast({
      title,
      icon: "none",
      duration: 1500,
      mask: false,
    });
    const num = +this.data.mySticker[index].sticker[0].favour_num;
    console.log('num',num);
    this.setData({
      [`mySticker[${index}].like`]: !this.data.mySticker[index].like,
      [`mySticker[${index}].sticker[0].favour_num`]: result.success ? num + 1 : num - 1,
    });
  },

  view(e) {
    const url = util.getDataSet(e, "url");
    console.log(url);
    let urls = [];
    url.forEach((el) => {
      urls.push(el.fileID);
    });
    wx.previewImage({
      current: 0,
      urls,
    });
  },
});
