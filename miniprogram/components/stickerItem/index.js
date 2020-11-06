// components/stickerItem/index.js
import { Util } from "../../util/util2";
const util = new Util();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object,
    big: Boolean,
    userInfo: Object,
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
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

    delete(){
      this.triggerEvent('delete')
    }

  
  },
});
