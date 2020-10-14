// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require("wx-server-sdk");

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database({
  env: "dev-85arv",
});
const user = db.collection("user");

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 *
 * event 参数包含小程序端调用传入的 data
 *
 */
exports.main = async (event, context) => {
  console.log(event);
  console.log(context);
  let returnRes = {
    success: true,
    data: {},
    err: null,
  };
  let res = "";
  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext();

  const { data } = await user
    .where({
      openid: wxContext.OPENID,
    })
    .get();
  console.log("data", data);
  try {
    if (data.length === 0) {
      const params = {
        openid: wxContext.OPENID,
        ...event,
        create_time: new Date(),
        delete_time: null,
        update_time: null,
      };
      res = await user.add({
        data: params,
      });
      returnRes.data = res;
    } else {
      res = await user.doc(data[0]._id).update({
        data: {
          ...event,
          update_time: new Date(),
        },
      });
    }
    console.log("res", res);
    returnRes.data = res;
  } catch (error) {
    returnRes.err = error;
    returnRes.success = false;
  } finally {
    return returnRes;
  }
};
