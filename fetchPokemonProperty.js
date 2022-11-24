import axios from 'axios'
import * as cheerio from 'cheerio'

// 取特性說明
export default async (event) => {
  try {
    const { data } = await axios.get('https://wiki.52poke.com/zh-hant/%E7%89%B9%E6%80%A7%E5%88%97%E8%A1%A8')
    const $ = cheerio.load(data)
    $('.fulltable a').each(function (index) {
      if ($('.fulltable a').eq(index).text() === event.message.text.substring(3)) event.reply($('.at-l').eq(index).text().trim())
    })
  } catch (error) {
    event.reply('查不到該資料')
  }
}
