// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const withReactSvg = require('next-react-svg')

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'app/styles')],
  },
  typescript: {
    //true == Dangerously allow production builds to successfully complete even if  your project has type errors.
    ignoreBuildErrors: false,
  },
  future: {
    webpack5: true,
  },
  reactStrictMode: true,
};
module.exports = withReactSvg({
  include: path.resolve(__dirname, 'public/assets/svg'),
  webpack(config, options) {
    return config
  }
})