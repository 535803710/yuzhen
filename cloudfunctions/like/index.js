// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database({
  env: "dev-85arv",
});
const _ = db.command;
const user_sticker = db.collection("user_sticker");
const sticker = db.collection("sticker");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const id = event.id;
  const type = event.type;

  let msg = "";
  let success = false;
  console.log(id);
  const res = await user_sticker
    .where({
      sticker_id: id,
      openid: wxContext.OPENID,
    })
    .get();
    console.log('res',res);
  if (res.data.length === 0) {
    const addres = await user_sticker.add({
      data: {
        sticker_id: id,
        openid: wxContext.OPENID,
        like: true,
        create_time: new Date(),
        delete_time: null,
        update_time: null,
      },
    });
    console.log("addres", addres);
    const updateres = await sticker.doc(id).update({
      data: {
        favour_num: _.inc(1),
      },
    });
    console.log("updateres", updateres);

    msg = "点赞成功";
    success = true;
  } else {
    const removeRes = await user_sticker.where({
      openid:wxContext.OPENID,
      sticker_id: id,
    }).remove()
    console.log('res',removeRes);
    msg = "你已经点过赞了";
  }
  return {
    msg,
    success,
  };

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
