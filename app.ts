// 引入 api cheerio helper
// 从首页获取链接数组
// 循环数据 请求内容
// 每次循环 间隔一秒
import api = require('./api')
import cheerio = require('cheerio')
import helper = require('./helper')
const go = async () => {
  try{
    let urls = await api.getIndexUrls()
    for (let i = 0; i< urls.length; i++){
      await helper.waitSecond(1)
      await api.getContent(urls[i])
    }
  }catch(err){
    throw err
  }
  console.log('done')
  process.exit(1)
}
go()