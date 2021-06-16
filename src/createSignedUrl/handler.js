"use strict"

const AWS = require("aws-sdk")
const s3 = new AWS.S3()
const crypto = require("crypto")
const signedUrlExpireSeconds = parseInt(process.env['signedUrlExpiredSeconds'])

module.exports.index = async (event, context, callback) => {
  console.log(event)
  let body = JSON.parse(event.body)
  console.log(body)
  const bucketName = process.env['bucketName']
  const object = 'uploads/' + crypto.randomBytes(16).toString("hex") + '.jpg'

  var url = s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: object,
    Expires: signedUrlExpireSeconds,
    ContentType: 'multipart/form-data',
    Metadata: {
      user: body.email
    }
  })

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*",
    },
    body: JSON.stringify({ "url": url })
  };

  callback(null, response)
}
