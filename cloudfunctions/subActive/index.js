const cloud = require("wx-server-sdk");

cloud.init();
const db = cloud.database({
  env: "dev-85arv",
});
const subActive = db.collection("subActive");

exports.main = async (event, context) => {
  const tmplIds = event.tmplIds;
  const wxContext = cloud.getWXContext();
  subActive.add({
    data: {
      openid: wxContext.OPENID,
      tmplIds,
    },
  });

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
