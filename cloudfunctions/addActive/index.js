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

  
  return {
    success: true,
    res,
  };
};
