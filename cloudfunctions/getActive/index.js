// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database({
  env: "dev-85arv",
});
const active = db.collection("active");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const start = +event.start;
  const num = +event.num || 10;
  let res = {
    loadAll: false,
  };
  const { data } = await active
    .field({
      delete_time: false,
      update_time: false,
    })
    .where({
      delete_time: null,
    })
    .orderBy("create_time", "desc")
    .skip(start)
    .limit(num)
    .get();

  res.data = data;
  console.log(data);
  if (data.length < num) {
    res.loadAll = true;
  }
  return res;
};
