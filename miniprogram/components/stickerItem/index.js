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
      const id = util.getDataSet(e, "id");

      console.log(e);
      console.log('getDataSet',id);
      let urls = [];
      url.forEach((el) => {
        urls.push(el.fileID);
      });
      wx.previewImage({
        current: 0,
        urls,
      });
      // wx.navigateTo({
      //   url: `/pages/detail/detail?id=${id}`,
      // });

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
      this.triggerEvent('like')
    },

    delete(){
      this.triggerEvent('delete')
    },

    goShare(){
      this.triggerEvent('share')
    }

  
  },
});
