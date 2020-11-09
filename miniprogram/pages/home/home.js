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
    pageNum: 0,

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
    clearImgs: false,

    stickerType: "new",
    key: "all",
    scrollTop: undefined,
  },

  async onLoad(options) {
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    await this.getBanner();
    await this.getData();
    await this.getExamination();
    await this.getConfig();
    wx.hideLoading();
  },

  onReady: function () {},

  async onShow() {
    if (this.data.isRefersh) {
      await this.getData(0, true);
    }
    await this.onGetOpenid();
  },

  async getConfig() {
    const { result } = await wx.cloud.callFunction({
      name: "getConfig",
    });
    console.log(result);
    this.setData({
      config: result.data,
    });
    // this.setData({
    //   config: +this.data.userInfo.examination > 3,
    // });
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
        loadAll: false,
      });
    }
    if(this.data.isLoading){
      return
    }
    try {
      this.setData({
        isLoading: true,
      });
      let sticker = this.data.sticker;
      const { result } = await wx.cloud.callFunction({
        name: "getSticker",
        data: {
          openid:this.data.userInfo.openid,
          start,
          num: 9,
          type: this.data.stickerType,
          key: this.data.key,
        },
      });
      console.log(result);
      if (!result.success) {
        util.showToast("慢点慢点,你刷的太快了");
      }
      if (result.loadAll) {
        this.setData({
          loadAll: result.loadAll,
        });
      }
      this.data.pageNum = this.data.pageNum + 1;
      const resArr = this._processSticker(result.data, this.data.pageNum);
      sticker = sticker.concat(resArr);

      this.setData({
        sticker,
      });
    } catch (error) {
    } finally {
      setTimeout(() => {
        this.setData({
          isLoading: false,
        });
      }, 1000);
    }
  },
  onHide: function () {},
  onUnload: function () {},
  async onPullDownRefresh(e) {
    wx.showLoading({
      title: "加载中...",
      mask: true,
    });
    await this.getData(0, true);
    wx.hideLoading();
  },
  onReachBottom() {
    const start = (this.data.sticker.length / 2) * 9;
    if (!this.data.loadAll) {
      this.getData(start);
    }
  },

  onShareAppMessage: function () {
    return {
      title: "让我看看还有谁没进来",
      imageUrl: "/images/share.jpg",
    };
  },

  _processSticker(array, pageNum) {
    console.log("_processSticker-into", array);
    let resArr = [];
    let firstArr = [];
    let secondArr = [];
    for (let i = 0; i < array.length; i++) {
      const el = array[i];
      if (i < 3) {
        firstArr.push(el);
      } else {
        secondArr.push(el);
      }
    }
    if (pageNum % 2 === 0) {
      firstArr[0].big = true;
    } else {
      if (firstArr.length === 3) {
        firstArr[2].big = true;
      }
    }
    resArr.push(firstArr);
    resArr.push(secondArr);
    return resArr;
  },
  demoTap() {
    wx.navigateTo({
      url: "../index/index",
    });
  },

  async likeImage(e) {
    console.log(e);
    const res = this._checkUserInfo();
    if (!res) {
      return;
    }
    wx.showLoading({
      title: "加载中...",
      mask: true,
    });
    const id = util.getDataSet(e, "id");
    const ondeindex = util.getDataSet(e, "ondeindex");
    const twoindex = util.getDataSet(e, "twoindex");
    console.log(id);
    console.log(ondeindex);
    console.log(twoindex);
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
    wx.hideLoading();
    wx.showToast({
      title,
      icon: "none",
      duration: 1500,
      mask: false,
    });
    const num = +this.data.sticker[ondeindex][twoindex].favour_num;
    console.log(num);
    this.setData({
      [`sticker[${ondeindex}][${twoindex}].like`]: result.success ? [{ _id: id }] : [],
      [`sticker[${ondeindex}][${twoindex}].favour_num`]: result.success ? num + 1 : num - 1,
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
  
  viewItem(e){
    const url = util.getDataSet(e, "url");
    wx.previewImage({
      current: 0,
      urls:[url],
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

  showDelete(e){
    console.log('showDelete',e);
    const ondeindex = util.getDataSet(e, "ondeindex");
    const twoindex = util.getDataSet(e, "twoindex");
    const item = util.getDataSet(e, "item");
    this.setData({
      showDelete:true,
      deleteItem:item,
      ondeindex,
      twoindex
    })
  },
  async delete(e) {
    console.log(e);
    const ondeindex = this.data.ondeindex;
    const twoindex = this.data.twoindex;
    const item = this.data.deleteItem;
    const res = await wx.cloud.callFunction({
      name: "updateSticker",
      data: {
        type: "delete",
        id: item._id,
      },
    });
    if (true || res.errMsg === "cloud.callFunction:ok") {
      wx.showToast({
        title: "删除成功",
        icon: "none",
        duration: 1500,
        mask: false,
      });
      const a = `sticker[${ondeindex}][${twoindex}].delete`;
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
          icon: "none",
          duration: 2000,
          mask: true,
        });
        // const eventChannel = this.getOpenerEventChannel();
        // eventChannel.emit("refersh", { data: true });
        // setTimeout(() => {
        //   wx.navigateBack({
        //     delta: 1,
        //   });
        // }, 2000);
        this.setData({
          showUpload: false,
          clearImgs: true,
        });
        this.getData(0, true);
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

  chooseHot() {
    if (this.data.stickerType === "hot") {
      return;
    }
    this.setData({
      stickerType: "hot",
    });
    this.getData(0, true);
  },
  async chooseNew() {
    if (this.data.stickerType === "new") {
      return;
    }
    this.setData({
      stickerType: "new",
    });
    wx.showLoading({
      title: "加载中...",
      mask: true,
    });
    await this.getData(0, true);
    wx.hideLoading();
  },

  async changeTabs(e) {
    if (this.data.isLoading || this.data.key === e.detail.activeKey) {
      return;
    }
    wx.showLoading({
      title: "加载中...",
      mask: true,
    });
    console.log(e);
    const key = e.detail.activeKey;
    this.setData({
      key,
    });
    await this.getData(0, true);
    wx.hideLoading();
  },

  onPageScroll(res) {
    this.setData({
      scrollTop: res.scrollTop,
    });
  },
});
