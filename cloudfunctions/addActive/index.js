// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database({
  env: "dev-85arv",
});
const active = db.collection("active");
const subActive = db.collection("subActive");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const res = await active.add({
    data: {
      name: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
      content: event.content,
      address:event.address,
      type:event.type,
      status:true,
      subscribeAbled: event.subscribeAbled,
      author:wxContext.OPENID,
      create_time: new Date(),
      delete_time: null,
      update_time: null,
    },
  });

  const subUser = await subActive
    .where({
      tmplIds: ["1IwA78zgg5RI1ZafkHduvJ6w8eHt2OrGoY2BmDJcQuI"],
    })
    .get();

  for (let i = 0; i < subUser.data.length; i++) {
    const el = subUser.data[i];
    console.log("el", el);
    try {
      cloud.openapi.subscribeMessage.send({
        touser: el.openid,
        page: "/pages/active/active",
        data: {
          thing1: {
            value: event.name,
          },
          thing2: {
            value: event.address,
          },
          thing3: {
            value: event.content,
          },
          time4: {
            value: event.startTime,
          },
        },
        templateId: "1IwA78zgg5RI1ZafkHduvJ6w8eHt2OrGoY2BmDJcQuI",
        // miniprogramState: "developer", //跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
      });
    } catch (error) {
      console.log(error);
    }
  }

  return {
    success: true,
    res,
  };
};
