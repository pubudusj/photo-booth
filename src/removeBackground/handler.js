"use strict";

const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const axios = require("axios").default;
const signedUrlExpireSeconds = 60 * 2;

module.exports.index = async (event) => {
  var params = { Bucket: event.bucketName, Key: event.object };

  var url = s3.getSignedUrl("getObject", {
    Bucket: event.bucketName,
    Key: event.object,
    Expires: signedUrlExpireSeconds,
  });

  let response = await axios.post(
    "https://api.remove.bg/v1.0/removebg",
    {
      image_url: url,
      size: "auto",
    },
    {
      headers: {
        "X-Api-Key": process.env['removeBgApiKey'],
        Accept: "application/json",
      },
      encoding: null,
    }
  );

  var buf = Buffer.from(response.data.data.result_b64, "base64");
  var params = {
    Bucket: event.bucketName,
    Key: "background_removed/" + event.fileName + ".png",
    Body: buf,
    ContentType: "image/png",
  };

  await s3
    .putObject(params)
    .promise();

  return {
    bucketName: event.bucketName,
    object: params.Key,
    fileName: event.fileName,
  };
};
