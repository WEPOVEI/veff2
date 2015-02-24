module.exports = function ( grunt ) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.initConfig({
	  jshint: {
		// jshint task configuration goes here.
		src: ['Client/**/*.js', '!Client/**/socket.io.min.js', '!Client/**/socket-factory.js'],
		options: {
			
		}
	  }
	});
}