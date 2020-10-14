// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database({
  env: "dev-85arv",
});
const _ = db.command
const user = db.collection("user");
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  console.log(event);
  const yes = ["2", "3", "1", "2", "4"];
  const answers = event.answers;
  let score = 0;
  for (let i = 0; i < answers.length; i++) {
    const current = answers[i];
    if (current === yes[i]) {
      score += 1;
    }
  }
  const res = await user
    .where({
      openid: wxContext.OPENID,
    })
    .update({
      data: {
        examination: score,
        update_time: new Date(),
      },
    });
    console.log(res);
  return score;
};
