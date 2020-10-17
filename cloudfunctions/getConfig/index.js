// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: "dev-85arv",
});
const config = db.collection("config");



// 云函数入口函数
exports.main = async (event, context) => {

  const { data } = await config.get()
  if(Object.keys(event).indexOf('config') === -1){
    return {
      data: data[0].value
    }
  } else {
    const value = event.config
    await config.doc(data[0]._id).update({
      data:{
        value
      }
    })
  }
}