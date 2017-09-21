import superagent = require('superagent')
import cheerio = require('cheerio')

export const getIndexUrls = async function(){
  const res = await remote_get('http://cnodejs.org/')
  const $ = cheerio.load(res.text)
  let urls: string[] = []
  $('.topic_title_wrapper').each(async (index,el) => {
    urls.push('http://cnodejs.org' + $(el).find('.topic_title').first().attr('href'))
  })
  return urls
}

export const getContent = async function (url: string) {
  const res = await remote_get(url)
  const $ = cheerio.load(res.text)
  return $('.topic_content').first().text()
}

export const remote_get = function(url: string){
  const promise = new Promise<superagent.Response>(function(resolve,reject){
    superagent.get(url).end(function(err,res){
      if (!err){
        resolve(res)
      }else{
        reject(err)
        throw err
      }
    })
  })
  return promise
}