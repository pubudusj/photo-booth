'use strict';

const AWS = require('aws-sdk')
const stepfunctions = new AWS.StepFunctions()

module.exports.index = async (event) => {
  let input = {
    bucketName: event['Records'][0]['s3']['bucket']['name'],
    bucektArn: event['Records'][0]['s3']['bucket']['arn'],
    object: event['Records'][0]['s3']['object']['key'],
    fileName: event['Records'][0]['s3']['object']['key'].replace('uploads/', '').replace('.jpg', ''),
  }

  let params = {
    stateMachineArn: process.env['stateMachine'],
    input: JSON.stringify(input)
  }

  try {
    return stepfunctions.startExecution(params).promise()
  } catch(err) {
    console.log(err)
  }
}
