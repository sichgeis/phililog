// RKI: Referenzperzentile, zweite erweiterte Ausgabe (2013), printed p. 31 (PDF p. 33).
// Girls: KiGGS 2003–2006 and German perinatal data 1995–2000.
// Source: https://edoc.rki.de/bitstream/handle/176904/3254/28jWMa04ZjppM.pdf?sequence=
// Retrieved 2026-10-04. PDF SHA-256: 8c07f5bbca89b0f14dd3dac1ac609a76f0805aadf2f587ef290eef1e7ea51442
// [age in months, P10 grams, P50 median grams, P90 grams]. RKI months 1 and 2 are interpolated.
// Reproduce: python3 scripts/extract-kiggs-weight.py /path/to/download.pdf
export const KIGGS_WEIGHT_GIRLS: readonly (readonly [number, number, number, number])[] = [
  [0, 2840, 3390, 3930],
  [1, 3540, 4200, 4910],
  [2, 4240, 5000, 5840],
  [3, 4780, 5610, 6560],
  [4, 5370, 6250, 7280],
  [5, 5880, 6820, 7910],
  [6, 6320, 7300, 8450],
  [7, 6700, 7720, 8920],
  [8, 7040, 8090, 9330],
  [9, 7340, 8430, 9720],
  [10, 7630, 8750, 10090],
  [11, 7900, 9060, 10440],
  [12, 8160, 9340, 10770],
  [15, 8830, 10100, 11650],
  [18, 9400, 10760, 12430],
  [21, 9910, 11350, 13150],
  [24, 10420, 11950, 13870],
  [30, 11460, 13180, 15380],
  [36, 12480, 14420, 16940],
  [42, 13390, 15540, 18390],
  [48, 14250, 16600, 19780],
  [54, 15120, 17690, 21230],
  [60, 16040, 18840, 22790],
  [66, 17000, 20060, 24450],
];
