import 'dotenv/config'
import linebot from 'linebot'
// import { scheduleJob } from 'node-schedule'
import fetchPokemon from './fetchPokemon.js'
import fetchPokemonChinese from './fetchPokemonChinese.js'
import fetchPokemonProperty from './fetchPokemonProperty.js'

// 金鑰
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.on('message', event => {
  // 如果輸入的是0-906、數字、長度小於4 
  if ((event.message.text.match(/[0-9]{3}/g) && event.message.text.length < 4 && parseInt(event.message.text) < 906) || event.message.text.match(/[0-9]{3}_[0-9]/g)) {
    fetchPokemon(event)
    // 搜索特性
  } else if (event.message.text.substring(0, 2) === '特性') {
    fetchPokemonProperty(event)
    // 圖鑑資料外
  } else if (parseInt(event.message.text) > 905) {
    event.reply('現在還沒有該寶可夢')
    // 使用提醒
  } else if (event.message.text === '使用方式') {
    event.reply(`使用方式：
1. 輸入該寶可夢圖鑑編號 ex:001
    多種型態的可帶入_數字 ex:006_1
2. 輸入寶可夢名稱 ex:噴火龍
    資料庫尚未支援特殊形態中文名稱
3. 輸入寶可夢特性得知效果 ex:特性 惡毒`)
  } else {
    fetchPokemonChinese(event)
  }
})

bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動')
})
