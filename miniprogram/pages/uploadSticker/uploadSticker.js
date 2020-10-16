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


});
