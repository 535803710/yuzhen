// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database({
  env: "dev-85arv",
});
const subActive = db.collection("subActive");
const active = db.collection("active");
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { total } = await active.where({delete_time:null}).count();
  const subUser = await subActive
    .where({
      done: false,
      subActiveLength: _.lt(total),
    })
    .get();

  console.log("subUser", subUser);
  const lastActive = await active.skip(total - 1).get();
  for (let i = 0; i < subUser.data.length; i++) {
    const el = subUser.data[i];
    const content = lastActive.data[0].content.substring(0, 15) + "...";
    const time = new Date(lastActive.data[0].startTime);
    console.log("el", el);
    console.log("content", content);
    console.log("lastActive", lastActive.data[0]);
    try {
      const res = await cloud.openapi.subscribeMessage.send({
        touser: el.openid,
        page: "/pages/active/active",
        lang: "zh_CN",
        data: {
          thing1: {
            value: lastActive.data[0].name,
          },
          thing2: {
            value: lastActive.data[0].address,
          },
          thing3: {
            value: content,
          },
          time4: {
            value: lastActive.data[0].startTime,
          },
        },
        templateId: el.templateId,
        // miniprogramState: 'developer'
      });
      console.log("subscribeMessage", res);
      return await subActive.doc(el._id).update({
        data: {
          done: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  return true;
};
