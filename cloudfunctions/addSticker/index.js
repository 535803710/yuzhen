// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'dev-85arv'
})
const sticker = db.collection('sticker')
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const res = await sticker.add({
    data:{
      comment_num:0,
      favour_num:0,
      author_openid:wxContext.OPENID,
      create_time:new Date(),
      delete_time:null,
      update_time:null,
      tags:event.tags,
      text:event.text,
      urls:event.urls
    }
  })
  console.log(res)
  return {
    data:res.errMsg ==='collection.add:ok'
  }
}