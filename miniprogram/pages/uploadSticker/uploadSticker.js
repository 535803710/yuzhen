// miniprogram/pages/uploadSticker/uploadSticker.js

import { Util } from "../../util/util2";
const util = new Util();
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    arr: [
      "https://656e-env-9eb476-1258886794.tcb.qcloud.la/images/tx4.jpg?sign=9817258738b68c534b35fbfc04bde928&t=1553372736",
      "https://656e-env-9eb476-1258886794.tcb.qcloud.la/images/tx2.jpg?sign=6e1e8eec2c2fc497e3b2ac03b367e770&t=1553372700",
      "https://656e-env-9eb476-1258886794.tcb.qcloud.la/images/tx3.jpg?sign=32821196ccfd12115af3d64dc7d67132&t=1553372724",
      "https://656e-env-9eb476-1258886794.tcb.qcloud.la/images/tx1.jpg?sign=ed14431dbf86a4d143841e695deaa9b2&t=1553372672",
    ],

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
  },

  onLoad: function (options) {
    console.log(app.globalData);
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
    this.onChangeTap(e)
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
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.emit('refersh', {data: true});
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

  async _upLoadImageToCloud(filePath) {
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    let random = Math.floor((Math.random()*1000)+1);
    const cloudPath =
      "sticker/my-image_" + app.globalData.userInfo.openid + "_" + timestamp + random;
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
