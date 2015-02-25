module.exports = function ( grunt ) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.initConfig({
		jshint: {
		// jshint task configuration goes here.
		src: ['Client/js/*.js', '!Client/**/socket.io.min.js', '!Client/**/socket-factory.js'],
		options: {
			browser: true,
			curly:  true,
			  immed:  true,
			  newcap: true,
			  noarg:  true,
			  sub:    true,
			  boss:   true,
			  eqnull: true,
			  node:   true,
			  undef:  true,
			  globals: {
				
				_:       false,
				jQuery:  false,
				angular: false,
				moment:  false,
				console: false,
				$:       false,
				io:      false
				}
			  }
		},
		concat: {
			dist: {			  
			  src: ['Client/js/app.js', 'Client/js/cfg.js', 'Client/js/onFinishRender.js', 'Client/js/LoginController.js', 'Client/js/RoomsController.js', 'Client/js/RoomController.js',
		            '!Client/**/socket.io.min.js', '!Client/**/socket-factory.js'],
			  dest: 'Client/dist/built.js'
			}
		},
		uglify: {
   			my_target: {
      			files: {
        			'Client/dist/built.min.js': ['Client/dist/built.js']
      			}
    		}
  		}
	});
	grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
}