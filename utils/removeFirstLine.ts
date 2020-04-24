import { Transform } from 'stream'
import util from 'util'

function RemoveFirstLine(this: any, args): void {
  if (!(this instanceof RemoveFirstLine)) {
    return new RemoveFirstLine(args)
  }
  Transform.call(this, args)
  this.buff = ''
  this.removed = false
}

RemoveFirstLine.prototype._transform = function _transform(chunk, encoding, done) {
  if (this.removed) {
    this.push(chunk)
  } else {
    this.buff += chunk.toString()
    if (this.buff.indexOf('\n') !== -1) {
      this.push(this.buff.slice(this.buff.indexOf('\n') + 1))
      this.buff = null
      this.removed = true
    }
  }
  done()
}

util.inherits(RemoveFirstLine, Transform)

export default RemoveFirstLine
