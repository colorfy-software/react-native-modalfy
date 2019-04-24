let validateFormat = () => {}

if (process.env !== 'production') {
  validateFormat = format => {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument')
    }
  }
}

export default function(condition, format, a, b, c, d, e, f) {
  validateFormat(format)

  if (!condition) {
    let error
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.'
      )
    } else {
      const args = [a, b, c, d, e, f]
      const argIndex = 0
      error = new Error(
        format.replace(/%s/g, function() {
          return args[argIndex++]
        })
      )
      error.name = 'Invariant Violation'
    }

    error.framesToPop = 1
    throw error
  }
}
