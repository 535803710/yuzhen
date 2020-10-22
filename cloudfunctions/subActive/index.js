const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database({
  env: "dev-85arv",
});
const subActive = db.collection("subActive");
const active = db.collection("active");

exports.main = async (event, context) => {
  const { total } = await active.where({ delete_time: null }).count();
  const wxContext = cloud.getWXContext();
  const res = await subActive.add({
    data: {
      openid: wxContext.OPENID,
      page: "/pages/active/active", // 订阅消息卡片点击后会打开小程序的哪个页面
      templateId: event.templateId, // 订阅消息模板ID
      subActiveLength: total,
      done: false, // 消息发送状态设置为 false
    },
  });

  return res;
};
