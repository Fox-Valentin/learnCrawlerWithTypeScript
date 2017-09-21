// https://github.com/alsotang/node-lessons/tree/master/lesson3
// 参考项目https://segmentfault.com/a/1190000007326795
import api = require('./api');
import cheerio = require('cheerio');
// 一
// 定义异步函数
const go = async () => {
  // api remote_get 是一个异步函数 返回一个 promise 
  // await 看来是可以直接返回 then中 回调函数中的参数 也就是 执行promise中的结果
  // 同时 这里 await 有一个阻滞的效果 等异步函数执行返回数据后才继续执行后续操作
    const res = await api.remote_get('http://cnodejs.org/');
    // 将返回的html源码解析为jq dom对象
    const $ = cheerio.load(res.text);
    // 定义两个变量 并定义其类型 
    // 这里是数组类型 并 数组成员是字符串类型
    let urls: string[] = [];
    let titles: string[] = [];
    // 截取标题内容和链接
    $('.topic_title_wrapper').each((index, element) => {
        titles.push($(element).find('.topic_title').first().text().trim());
        urls.push('http://cnodejs.org/' + $(element).find('.topic_title').first().attr('href'));
    })
    console.log(titles, urls);
}
// 二
// 抓取到首页的链接 接着 用链接去抓取内容
const go = async () => {
    const res = await api.remote_get('http://cnodejs.org/');
    const $ = cheerio.load(res.text);
    $('.topic_title_wrapper').each(async (index, element) => {
      // 抓取链接
        let url = ('http://cnodejs.org' + $(element).find('.topic_title').first().attr('href'));
        // 获取文章内容
        const res_content = await api.remote_get(url);
        const $_content = cheerio.load(res_content.text);
        console.log($_content('.topic_content').first().text());
    })

}
// 三
// 因为访问服务器太迅猛，导致出现很多次503错误
// 添加helper.ts文件
export const wait_seconds = function (senconds: number) {
    return new Promise(resolve => setTimeout(resolve, senconds * 1000));
}
// 修改api.ts文件为：
// 按功能分拆程序 分为底层的请求函数 获取首页链接集合函数 获取新闻内容函数
import superagent = require('superagent');
import cheerio = require('cheerio');

export const get_index_urls = function () {
    const res = await remote_get('http://cnodejs.org/');
    const $ = cheerio.load(res.text);
    let urls: string[] = [];
    $('.topic_title_wrapper').each(async (index, element) => {
        urls.push('http://cnodejs.org' + $(element).find('.topic_title').first().attr('href'));
    });
    return urls;
}
export const get_content = async function (url: string) {
    const res = await remote_get(url);
    const $ = cheerio.load(res.text);
    return $('.topic_content').first().text();
}

export const remote_get = function (url: string) {

    const promise = new Promise<superagent.Response>(function (resolve, reject) {

        superagent.get(url)
            .end(function (err, res) {
                if (!err) {
                    resolve(res);
                } else {
                    console.log(err)
                    reject(err);
                }
            });
    });
    return promise;
}
// 修改app.ts文件为
// 根据api的功能 将逻辑分为二步
// 1 获取首页的链接
// 2 获取链接的内容
// 3 每次抓取链接时延时一秒
import api = require('./api');
import helper = require('./helper');
import cheerio = require('cheerio');

const go = async () => {
    let urls = await api.get_index_urls();
    for (let i = 0; i < urls.length; i++) {
        await helper.wait_seconds(1);
        let text = await api.get_content(urls[i]);
        console.log(text);
    }
}
go();

import * as mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1/cnodejs_data', {
    server: { poolSize: 20 }
}, function (err) {
    if (err) {
        process.exit(1);
    }
});

// models
export const Article = require('./article');

interface IArticle {
    title: String;
    url: String;
    text: String;
}
export = IArticle;

import mongoose = require('mongoose');
import IArticle = require('./IArticle');
interface IArticleModel extends IArticle, mongoose.Document { }

const ArticleSchema = new mongoose.Schema({
    title: { type: String },
    url: { type: String },
    text: { type: String },
});

const Article = mongoose.model<IArticleModel>("Article", ArticleSchema);
export = Article;

import superagent = require('superagent');
import cheerio = require('cheerio');
import models = require('./models');
const Article = models.Article;

export const get_index_urls = async function () {
    const res = await remote_get('http://cnodejs.org/');

    const $ = cheerio.load(res.text);
    let urls: string[] = [];
    $('.topic_title_wrapper').each((index, element) => {
        urls.push('http://cnodejs.org' + $(element).find('.topic_title').first().attr('href'));
    });
    return urls;

}
export const fetch_content = async function (url: string) {
    const res = await remote_get(url);

    const $ = cheerio.load(res.text);
    let article = new Article();
    article.text = $('.topic_content').first().text();
    article.title = $('.topic_full_title').first().text().replace('置顶', '').replace('精华', '').trim();
    article.url = url;
    console.log('获取成功：' + article.title);
    article.save();

}
export const remote_get = function (url: string) {

    return new Promise<superagent.Response>((resolve, reject) => {
        superagent.get(url)
            .end(function (err, res) {
                if (!err) {
                    resolve(res);
                } else {
                    reject(err);
                }
            });
    });
}

import api = require('./api');
import helper = require('./helper');
import cheerio = require('cheerio');

(async () => {

    try {
        let urls = await api.get_index_urls();
        for (let i = 0; i < urls.length; i++) {
            await helper.wait_seconds(1);
            await api.fetch_content(urls[i]);
        }
    } catch (err) {
        console.log(err);
    }

    console.log('完毕！');

})();