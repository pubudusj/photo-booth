'use strict';

module.exports.index = async event => {
  console.log(event)
  return { message: 'New Background Added', event };
};
