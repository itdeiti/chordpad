# Changelog

## [5.2.0](https://github.com/itdeiti/chordpad/compare/v5.1.0...v5.2.0) (2026-05-13)


### Features

* add the ability to paste raw chords and parse them. implement tests for parsing ([360b4ce](https://github.com/itdeiti/chordpad/commit/360b4cef23665d76346bc3c695c7a8a00a6d3d41))

## [5.1.0](https://github.com/itdeiti/chordpad/compare/v5.0.0...v5.1.0) (2026-05-13)


### Features

* make chords editable ([59e95ea](https://github.com/itdeiti/chordpad/commit/59e95ea3db374c004b297c34ee0e36031966e3ad))

## [5.0.0](https://github.com/itdeiti/chordpad/compare/v4.2.0...v5.0.0) (2026-05-13)


### ⚠ BREAKING CHANGES

* Full refactor summary — all four conventions enforced across src/:

### Features

* song-reducer.ts — added DUPLICATE_SECTION action + nextCopyName helper. Inserts clone right after the source, gives fresh UUIDs to the section and each chord, makes the clone active, clears staging. Naming: "Verse" → "Verse copy" → "Verse copy 2" → "Verse copy 3". ([650672f](https://github.com/itdeiti/chordpad/commit/650672f8ee4a2c1cc3544c4910b9b60bc11423a2))


### Bug Fixes

* Full refactor summary — all four conventions enforced across src/: ([2e33e3a](https://github.com/itdeiti/chordpad/commit/2e33e3a28b556f8f81f1667161d8f6a21948a1b4))
* no default export ([c9d507f](https://github.com/itdeiti/chordpad/commit/c9d507fa3d94902b21e53e72ed0cc86699f6d88e))

## [4.2.0](https://github.com/itdeiti/chordpad/compare/v4.1.0...v4.2.0) (2026-05-13)


### Features

* add circle of fifths ([884a0bc](https://github.com/itdeiti/chordpad/commit/884a0bcefdd0ea233ca66db3d732adf2d47fb798))

## [4.1.0](https://github.com/itdeiti/chordpad/compare/v4.0.0...v4.1.0) (2026-05-13)


### Features

* add more chord extensions ([ce26b72](https://github.com/itdeiti/chordpad/commit/ce26b728df0a61168c4479da19a33949bcb9e634))


### Bug Fixes

* add logic so dragging works on mobile devices ([610f9af](https://github.com/itdeiti/chordpad/commit/610f9af03fb3abeffd3a672f388fe1a81f87bbda))

## [4.0.0](https://github.com/itdeiti/chordpad/compare/v3.0.0...v4.0.0) (2026-05-13)


### ⚠ BREAKING CHANGES

* add chord diagrams to output

### Features

* add chord diagrams to output ([10d9bb8](https://github.com/itdeiti/chordpad/commit/10d9bb80def027d16e0417b20353a6d65b936d61))

## [3.0.0](https://github.com/itdeiti/chordpad/compare/v2.1.1...v3.0.0) (2026-05-12)


### ⚠ BREAKING CHANGES

* add dragndrop for chords

### Features

* add dragndrop for chords ([4abecb4](https://github.com/itdeiti/chordpad/commit/4abecb4cc8a569036096bfd81d6516e548c70a81))

## [2.1.1](https://github.com/itdeiti/chordpad/compare/v2.1.0...v2.1.1) (2026-05-12)


### Bug Fixes

* fix vulnerabilities ([9c8feec](https://github.com/itdeiti/chordpad/commit/9c8feec8bedaad12ae3f41ce0167cec39531348f))
* resolve dependancy issues bump eslint to 10 and make eslint and eslint js a group for dependabot ([f3dc0a2](https://github.com/itdeiti/chordpad/commit/f3dc0a267b17234bffdbc93f89cc38af9d41e77d))

## [2.1.0](https://github.com/itdeiti/chordpad/compare/v2.0.0...v2.1.0) (2026-05-12)


### Features

* **playback:** better visual feedback for song playback. highlighting steps to all sections now ([50dbcf0](https://github.com/itdeiti/chordpad/commit/50dbcf0884a39072b83d69bd9204437d37050272))

## [2.0.0](https://github.com/itdeiti/chordpad/compare/v1.0.0...v2.0.0) (2026-05-12)


### ⚠ BREAKING CHANGES

* allow section or song playback

### Features

* add a printable A4 view ([b2f63b0](https://github.com/itdeiti/chordpad/commit/b2f63b0e5336af78a7b9f0862d0616aa17a36593))
* add audio playback via Tone.js ([83d21b3](https://github.com/itdeiti/chordpad/commit/83d21b304dba4aec6bae3f87384be27a7eff1a3e))
* add clear-all button to reset the song ([e7e8a4b](https://github.com/itdeiti/chordpad/commit/e7e8a4b8dfc7c69cd782184248790d7165031fcb))
* add per-chord beat duration and aligned bar output ([8cc6eb5](https://github.com/itdeiti/chordpad/commit/8cc6eb5883d87e241fd12f44fb138616e7d89efa))
* allow section or song playback ([57bd685](https://github.com/itdeiti/chordpad/commit/57bd685fa105f464d6a0a2eef82cab348a516a1b))
* persist song state to localStorage ([511a999](https://github.com/itdeiti/chordpad/commit/511a9991827a3b66e316ea2e47505e5395772422))
* support multiple songs with a library and song picker ([03f7d58](https://github.com/itdeiti/chordpad/commit/03f7d58fc7a53cc4ee2084dfbaf760d0e7753078))
