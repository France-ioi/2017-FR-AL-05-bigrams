export const NUM_BIGRAMS_SEARCH = 6;
export const SYMBOL_DIGITS = 2;

export const NEUTRAL_HUE =
  ['gray', '#cccccc', '#eeeeee', '#ffffff'];
export const COLOR_PALETTE = [
  ['vert', '#a8cb62', '#9ff000', '#ccff99'],
  ['bleu', '#7ec6ce', '#0addf5', '#b6f5fc'],
  ['violet', '#c29cde', '#c87aff', '#e5c2ff'],
  ['rose', '#db94cf', '#ff33dd', '#ff99ee'],
  ['orange', '#d7a775', '#ff8400', '#ffc180'],
  ['jaune', '#e2d05a', '#ffdd00', '#ffeb66']
];

export function getBackgroundColor (index, isHint, isLocked) {
  const hue = typeof index === 'number' ? COLOR_PALETTE[index] : NEUTRAL_HUE;
  if (isHint) return hue[1];
  if (isLocked) return hue[2];
  return hue[3];
};
