'use strict';

const AWS = require('aws-sdk');
const ses = new AWS.SES({apiVersion: '2010-12-01'})
const s3 = new AWS.S3()

module.exports.index = async event => {
  const image = await s3.getObject({
    Bucket: event.bucketName,
    Key: event.object 
  }).promise()

  const originalImage = await s3.headObject({
    Bucket: event.bucketName,
    Key: 'uploads/'+event.fileName+'.jpg'
  }).promise()

  const fromEmail = process.env['sesFromAddress']
  const toEmail = originalImage.Metadata.user

  // Build the raw email
  var ses_mail = "From: 'ServerlessPhotoBooth' <" + fromEmail + ">\n"
  ses_mail += "To: " + toEmail + "\n"
  ses_mail += "Subject: Your memory with ServerlessPhotoBooth\n"
  ses_mail += "MIME-Version: 1.0\n"
  ses_mail += "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n"
  ses_mail += "--NextPart\n";
  ses_mail += "Content-Type: text/html; charset=us-ascii\n\n";
  ses_mail += "Hello from ServerlessPhotoBooth.\n\n";
  ses_mail += "--NextPart\n";
  ses_mail += "Content-Type: application/png; \n";
  ses_mail += "Content-Disposition: attachment; filename=\"serverless-photobooth.png\"\n";
  ses_mail += "Content-Transfer-Encoding: base64\n\n"
  ses_mail += image.Body.toString('base64')
  ses_mail += "\n--NextPart";

  var params = {
    RawMessage: { Data: ses_mail },
    Destinations: [toEmail],
    Source: "'ServerlessPhotoBooth' <" + fromEmail + ">'"
  };

  // Send email
  await ses.sendRawEmail(params).promise();

  return {
    fileName: event.fileName,
    receipient: params.Destinations
  }
};
