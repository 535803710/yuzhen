// components/addActive/index.js
const { Util } = require("../../util/util2");
const util = new Util();
Component({
  properties: {
    show:{
      type:Boolean,
      value:false,
    }
  },

  data: {
    minDate: new Date().getTime(),
    currentStartDate: new Date().getTime(),
    currentEndDate: "",
    minEndTime:'',

    chooseStartTime: false,
    chooseEndTime: false,
    startTime: "请选择开始时间",
    endTime: "请选择结束时间",

    name: "",
    subscribeAbled: false,
    content: "",
    address: "",
    type: "",
    submit:false
  },

  methods: {

    chooseStartTime(event) {
      this.setData({
        startTime: util.changeUnixtime(event.detail),
        minEndTime:event.detail
      });
    },
  
    chooseEndTime(event) {
      this.setData({
        endTime: util.changeUnixtime(event.detail),
      });
    },
  
    showTime(e) {
      const type = util.getDataSet(e, "type");
      if(type === 'chooseEndTime' && this.data.startTime === '请选择开始时间'){
        util.showToast('请先选择开始时间')
        return
      }
      console.log(e);
      this.setData({
        [type]: true,
      });
    },
  
    cancelStartTime() {
      this.setData({
        startTime: "请选择结束时间",
        chooseStartTime: false,
      });
    },
    cancelEndTime() {
      this.setData({
        endTime: "请选择结束时间",
        chooseEndTime: false,
      });
    },
    confirmTime() {
      this.setData({
        chooseStartTime: false,
        chooseEndTime: false,
      });
    },
    inputTitle(e) {
      this.setData({
        name: e.detail.value,
      });
    },
    inputType(e) {
      this.setData({
        type: e.detail.value,
      });
    },
    inputAddress(e) {
      this.setData({
        address: e.detail.value,
      });
    },
    inputContent(e) {
      this.setData({
        content: e.detail.value,
      });
    },
    changeSub(e) {
      this.setData({
        subscribeAbled: e.detail.value,
      });
    },
    verify() {
      const data = this.data;
      if (!data.name) {
        util.showToast("请输入名称");
        return false;
      } else if (data.startTime === "请选择开始时间") {
        util.showToast("请选择开始时间");
        return false;
      } else if (data.endTime === "请选择结束时间") {
        util.showToast("请选择开始时间");
        return false;
      } else if (!data.type) {
        util.showToast("请输入活动类型");
        return false;
      } else if (!data.address) {
        util.showToast("请输入活动地点");
        return false;
      }else if(!data.content){
        util.showToast("请输入活动内容");
        return false;
      }
      return true
    },
    async submit() {
      if(this.data.submit){
        return
      }
      if(!this.verify()){
        return
      }
      this.data.submit = true
      const { result } = await wx.cloud.callFunction({
        name: "addActive",
        data: {
          name: this.data.name,
          startTime: this.data.startTime,
          endTime: this.data.endTime,
          content: this.data.content,
          address: this.data.address,
          type: this.data.type,
          subscribeAbled: this.data.subscribeAbled,
        },
      });
      this.data.submit = false
      const that = this
      if(result.success){
        util.showToast('发布成功','success')
        setTimeout(() => {
         that.setData({
           show:false
         })
        }, 1500);
      }
    },
    cancelSubmit(){
      this.setData({
        show:false
      })
    }
  }
})
