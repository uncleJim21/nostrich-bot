const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './public/icons/png/512x512',
    electronPackagerConfig: {
      win32metadata: {
        'content-security-policy': "default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
      }
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel', // Windows Installer
      platforms: ['win32'], 
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin','mac','windows'],
    },
    {
      name: '@electron-forge/maker-dmg', // macOS DMG package
      platforms: ['darwin'],
      config: {
        format: 'ULFO', // Ensures compatibility with macOS
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './public/icons/png/512x512.png',
          categories: ['Utility'],
          mimeType: ['x-scheme-handler/nostrich'],
          desktop: {
            Name: 'NostrichBot',
            Type: 'Application',
            Comment: 'Nostr Post Scheduler',
            Icon: 'nostrich-bot',
            Terminal: false,
            Categories: 'Utility;'
          }
        }
      }
    },
  ],
  plugins: [
      {
        name: '@electron-forge/plugin-auto-unpack-natives',
        config: {},
      },
      {
        name: '@electron-forge/plugin-webpack',
        config: {
          mainConfig: './webpack.main.config.js',
          renderer: {
            config: './webpack.renderer.config.js',
            entryPoints: [
              {
                html: './src/index.html',
                js: './src/renderer.js',
                name: 'main_window',
                preload: {
                  js: './src/preload.js',
                  config: './webpack.preload.config.js'  // Add this line
                },
              },
            ],
          },
        },
      },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
