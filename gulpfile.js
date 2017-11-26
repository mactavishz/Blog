const gulp = require('gulp')
const del = require('del')

// copy the public folder to the outer directory
gulp.task('copy', function() {
  return gulp.src([
    'public/**/*',
    '!public/**/*.map',
    '!public/**/*.scss',
    '!public/**/*[!min].js',
    '!public/**/*[!min].css'
  ])
    .pipe(gulp.dest('../public'))
})

// delete the inner public folder
gulp.task('deleteInnerPublicFolder', ['copy'], function(cb) {
  del.sync('public', {
    // delete the folder outside the cwd
    force: true
  })
  cb()
})

gulp.task('build', ['deleteInnerPublicFolder'])