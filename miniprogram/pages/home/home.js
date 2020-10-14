// miniprogram/pages/home/home.js
import { Util } from "../../util/util2";
const app = getApp();
const util = new Util();
Page({
  data: {
    loadAll: false,
    isLoading: false,
    sticker: [],
  },

  async onLoad(options) {
    await this.getData();
  },

  onReady: function () {},

  async onShow() {},

  async getData(start = 0) {
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
  onPullDownRefresh: function () {},
  onReachBottom() {
    const start = this.data.sticker.length;
    if (!this.data.loadAll) {
      this.getData(start);
    }
  },

  onShareAppMessage: function () {},
  demoTap() {
    wx.navigateTo({
      url: "../index/index",
    });
  },
  // 上传图片
  doUpload() {
    const that = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        wx.showLoading({
          title: "上传中",
        });

        const filePath = res.tempFilePaths[0];

        // 上传图片
        // const cloudPath = 'avatar/my-image' + filePath.match(/\.[^.]+?$/)[0]
        const cloudPath = "sticker/my-image_" + filePath.split(".")[2];
        console.log("filePath", filePath);
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
                  type: ["测试"],
                },
              })
              .then((res) => {
                wx.showToast({
                  icon: "none",
                  title: "上传成功，感谢❤",
                });
                that.getData();
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
      },
      fail: (e) => {
        console.error(e);
      },
    });
  },

  showRule(e) {
    this.setData({
      showRule: true,
    });
  },

  view(e) {
    const url = util.getDataSet(e, "url");
    wx.previewImage({
      current: 0,
      urls: [url],
    });
  },
});
