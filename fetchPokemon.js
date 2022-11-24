import axios from 'axios'
import * as cheerio from 'cheerio'
import pokemonBubble from './pokemonBubble.js'

export default async (event) => {
  try {
    // 資料抓取
    // data 並非自訂變數，而是 axios 專用變數
    const { data } = await axios.get(`https://tw.portal-pokemon.com/play/pokedex/${event.message.text}`)
    // 轉成 JQ 可用型式
    const $ = cheerio.load(data)
    // 寶可夢名字
    const pokemonName = $('.pokemon-slider__main-name').text()
    // 寶可夢編號
    const pokemonIndex = $('.pokemon-slider__main-no').text()
    // 寶可夢屬性
    const pokemonType = $('.pokemon-type__type').text().split('\n').map(t => t.trim()).filter(t => t.length > 0)
    // 寶可夢弱點
    const pokemonWeaknessType = $('.pokemon-weakness').text().split('\n').map(t => t.trim()).filter(t => t.length > 0)
    // 寶可夢身高
    const pokemonHeight = $('.pokemon-info__height .pokemon-info__value').text()
    // 寶可夢體重
    const pokemonWeight = $('.pokemon-info__weight .pokemon-info__value').text()
    // 將 linebot 消息轉成 JSON 格式
    const bubble = JSON.parse(JSON.stringify(pokemonBubble))
    //  上方圖片
    bubble.hero.url = 'https://tw.portal-pokemon.com' + $('.pokemon-img__front').attr('src')
    // 上方圖片網址導向
    bubble.hero.action.uri = `https://tw.portal-pokemon.com/play/pokedex/${event.message.text}`
    // 放入寶可夢資訊
    bubble.body.contents[0].text = pokemonIndex
    bubble.body.contents[1].text = pokemonName
    bubble.body.contents[2].contents[0].contents[1].text = pokemonType.toString()
    bubble.body.contents[2].contents[1].contents[1].text = pokemonWeaknessType.toString()

    // 寶可夢特性
    const pokemonC = $('.pokemon-info__abilities .pokemon-info__value').text().split('\n').map(t => t.trim()).filter(t => t.length > 0)
    if (pokemonC.length > 0) {
      bubble.body.contents[2].contents[2].contents[1].text = pokemonC.toString()
    }

    bubble.body.contents[2].contents[3].contents[1].text = pokemonHeight
    bubble.body.contents[2].contents[4].contents[1].text = pokemonWeight

    // 取型態資料，並將自己原型態刪除
    const pokemonOtherType = $('.pokemon-style-box__no').siblings().text().split('\n').map(t => t.trim()).filter(t => t.length > 2 && t !== $('.pokemon-slider__main-name, .pokemon-slider__main-subname').text() && t != ('超能力'))
    if (pokemonOtherType.length > 0) bubble.body.contents[2].contents[5].contents[1].text = pokemonOtherType.toString()

    // 取進化資料，並將自己原型態刪除
    const pokemonEvolution = []
    for (let i = 0; i < $('.pokemon-evolution-item__info-name').length; i++) {
      if ($('.pokemon-evolution-item__info-name').eq(i).text() !== $('.pokemon-slider__main-name').text() && $('.pokemon-evolution-item__info-name').eq(i).text() !== $('.pokemon-evolution-item__info-name').eq(i - 1).text()) {
        pokemonEvolution.push($('.pokemon-evolution-item__info-name').eq(i).text())
      }
    }

    // 有其他型態才放進去，且篩選有超級二字的寶可夢
    if (pokemonOtherType.length > 0) {
      if (pokemonEvolution[pokemonEvolution.length - 1] == pokemonOtherType[0].toString() || pokemonName.includes('超級')) {
        pokemonEvolution.splice(-1, 1)
      }
    }

    // 有進化才放進去
    if (pokemonEvolution.length > 0) bubble.body.contents[2].contents[6].contents[1].text = pokemonEvolution.toString()

    // 篩選進化的快速提示字元
    const indexEvolutionText = []
    if (pokemonEvolution.length > 0) {
      for (let i = 0; i < pokemonEvolution.length; i++) {
        for (let j = 0; j < $('.pokemon-evolution-item__info-name').length; j++) {
          if ($('.pokemon-evolution-item__info-name').eq(j).text() === pokemonEvolution[i]) {
            indexEvolutionText[i] = $('.pokemon-evolution-box__no').eq(j).text()
          }
        }
      }
    }

    // 篩選其他型態的快速提示字元
    const indexTypeText = []
    if (pokemonOtherType.length > 0) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
          if ($('.pokemon-style-box__no').eq(j).siblings().text().split('\n').map(t => t.trim()).filter(t => t.length > 2 && t != $('.pokemon-type__type').eq(0).text().split('\n').map(t => t.trim()).filter(t => t.length > 0)).toString() === pokemonOtherType[i]) {
            indexTypeText[i] = `${pokemonIndex}_${j}`
          }
        }
      }
    }

    // 都有就有提示字元可以使用
    if (pokemonC.length > 0 || pokemonEvolution.length > 0 || pokemonOtherType.length > 0) {
      const quickReply = {
        type: 'text',
        text: '相關資訊',
        quickReply: {
          items: [
          ]
        }
      }

      // 提示字元放入
      if (pokemonC.length > 0) {
        pokemonC.forEach(function (pp, index) {
          quickReply.quickReply.items.push(
            {
              type: 'action',
              action: {
                type: 'message',
                label: `${pokemonC[index]}`,
                text: `特性 ${pokemonC[index]}`
              }
            }
          )
        })
      }

      if (pokemonEvolution.length > 0) {
        pokemonEvolution.forEach(function (pp, index) {
          quickReply.quickReply.items.push(
            {
              type: 'action',
              action: {
                type: 'message',
                label: `${pokemonEvolution[index]}`,
                text: `${indexEvolutionText[index]}`
              }
            }
          )
        })
      }

      if (pokemonOtherType.length > 0) {
        pokemonOtherType.forEach(function (pp, index) {
          quickReply.quickReply.items.push(
            {
              type: 'action',
              action: {
                type: 'message',
                label: `${pokemonOtherType[index]}`,
                text: `${indexTypeText[index]}`
              }
            }
          )
        })
      }

      // 回覆
      const reply = {
        type: 'flex',
        altText: '查詢結果',
        contents: {
          type: 'carousel',
          contents: [bubble]
        }
      }
      const All = [reply, quickReply]
      event.reply(All)
    } else {
      event.reply(reply)
    }
  } catch (error) {
    event.reply('查詢有誤，或是伺服器正在維修，請稍後再嘗試')
    console.error(error)
  }
}
