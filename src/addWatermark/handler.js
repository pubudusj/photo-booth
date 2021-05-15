'use strict';

const AWS = require("aws-sdk")
const s3 = new AWS.S3()
const jimp = require('jimp')
const fs = require('fs')

module.exports.index = async event => {
  //Get image object
  const object = await s3.getObject({
    Bucket: event.bucketName,
    Key: event.object 
  }).promise()

  const image = await jimp.read(object.Body)
  
  // Set font
  const font = await jimp.loadFont(jimp.FONT_SANS_16_WHITE)
  
  // Print message on image
  var x = 20
  var y = image.bitmap.height - 30
  const currentTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
  var message = currentTime
  image.print(font, x, y, message)

  x = image.bitmap.width / 2
  message = 'Serverless PhotoBooth by @pubudusj'
  image.print(font, x, y, message)

  const outputFilePath = '/tmp/' + event.object
  await image.writeAsync(outputFilePath)

  // Upload merged image to s3
  var params = {
    Bucket: event.bucketName,
    Key: "final/" + event.fileName + ".png",
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
};
