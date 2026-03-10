/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.zettelkastener.app',
  productName: 'Zettelkastener',
  directories: {
    buildResources: 'build',
    output: 'release',
  },
  files: ['dist/**/*'],
  mac: {
    target: [{ target: 'dmg', arch: ['arm64', 'x64'] }],
    category: 'public.app-category.productivity',
  },
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    category: 'Office',
  },
};
