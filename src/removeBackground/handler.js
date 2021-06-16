"use strict"

const AWS = require("aws-sdk")
const s3 = new AWS.S3()
const axios = require("axios").default
const signedUrlExpireSeconds = 60 * 2

module.exports.index = async (event) => {
  var params = { Bucket: event.bucketName, Key: event.object }

  // Generate presigned url for API
  var url = s3.getSignedUrl("getObject", {
    Bucket: event.bucketName,
    Key: event.object,
    Expires: signedUrlExpireSeconds,
  })

  // Call remove background API
  let response = await axios.post(
    "https://api.remove.bg/v1.0/removebg",
    {
      image_url: url,
      size: "auto",
      type: "person",
    },
    {
      headers: {
        "X-Api-Key": process.env['removeBgApiKey'],
        Accept: "application/json",
      },
      encoding: null,
    }
  )
  
  // Convert output (base64 string) to buffer
  var buf = Buffer.from(response.data.data.result_b64, "base64")

  // Save image to s3
  var params = {
    Bucket: event.bucketName,
    Key: "background_removed/" + event.fileName + ".png",
    Body: buf,
    ContentType: "image/png",
  }

  await s3
    .putObject(params)
    .promise()

  return {
    bucketName: event.bucketName,
    object: params.Key,
    fileName: event.fileName,
  }
}
