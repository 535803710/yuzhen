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
  },

  onLoad: function () {
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
  },

  async onShow() {
    console.log(Object.keys(app.globalData.userInfo).indexOf("nickName") !== -1);
    this.setData({
      login: Object.keys(app.globalData.userInfo).indexOf("nickName") !== -1,
    });
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
});
