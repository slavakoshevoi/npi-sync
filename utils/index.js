import _ from 'lodash'

const S = function _string(str) {
  if (typeof str !== 'number' || _.isNaN(str)) str = str || ''
  return String(str)
}

const N = function _number(number, digits = 6) {
  number = +number || 0
  const scale = digits ** 10
  return Math.round(number * scale) / scale
}

export {
  S, N,
}
