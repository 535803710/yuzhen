// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: 'dev-85arv'
})

const examination = db.collection('examination')

// 云函数入口函数
exports.main = async (event, context) => {
  return await examination.field({
    answer:false
  }).get()
}