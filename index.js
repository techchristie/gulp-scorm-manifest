'use strict';

var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var fs = require('fs');
var path = require('path');
var through = require('through2');
var xmlBuilder = require('xmlbuilder');
var _ = require('lodash');
var Vinyl = require('vinyl');

module.exports = function(options) {

  _.extend({
    version: '2004',
    edition: '3rd',
    courseId: 'CourseID',
    SCOtitle: 'SCO Title',
    moduleTitle: 'Module Title',
    launchPage: 'index.html',
    path: 'data',
    fileName: 'imsmanifest.xml'
  }, options);

  var firstFile;

  var fileName = options.fileName;

  var xmlTokens = {
    versionString: '2004 3rd Edition',
    scormType: 'adlcp:scormType',
    fileArr: [
      {'@identifier':  'resource_1'},
      {'@type': 'webcontent'},
      {'@href': (options.path ? options.path + "/" : "").replace(/\\/g, '/') + options.launchPage}
    ]
  };

  var v = options.version.toLowerCase();
  var ed = options.edition || '3rd';

  if (v==='1.2') {
    xmlTokens.versionString = '1.2';
    xmlTokens.scormType = 'adlcp:scormtype';

  } else if (v.indexOf('2004')===0) {
    xmlTokens.versionString = '2004 '+ed+' Edition';
    xmlTokens.scormType = 'adlcp:scormType';
  }

  (function(){
    var tObj = {};
    tObj['@' + xmlTokens.scormType] = 'sco';
    xmlTokens.fileArr.push(tObj);
  })();

  var addFile = function(file, lastmode, cb) {
    var fObj = {
      file: {
        '@href':((options.path ? options.path + "/" : "") + file.relative).replace(/\\/g, '/')
      }
    };
    xmlTokens.fileArr.push(fObj);
    return cb();
  };

  return through.obj(function(file, enc, cb) {

    if (file.isNull()) {
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-scorm-manifest', 'Streaming not supported'));
    }


    if (!firstFile) {
      firstFile = file;
    }

    fs.stat(file.path, function(err, stats) {
      if (err || !stats || !stats.mtime) {

        if (err.code === 'ENOENT') {
          return cb();
        }
        err = err || 'No stats found for file: '+ file.path;
        this.emit('error', new PluginError('gulp-scorm-manifest', err));
        return cb();
      }

      return addFile(file, stats.mtime, cb);

    }.bind(this));

  },
  function (cb) {
    if (!firstFile) { return cb(); }

    var xmlObj = {
      manifest: {
        '@identifier': options.courseId,
        '@version': '1',
        metadata: {
          schema: 'ADL SCORM',
          schemaversion: xmlTokens.versionString
        },
        organizations: {
          '@default': options.courseId + '-org',
          organization: {
            '@identifier': options.courseId + '-org',
            title: options.SCOtitle,
            item: {
              '@identifier': 'item_1',
              '@identifierref': 'resource_1',
              title: options.moduleTitle
            }
          }
        },
        resources: {
          resource: xmlTokens.fileArr,
        }
      },
    };
    var xmlDoc = xmlBuilder.create(xmlObj,
      {version: '1.0', encoding: 'UTF-8', standalone: true},
      {ext: null},
      {allowSurrogateChars: false, headless: false, stringify: {}});

    var v = options.version.toLowerCase();
    if (v==='1.2') {
      xmlDoc.att('xmlns', 'http://www.imsproject.org/xsd/imscp_rootv1p1p2')
      .att('xmlns:adlcp', 'http://www.adlnet.org/xsd/adlcp_rootv1p2')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
      .att('xsi:schemaLocation', 'http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd');
    } else if (v.indexOf('2004')===0) {
      xmlDoc.att('xmlns', 'http://www.imsglobal.org/xsd/imscp_v1p1')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
      .att('xmlns:adlcp', 'http://www.adlnet.org/xsd/adlcp_v1p3')
      .att('xmlns:adlseq', 'http://www.adlnet.org/xsd/adlseq_v1p3')
      .att('xmlns:adlnav', 'http://www.adlnet.org/xsd/adlnav_v1p3')
      .att('xmlns:imsss', 'http://www.imsglobal.org/xsd/imsss')
      .att('xsi:schemaLocation', 'http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd');
    }

    var prettyXML = xmlDoc.end({pretty: true});

    var manifestFile  = new Vinyl({
      cwd:firstFile.cwd,
      base: firstFile.base,
      path: path.join(firstFile.base, fileName),
      contents: new Buffer(prettyXML)
    });

    this.push(manifestFile);
    gutil.log('Generated', gutil.colors.blue(fileName));

    return cb();
  });
};
