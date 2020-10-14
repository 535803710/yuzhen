// miniprogram/pages/init/init.js

import { Util } from "../../util/util2";
const util = new Util();
const app = getApp();

Page({
  data: {
    examination: false,
    answers: ["", "", "", "", ""],
  },

  async onLoad(options) {
    await this.onGetOpenid();
  },
  onReady: function () {},

  onShow: function () {
    this.getExamination();
  },

  async getExamination() {
    const { result } = await wx.cloud.callFunction({
      name: "getExamination",
    });
    console.log(result);
    this.setData({
      examinationList: result.data,
    });
  },

  async onGetOpenid() {
    // 调用云函数
    const { result } = await wx.cloud.callFunction({
      name: "login",
      data: { userInfo: {} },
    });
    console.log(result);
    let examination =result.data.examination;
    if (examination > 3) {
      this.setData({
        examination: true,
      });
    }
  },

  change(e) {
    const index = util.getDataSet(e, "index");
    const answer = e.detail.key;

    console.log("index", index);
    console.log("answer", answer);
    let answers = this.data.answers;
    answers[index] = answer;
    this.setData({
      answers,
    });
  },

  async submit() {
    const { result } = await wx.cloud.callFunction({
      name: "submitExamination",
      data: {
        answers: this.data.answers,
      },
    });
    if(result>3){
      wx.showToast({
        title: '恭喜你，你的分数是'+result*20,
        icon: 'success',
        duration: 1500,
        mask: true,
        success: (result)=>{
          wx.switchTab({
            url: '/pages/home/home',
          });
        },
      });
    }else{
      wx.showToast({
        title: '抱歉，你的分数是'+result*20+"，去检查一下",
        duration: 1500,
        mask: true,

      });
    }
  },
});
