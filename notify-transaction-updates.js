const notifier = require('node-notifier')
const axios = require('axios')
const path = require('path')

const API_URL   = 'https://api.p2pb2b.io'
const TRADE_URL = 'https://p2pb2b.io/trade/'

const endpoint = '/api/v1/public/history'
const market   = process.argv[2]
const lastId   = 1
const limit    = 1
const interval = 5

if (! market) {
  throw `Usage: node ${path.basename(__filename)} \${market}`
}

const getApiUrl = () => {
  return API_URL + endpoint
}

const getTradeUrl = () => {
  return TRADE_URL + market
}

const getLastTransaction = () => {
  return axios
    .get(getApiUrl(), { params: { market, lastId, limit } })
    .then((response) => {
      if (response.data.result.length > 0) {
        return response.data.result[0]
      } else {
        return null
      }
    })
}

let lastTime = undefined
setInterval(() => {
  getLastTransaction()
    .then((lastTransaction) => {
      if (! lastTransaction) {
        return
      }

      console.log(`The last ${lastTransaction.type} price is ${lastTransaction.price} at ${new Date(lastTransaction.time * 1000)}`)
      if (lastTime !== undefined && lastTransaction.time !== lastTime) {
        notifier.notify({
          title:   'P2PB2B Transaction Update Notification',
          message: `The ${market} price is now ${lastTransaction.price}`,
          open:    getTradeUrl()
        })
      }
      lastTime = lastTransaction.time
    })
    .catch((error) => {
      console.error(error)
    })
}, interval * 1000)
