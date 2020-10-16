// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: "dev-85arv",
});
const banner = db.collection("banner");

// 云函数入口函数
exports.main = async (event, context) => {
  const res = await banner.get()
  console.log(res);
  return res
}