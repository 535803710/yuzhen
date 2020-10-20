// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'dev-85arv'
})
const _ = db.command
const sticker = db.collection('sticker')
// 云函数入口函数
exports.main = async (event, context) => {
  let res = ''
  try {
    const {data} = await sticker.field({
      delete_time: false,
      update_time: false,
      create_time: false,
    }).where({
      delete_time:null,
    }).limit(10).get()
    res = data
  }catch(err){
    res = err
  }
  return res
}