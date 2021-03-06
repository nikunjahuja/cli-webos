var path = require('path')
module.exports = TarFilterPack
var inherits = require('inherits')
var tar = require('tar')
var collect = require('fstream').collect
inherits(TarFilterPack, tar.Pack)

function TarFilterPack (a) {
  this.permission = a.permission
  if (!(this instanceof TarFilterPack)) return new TarFilterPack(a)
  TarFilterPack.super.call(this, a)
}
TarFilterPack.prototype.add = function (a) {
  this._global && !this._didGlobal && this.addGlobal(this._global)
  if (this._ended) return this.emit('error', Error('add after end'))
  collect(a)
  this.permission[a.basename] && (a.props.mode = parseInt(this.permission[a.basename], 8))
  if (a.basename.length !== Buffer.byteLength(a.basename)) {
    var b = 'Please use the file name in english letters. \n\t\t (' + path.relative(a.root.props.path, a.path) + ')';
    (new (require('events').EventEmitter)()).emit('error', Error(b))
  }
  a.props.uid > 2097151 &&
    (a.props.uid = 0)
  a.props.gid > 2097151 && (a.props.gid = 0)
  this._buffer.push(a)
  this._process()
  this._needDrain = this._buffer.length > 0
  return !this._needDrain
}
