'use strict'

const AWS = require("aws-sdk")
const s3 = new AWS.S3()
const jimp = require('jimp')
const fs = require('fs')

module.exports.index = async event => {
  //Get image object
  const image = await s3.getObject({
    Bucket: event.bucketName,
    Key: event.object 
  }).promise()

  //Get random background
  var max = process.env['noOfBackgroundImages']
  var rand = Math.floor(Math.random() * (max - 1 + 1)) + 1

  const background = await s3.getObject({
      Bucket: event.bucketName,
      Key: 'backgrounds/background' + rand + '.png'
    }).promise()

  // Create jimp objects
  const imageObj = await jimp.read(image.Body)
  const backgroundObj = await jimp.read(background.Body)

  // Merge image with background
  const merged = await backgroundObj.composite(imageObj, 0, 0, { mode: jimp.BLEND_SOURCE_OVER })
  
  // Save merged image to tmp file
  const outputFilePath = '/tmp/' + event.object
  await merged.writeAsync(outputFilePath)

  // Upload merged image to s3
  var params = {
    Bucket: event.bucketName,
    Key: "new_background/" + event.fileName + ".png",
    Body: fs.readFileSync(outputFilePath),
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
