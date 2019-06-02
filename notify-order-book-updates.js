const notifier = require('node-notifier')
const axios = require('axios')
const path = require('path')

const API_URL   = 'https://api.p2pb2b.io'
const TRADE_URL = 'https://p2pb2b.io/trade/'

const endpoint = '/api/v1/public/book'
const market   = process.argv[2]
const side     = process.argv[3]
const offset   = 0
const limit    = 1
const interval = 5

if (! market || ! side) {
  throw `Usage: node ${path.basename(__filename)} \${market} \${side}`
}

const getApiUrl = () => {
  return API_URL + endpoint
}

const getTradeUrl = () => {
  return TRADE_URL + market
}

const getTopOrder = () => {
  return axios
    .get(getApiUrl(), { params: { market, side, offset, limit } })
    .then((response) => {
      if (response.data.result.orders.length > 0) {
        return response.data.result.orders[0]
      } else {
        return null
      }
    })
}

let lastPrice = undefined
setInterval(() => {
  getTopOrder()
    .then((topOrder) => {
      if (! topOrder) {
        console.log(`The ${side} order book is empty`)
        return
      }

      console.log(`The top ${side} price is ${topOrder.price}`)
      if (lastPrice !== undefined && topOrder.price !== lastPrice) {
        notifier.notify({
          title:   'P2PB2B Order Update Notification',
          message: `${market} is now ${topOrder.price} on ${side} side`,
          open:    getTradeUrl()
        })
      }
      lastPrice = topOrder.price
    })
    .catch((error) => {
      console.error(error)
    })
}, interval * 1000)
