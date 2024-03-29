# Supported OSes

- MacOS 10.11 and later (including M1 chips)
- Windows 7 and later 32 and 64bit in the same file
- Linux Ubuntu 14.04 or later, Fedora 24 or later, Debian 8 or later

# Getting Started

### 1. `npm i`

### 2. `npm run dev`

# Note for mac before build:

```
export APPLE_ID=<apple_email>
export APPLE_PROVIDER=<apple team id>
export APPLE_ID_PASSWORD=<application password>
```

# Available Scripts

### `npm run dev`

Runs the app in the development mode.

### `npm run build`

All OS builds in the `build` folder.

### `npm run build-l`

Only Linux OS build.

### `npm run build-m`

Only Mac OS build.

### `npm run build-w`

Only Windows OS build.

# creating a release

- update the package.json by incrementing the `version` key ( ie 1.2.3 )
- commit the changes ( commit message should be `vx.y.z`, example `v1.2.8`)
``` bash
git add package.json
git commit -am v1.2.8
```
- create a tag and push
```bash
git tag v1.2.8
git push && git push --tags
```
