module.exports = function ( grunt ) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.initConfig({
	  jshint: {
		// jshint task configuration goes here.
		src: ['Client/**/*.js', '!Client/**/socket.io.min.js', '!Client/**/socket-factory.js'],
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
			}
	});
}