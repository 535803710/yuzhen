// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "dev-85arv",
});

const _ = db.command;
const $ = db.command.aggregate;

const user_sticker = db.collection("user_sticker");


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()


  const start = +event.start || 0;
  const num = +event.num || 9;
  let res = {
    loadAll: false,
    success:false
  };
  try {
    const { list } = await user_sticker
      .aggregate()
      .sort({ create_time: -1 })
      .match({
        delete_time: null,
        openid:wxContext.OPENID
      })
      .skip(start)
      .limit(num)
      .lookup({
        from: "sticker",
        let: {
          sticker_id: "$sticker_id",
        },
        pipeline: $.pipeline()
          .match(
            //   {
            //   openid: wxContext.OPENID,
            //   sticker_id: "$$id",
            // }
            _.expr(
              $.and([
                $.eq(["$_id", "$$sticker_id"]),
                $.eq(["$delete_time", null]),
              ])
            )
          )
          .project({
            _id: 1,
            urls:1,
            favour_num:1
          })
          .done(),
        as: "sticker",
      })
      .end();

    if (list.length !== 9) {
      res.loadAll = true;
    }
    let resList = []
    list.forEach(el => {
      if(el.sticker.length>0){
        resList.push(el)
      }
    });
    console.log(list);
    res.data = resList;
    res.success = true
  } catch (err) {
    res.errMsg = err;
  }


  return res;

}