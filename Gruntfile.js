/* jshint indent:2, quotmark:true */
/* global
  module,
  require
*/

module.exports = function (grunt) {
  'use strict';

  // measures the time each task takes
  require('time-grunt')(grunt);

  require('load-grunt-tasks')(grunt);

  // Grunt configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> v<%= pkg.version %> ' +
      '<%= pkg.homepage ? "<" + pkg.homepage + ">\\n" : "" %> ' +
      '   <%= _.pluck(pkg.licenses, "type").join(", ") %> ' +
      '<%= pkg.licenses ? "<" + _.pluck(pkg.licenses, "url").join(", ") + ">\\n" : "" %>' +
      '*/\n',
    jshint: {
      options: {
        jshintrc: 'swfobject/src/.jshintrc'
      },
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: [ 'Gruntfile.js' ]
      },
      src: {
        src: [
          'swfobject/src/*.js'
        ]
      }
    },
    uglify : {
      build : {
        options : {
          banner: '<%= banner %>'
        },
        files : {
          'swfobject/swfobject.js' : [ 'swfobject/src/swfobject.js' ]
        }
      }
    },
    watch : {
      lint : {
        files : [
          'Gruntfile.js',
          'swfobject/src/*.js'
        ],
        tasks : [ 'lint' ]
      },
      build : {
        files : [
          'Gruntfile.js',
          'swfobject/src/*.js'
        ],
        tasks : [ 'build' ]
      }
    }
  });

  grunt.registerTask('lint', [ 'jshint' ]);
  grunt.registerTask('build', [ 'jshint', 'uglify' ]);

  grunt.registerTask('test', [ 'build' ]);

  // Default task.
  grunt.registerTask('default', 'build');
};
