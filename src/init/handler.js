'use strict';
const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

module.exports.index = async (event) => {
  var input = {
    bucketName: event['Records'][0]['s3']['bucket']['name'],
    bucektArn: event['Records'][0]['s3']['bucket']['arn'],
    object: event['Records'][0]['s3']['object']['key'],
  }

  var params = {
    stateMachineArn: process.env['stateMachine'],
    input: JSON.stringify(input)
  };

  console.log(params);

  await stepfunctions.startExecution(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else  {
      console.log(data);
    }
  }).promise();

  return {success: true}
};
