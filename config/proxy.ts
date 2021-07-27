/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    // '/api/auth/': {
    //   target: 'http://192.168.1.107:5000/',
    //   changeOrigin: true,
    //   pathRewrite: { '^/api/auth': '' },
    // },
    '/api/auth': {
      target: 'http://192.168.1.104:5000', // https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^/api/auth': '' },
    },
    '/api/live': {
      target: 'http://192.168.1.104:5000', // https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^/api/live': '' },
    },
  },
  test: {
    '/api/': {
      target: 'http://localhost:8000', // https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
