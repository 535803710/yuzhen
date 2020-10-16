// miniprogram/pages/home/home.js
import { Util } from "../../util/util2";
const app = getApp();
const util = new Util();
let imgLoadNum = 0;

Page({
  data: {
    loadAll: false,
    isLoading: false,
    sticker: [],
    imgLoading: true,
    userInfo: "",
    isRefersh: false,

    tags: [
      {
        id: 0,
        text: "美丽",
        select: false,
      },
      {
        id: 1,
        text: "可爱",
        select: false,
      },
      {
        id: 2,
        text: "沙雕",
        select: false,
      },
      {
        id: 3,
        text: "黑怕",
        select: false,
      },
      {
        id: 4,
        text: "其它",
        select: false,
      },
    ],

    params: {
      text: "",
      tags: [],
      urls: [],
    },

    imgUrls: [],

    showUpload: false,
  },

  async onLoad(options) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    await this.getBanner();
    await this.getData();
    await this.getExamination();
    await this.getConfig()
    wx.hideLoading();
  },

  onReady: function () {},

  async onShow() {
    if (this.data.isRefersh) {
      await this.getData(0, true);
    }
    await this.onGetOpenid();
  },

  async getConfig(){
    const { result } = await wx.cloud.callFunction({
      name: "getConfig",
    });
    console.log(result);
    this.setData({
      config: result.data,
    });
  },
  async getBanner() {
    const { result } = await wx.cloud.callFunction({
      name: "getBanner",
    });
    this.setData({
      banner: result.data,
    });
  },
  async getData(start = 0, refersh = false) {
    if (refersh) {
      this.setData({
        sticker: [],
      });
    }
    this.setData({
      isLoading: true,
    });
    try {
      let sticker = this.data.sticker;
      const { result } = await wx.cloud.callFunction({
        name: "getSticker",
        data: {
          start,
        },
      });
      console.log(result);
      if (result.loadAll) {
        this.setData({
          loadAll: result.loadAll,
        });
      }
      sticker = sticker.concat(result.data);
      this.setData({
        sticker,
      });
    } catch (error) {
    } finally {
      this.setData({
        isLoading: false,
      });
    }
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function (e) {
    console.log(e);
  },
  onReachBottom() {
    const start = this.data.sticker.length;
    if (!this.data.loadAll) {
      this.getData(start);
    }
  },

  onShareAppMessage: function () {
    return{
      title:'让我看看还有谁没进来',
      imageUrl:"/images/share.jpg"
    }
  },
  demoTap() {
    wx.navigateTo({
      url: "../index/index",
    });
  },

  async likeImage(e) {
    const res = this._checkUserInfo();
    if (!res) {
      return;
    }
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
    this.setData({
      [`sticker[${index}].like`]: result.success ? [{ _id: id }] : [],
    });
  },

  goUpLoad() {
    this.setData({
      showUpload: true,
    });
    // wx.navigateTo({
    //   url: "/pages/uploadSticker/uploadSticker",
    //   events: {
    //     refersh(data) {
    //       console.log("goUpLoad", data);
    //       that.setData({
    //         isRefersh: data.data,
    //       });
    //     },
    //   },
    // });
  },
  showRule(e) {
    const res = this._checkUserInfo();
    if (!res) {
      return;
    }
    if (this.data.readRule) {
      this.goUpLoad();
    } else {
      this.setData({
        showRule: true,
      });
    }
  },

  view(e) {
    const res = this._checkUserInfo();
    if (!res) {
      return;
    }
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

  async getExamination() {
    const result = await wx.cloud.callFunction({
      name: "getExamination",
    });
    console.log(result);
  },

  async onGetOpenid() {
    // 调用云函数
    const { result } = await wx.cloud.callFunction({
      name: "login",
      data: { userInfo: {} },
    });
    console.log(result);
    this.setData({
      userInfo: result.data,
    });
    app.globalData.userInfo = result.data;
    let examination = result.data.examination;
    if (examination < 4) {
      wx.reLaunch({
        url: "../init/init",
      });
    }
  },

  imgLoad() {
    imgLoadNum += 1;
    if (imgLoadNum > 7) {
      this.setData({
        imgLoading: false,
      });
    }
  },

  readRule(e) {
    console.log(e);
    this.setData({
      readRule: e.detail.checked,
    });
  },

  async delete(e) {
    const index = util.getDataSet(e, "index");
    const item = util.getDataSet(e, "item");
    console.log(index);
    const res = await wx.cloud.callFunction({
      name: "updateSticker",
      data: {
        type: "delete",
        id: item._id,
      },
    });
    if (res.errMsg === "cloud.callFunction:ok") {
      wx.showToast({
        title: "删除成功",
        icon: "none",
        duration: 1500,
        mask: false,
      });
      const a = `sticker[${index}].delete`;
      this.setData({
        [a]: true,
      });
    }
  },

  _checkUserInfo() {
    if (Object.keys(this.data.userInfo).indexOf("nickName") === -1) {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        duration: 1500,
        mask: false,
      });
      setTimeout(() => {
        wx.switchTab({
          url: "/pages/my/my",
        });
      }, 2000);
      return false;
    }
    return true;
  },

  showLikeRule() {
    wx.showToast({
      title: "长按图片点赞或取消",
      icon: "none",
      duration: 2000,
      mask: false,
    });
  },

  onSelect(e) {
    const index = util.getDataSet(e, "index");
    const a = `tags[${index}].select`;
    const text = this.data.tags[index].text;
    this.setData({
      [a]: !this.data.tags[index].select,
    });
    let tags = this.data.params.tags;

    let hadTag = -1;
    tags.forEach((e, index) => {
      if (e === text) {
        hadTag = index;
      }
    });
    if (hadTag === -1) {
      tags.push(text);
    } else {
      tags.splice(hadTag, 1);
    }

    this.setData({
      ["params.tags"]: tags,
    });
  },

  onChangeTap(e) {
    let urls = [];
    const all = e.detail.all;
    all.forEach((el) => {
      if (!el.overSize) {
        urls.push(el);
      }
    });
    this.setData({
      imgUrls: urls,
    });
  },

  removeImage(e) {
    this.onChangeTap(e);
  },

  input(e) {
    this.setData({
      ["params.text"]: e.detail.value,
    });
  },

  oversize(e) {
    console.log(e);
    wx.showToast({
      icon: "none",
      title: "抱歉,图片超出限制大小",
      duration: 2000,
      mask: false,
    });
  },

  verify() {
    const params = this.data.params;
    if (params.urls.length === 0) {
      wx.showToast({
        title: "请上传图片",
        icon: "none",
        duration: 2000,
        mask: false,
      });
      return false;
    }
    if (params.tags.length === 0) {
      wx.showToast({
        title: "请选择标签",
        icon: "none",
        duration: 2000,
        mask: false,
      });
      return false;
    }
    return true;
  },

  async submit() {
    wx.showLoading({
      title: "上传中...",
      mask: true,
    });
    try {
      let urls = [];
      const imgUrls = this.data.imgUrls;
      for (let i = 0; i < imgUrls.length; i++) {
        const el = imgUrls[i];
        if (!el.overSize) {
          const res = await this._upLoadImageToCloud(el.url);
          console.log(res);
          urls.push(res);
        }
      }
      console.log("urls", urls);
      this.setData({
        ["params.urls"]: urls,
      });

      const verify = this.verify();
      if (!verify) {
        return;
      }
      const { result } = await wx.cloud.callFunction({
        name: "addSticker",
        data: this.data.params,
      });
      if (result.data) {
        wx.showToast({
          title: "上传成功，感谢❤",
          duration: 2000,
          mask: true,
        });
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.emit("refersh", { data: true });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          });
        }, 2000);
      }
    } finally {
      wx.hideLoading();
    }
  },

  cancel() {
    this.setData({
      showUpload: false,
    });
  },

  async _upLoadImageToCloud(filePath) {
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    let random = Math.floor(Math.random() * 1000 + 1);
    const cloudPath =
      "sticker/my-image_" +
      app.globalData.userInfo.openid +
      "_" +
      timestamp +
      random;
    console.log(cloudPath);
    const res = await wx.cloud.uploadFile({
      filePath,
      cloudPath,
      // success: (res) => {
      //   console.log("[上传文件] 成功：", res);
      //   return {
      //     fileID: res.fileID,
      //     cloudPath,
      //     filePath
      //   }
    });
    console.log("res", res);
    return {
      fileID: res.fileID,
      cloudPath,
    };
  },

  // 上传图片
  doUpload() {
    const that = this;
    // 选择图片
    let filePath = "";
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        wx.showLoading({
          title: "上传中",
        });

        filePath = res.tempFilePaths[0];
        // 上传图片
        // const cloudPath = 'avatar/my-image' + filePath.match(/\.[^.]+?$/)[0]

        let timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        const cloudPath =
          "sticker/my-image_" + that.data.userInfo.openid + "_" + timestamp;
        console.log("cloudPath", cloudPath);
        wx.getFileInfo({
          filePath,
          success: (res) => {
            console.log("getFileInfo", res);
            if (res.size > 2048000) {
              wx.showToast({
                title: "抱歉图片太大,限制2mb",
                icon: "none",
                duration: 2000,
              });
            } else {
              wx.cloud.uploadFile({
                cloudPath,
                filePath,
                success: (res) => {
                  console.log("[上传文件] 成功：", res);

                  app.globalData.fileID = res.fileID;
                  app.globalData.cloudPath = cloudPath;
                  app.globalData.imagePath = filePath;
                  wx.cloud
                    .callFunction({
                      name: "addSticker",
                      data: {
                        fileID: res.fileID,
                        cloudPath,
                        filePath,
                        type: ["内测"],
                      },
                    })
                    .then((res) => {
                      wx.showToast({
                        icon: "none",
                        title: "上传成功，感谢❤",
                      });

                      that.getData(0, true);
                    });
                },
                fail: (e) => {
                  console.error("[上传文件] 失败：", e);
                  wx.showToast({
                    icon: "none",
                    title: "上传失败",
                  });
                },
                complete: () => {
                  wx.hideLoading();
                },
              });
            }
          },
          fail: (err) => {
            wx.showToast({
              title: "上传失败",
              duration: 2000,
            });
          },
        });
      },
      fail: (e) => {
        console.error(e);
      },
      complete: () => {
        // wx.hideLoading();
      },
    });

    console.log(filePath);
  },
});
