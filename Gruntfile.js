module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	const project_name = 'Plasmon'
	const electron_version = '0.30.1';
	const is_development = process.argv[2] !== 'build';
	grunt.initConfig({

		babel: {
			dist: {
				files: {
					'main.js': './src/main.js'
				}
			}
		},
		browserSync: {
			dev: {
				bsFiles: {
					src : [
						'index.html',
						'script.js'
					]
				},
				options: {
					open: false,
					server: './'
				}
			}
		},
		browserify: {
			options: {
				browserifyOptions: {
					ignoreMissing: true,
					debug: is_development
				},
				watch: is_development,
				transform: [require("babelify")],
			},
			app: {
				src: './src/app.js',
				dest:'script.js'
			}
		},
		copy: {
			main: {
				files: [{
					expand: true,
					src: ['index.html', 'script.js', 'main.js', 'package.json'],
					dest: 'build/app/'
				}]
			}
		},
		electron: {
			linux: {
				options: {
					name: project_name,
					dir: 'build/app/',
					out: 'build/',
					version: electron_version,
					platform: 'linux',
					arch: 'x64',
					overwrite: true,
					asar: true
				}
			},
			osx: {
				options: {
					name: project_name,
					dir: 'build/app/',
					out: 'build/',
					version: electron_version,
					platform: 'darwin',
					arch: 'x64',
					overwrite: true,
					asar: true
				}
			}
		}
	});
	grunt.registerTask('default', ['babel', 'browserify', 'browserSync']);
	grunt.registerTask('build', ['babel', 'browserify', 'copy', 'electron']);
}
