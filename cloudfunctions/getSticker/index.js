// 云函数入口文件
const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database({
  env: "dev-85arv",
});
const sticker = db.collection("sticker");
const user_sticker = db.collection("user_sticker");

const _ = db.command;
const $ = db.command.aggregate;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  let res = {
    loadAll: false,
  };
  console.log("event", event);
  const start = +event.start || 0;
  const num = +event.num || 12;
  try {
    const { list } = await sticker
      .aggregate()
      .match({
        delete_time: null,
      })
      .sort({
        create_time: -1,
      })
      .skip(start)
      .limit(num)
      .lookup({
        from: "user_sticker",
        let: {
          sticker_id: "$_id",
          openid: wxContext.OPENID,
        },
        pipeline: $.pipeline()
          .match(
            //   {
            //   openid: wxContext.OPENID,
            //   sticker_id: "$$id",
            // }
            _.expr(
              $.and([
                $.eq(["$openid", "$$openid"]),
                $.eq(["$sticker_id", "$$sticker_id"]),
              ])
            )
          )
          .project({
            _id: 1,
            sticker_id: 1,
            openid: 1,
          })
          .done(),
        as: "like",
      })
      .end();
    // .where({
    //   delete_time: null,
    // })
    // .orderBy("create_time", "desc")
    // .skip(start)
    // .limit(num)
    // .get()

    // const { data } = await sticker
    //   .field({
    //     delete_time: false,
    //     update_time: false,
    //     create_time: false,
    //   })
    //   .where({
    //     delete_time: null,
    //   })
    //   .orderBy("create_time", "desc")
    //   .skip(start)
    //   .limit(num)
    //   .get();
    // console.log(data);
    if (list.length !== 12) {
      res.loadAll = true;
    }
    res.data = list;
  } catch (err) {
    res = err;
  }
  return res;
};
