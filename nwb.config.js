module.exports = {
  type: 'react-app',
  polyfill: false,
  // React is leaving a global process reference hanging around
  webpack: {
    extra: {
      node: {
        process: false
      }
    }
  }
}
