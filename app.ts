// 1 引入api和cheerio
// 2 定义异步函数go
// 3 调用api中的 remote get 返回res 其中包含 首页源码
// 4 解析源码 截取链接
// 5 通过链接去获取文章内容
import api = require("./api")
import cheerio = require('cheerio')

const go = async () => {
  const res = await api.remote_get('http://cnodejs.org/')
  const $ = cheerio.load(res.text)
  $('.topic_title_wrapper').each( async (index,el) => {
    let url = 'http://cnodejs.org' + $(el).find('.topic_title').first().attr('href')
    console.log(url)
    const res_content = await api.remote_get(url)
    const $_content = cheerio.load(res_content.text)
    console.log($_content('.topic_content').first().text())
  })
}
go()