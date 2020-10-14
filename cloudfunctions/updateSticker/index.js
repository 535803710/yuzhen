const cloud = require("wx-server-sdk");
cloud.init();
const db = cloud.database({
  env: "dev-85arv",
});
const sticker = db.collection("sticker");
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const _id = event.id;
  const type = event.type;
  let res = "";

  console.log(event);
  switch (type) {
    case "delete":
      res = await sticker.doc(_id).update({
        data:{
          delete_time: new Date(),
        }
      });
      break;

    default:
      break;
  }
  return {type,res};
};
