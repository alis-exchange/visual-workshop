'use strict';
const path = require('path');

module.exports =
{
  devServer:
  {
    port: 3000,
    overlay:
    {
      errors: true,
      warnings: true
    },
  },
  lintOnSave: process.env.NODE_ENV !== 'production' ? 'error' : false,
  css:
  {
    sourceMap: process.env.NODE_ENV === 'development',
    loaderOptions:
    {
      postcss:
      {
        config:
        {
          // without this Webpack complains that there is no PostCSS config inside the Vuetify/dist folder
          path: path.resolve(__dirname, '.postcssrc.js'),
        }
      },
    }
  },
  productionSourceMap: false, // overruled by "devtool"
  configureWebpack: (config) =>
  {
    let parent;
    let dir = path.resolve(__dirname);
    const parsed = path.parse(dir);
    while (parsed.root !== dir)
    {
      dir = path.dirname(dir);
      parent = dir + (parsed.root != dir ? path.sep : '') + 'node_modules';
      config.resolve.modules.push(parent);
      config.resolveLoader.modules.push(parent);
    }

    config.devtool = process.env.NODE_ENV === 'development' ? 'inline-source-map' : false; // other modes often break hot-reload and/or breakpoints
    if (!config.performance) config.performance = {};
    config.performance.hints = false;
  },
  chainWebpack: config =>
  {
    config.resolve.symlinks(false);
    if (process.env.NODE_ENV === 'development')
    {
      config.module.rule('eslint').use('eslint-loader').loader('eslint-loader').tap(options =>
      {
        delete options.cacheIdentifier;
        options.cache = false; // otherwise on each restart cached errors won't be shown !!!
        return options;
      });
    }
    config.module.rule('vue').use('vue-loader').loader('vue-loader').tap(options =>
    {
      delete options.cacheDirectory;
      return options;
    });
    config.module.rule('vue').uses.delete('cache-loader');
    config.module.rule('js').uses.delete('cache-loader');
    config.plugins.delete('prefetch'); // for async routes
    config.plugins.delete('preload'); // for CSS

    // condense whitespace in templates
    config.module.rule('vue').use('vue-loader').tap(options =>
    {
      options.compilerOptions = { whitespace: 'condense' };
      return options;
    });

    return config;
  }
};
