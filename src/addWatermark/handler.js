'use strict';

module.exports.index = async event => {
  console.log(event)
  return { message: 'Watermark Added', event };
};
