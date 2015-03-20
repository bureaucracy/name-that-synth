'use strict';

const conf = require('./conf');
const fs = require('fs');
const walk = require('walk');

const AUDIO_PATH = conf.get('audioPath');

let ctx = {
  analytics: conf.get('analytics')
};

exports.home = function (request, reply) {
  ctx.error = request.query.err || '';
  reply.view('index', ctx);
};

exports.audio = function (request, reply) {
  let files = [];
  let total = 0;
  let fileArr = [];

  let walker = walk.walk(AUDIO_PATH, { followLinks: false });

  walker.on('file', function (root, stat, next) {
    files.push(root + '/' + stat.name);
    next();
  });

  walker.on('end', function () {
    files.forEach(function (file, idx) {
      let rs = fs.createReadStream(file, { encoding: 'base64' });
      let base64 = '';

      rs.on('data', function (chunk) {
        base64 += chunk;
      });

      rs.on('error', function (err) {
        fileArr.push({
          data: false
        });
      });

      rs.on('end', function () {
        if (file.indexOf('.wav') > -1) {
          fileArr.push({
            data: base64,
            synth: file.split('-')[0].split('/')[1]
          });
        }
      });
    });

    reply(fileArr);
  });
};
