// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'dev-85arv'
})
const sticker = db.collection('sticker')
// 云函数入口函数
exports.main = async (event, context) => {
  const res = await sticker.add({
    data:{
      comment_num:0,
      file_id:event.fileID,
      favour_num:0,
      create_time:new Date(),
      delete_time:null,
      update_time:null,
      type:event.type,
    }
  })
  console.log(res)
  return res
}