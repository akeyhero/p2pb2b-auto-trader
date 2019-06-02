const request = require('request')
const crypto = require('crypto')

require('dotenv').config()
const BASE_URL = 'https://api.p2pb2b.io'

const endpoint = '/api/v1/account/balances'

const buildData = (data) => {
  return {
    ...data,
    request: endpoint,
    nonce: parseInt(Date.now() / 1000).toString()
  }
}

const getBody = (data) => {
  return JSON.stringify(data)
}

const getPayload = (body) => {
  return new Buffer.from(body).toString('base64')
}

const getSignature = (payload) => {
  return crypto.createHmac('sha512', process.env.API_SECRET).update(payload).digest('hex')
}

const data      = buildData({})
const body      = getBody(data)
const payload   = getPayload(body)
const signature = getSignature(payload)

const options = {
  url: BASE_URL + endpoint,
  headers: {
    'Content-Type': 'application/json',
    'X-TXC-APIKEY': process.env.API_KEY,
    'X-TXC-PAYLOAD': payload,
    'X-TXC-SIGNATURE': signature
  },
  body: body
}

console.log(options)

request.post(options, (error, response, body) => {
  console.log('error:', error)
  console.log('body:', body)
})
