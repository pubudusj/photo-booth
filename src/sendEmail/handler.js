'use strict';

module.exports.index = async event => {
  console.log(event)
  return { message: 'Email sent', event };
};
