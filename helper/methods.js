const strings = require('./strings')

module.exports = {
  handleErrors: (err, res) => {
    if (err.name && err.name === 'CustomError') return res.status(200).json({ success: false, message: strings.anErrorHappened, error: err.message })
    return res.status(500).json({ success: false, message: strings.anErrorHappened, error: err.message, stack: err.stack })
  }
}
