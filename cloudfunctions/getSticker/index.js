// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: 'dev-85arv'
})
const sticker = db.collection('sticker')
// 云函数入口函数
exports.main = async (event, context) => {
  let res = {
    loadAll:false
  }
  console.log("event",event)
  const start = +event.start || 0
  const num = +event.num || 12
  try {
    const {data} = await sticker.field({
      delete_time: false,
      update_time: false,
      create_time: false,
    }).where({
      delete_time:null
    }).orderBy('create_time', 'desc').skip(start).limit(num).get()
    console.log(data)
    if(data.length !== 12){
      res.loadAll = true
    }
    res.data = data
  }catch(err){
    res = err
  }
  return res
}