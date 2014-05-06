# gulp-scorm-manifest

> A Gulp plugin that generates a valid SCORM IMS manifest file.

## Getting Started
This plugin requires Gulp `~0.4.2`

If you haven't used [Gulp](http://gulpjs.com/) before, be sure to check out the [Docs](https://github.com/gulpjs/gulp/blob/master/README.md#gulp---) Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install gulp-scorm-manifest --save-dev
```

Once the plugin has been installed, it may be enabled inside your gulpfile with this line of JavaScript:

```js
var scormManifest = require('gulp-scorm-manifest')
```

Node Libraries Used:
[xmlbuilder-js](https://github.com/oozcitak/xmlbuilder-js) (for xml generation).

### Options

#### options.version
Type: `String`
Default value: `'2004'`
Possible values: `2004||1.2`

This is used to define which version of SCORM will be applied to the manifest.

#### options.courseId
Type: `String`
Default value: `'CourseID'`

This is used to define the top-level course ID.

#### options.SCOtitle
Type: `String`
Default value: `'SCO Title'`

This is used (by `<organization />`) to define the SCO title.

#### options.moduleTitle
Type: `String`
Default value: `'Module'`

This is used (by `<item />`) to define the SCO module title.

#### options.launchPage
Type: `String`
Default value: `'index.html'`

This is used to define the launchpage of the SCO.

#### options.path
Type: `String`
Default value: `'./'`

This is used to define the path to which `imsmanifest.xml` will be written.

### Usage Example

This example creates a SCORM 2004 3rd Edition IMS manifest. The manifest will be written to the project directory and will include files in the project directory and all subdirectories.

```js
// simple single SCO package
scorm_manifest: {
  options: {
    version: '2004',
    courseId: 'Gulp101',
    SCOtitle: 'Intro to Gulp',
    moduleTitle: 'AU101',
    launchPage: 'launchpage.html',
    path: './'
  },
  files: [{
        expand: true,   // required
        cwd: './',      // start looking for files to list in the same dir as gulpfile
        src: ['**/*.*'],  // file selector (this example includes subdirectories)
        filter: 'isFile'  // required
      }],
},
```

## Release History
  * 2014-05-06   v0.0.1   Initial plugin release.