/* global d3 */

const layerColorScales = {
  input: [d3.interpolateGreys, d3.interpolateGreys, d3.interpolateGreys],
  conv: d3.interpolateRdBu,
  relu: d3.interpolateRdBu,
  pool: d3.interpolateRdBu,
  fc: d3.interpolateGreys,
  weight: d3.interpolateBrBG,
  logit: d3.interpolateOranges
};

let nodeLength = 40;

export const overviewConfig = {
  nodeLength : nodeLength,
  plusSymbolRadius : nodeLength / 5,
  numLayers : 12,
  edgeOpacity : 0.8,
  edgeInitColor : 'rgb(230, 230, 230)',
  edgeHoverColor : 'rgb(130, 130, 130)',
  edgeHoverOuting : false,
  edgeStrokeWidth : 0.7,
  intermediateColor : 'gray',
  layerColorScales: layerColorScales,
  svgPaddings: {top: 25, bottom: 25, left: 50, right: 50},
  kernelRectLength: 8/3,
  gapRatio: 4,
  overlayRectOffset: 12,
  classLists: ['lifeboat', 'ladybug', 'pizza', 'bell pepper', 'school bus',
    'koala', 'espresso', 'red panda', 'orange', 'sport car']
};

const layerColorScales_rnn = {
  input: d3.interpolateGreys,
  conv: d3.interpolateRdBu,
  embedding: d3.interpolateRdBu,
  lstm: d3.interpolateRdBu,
  // dense: d3.interpolateRdBu,
  dense: d3.interpolateGreys,
  weight: d3.interpolateBrBG,
  logit: d3.interpolateOranges
};

let nodeLength_rnn = 96;

export const rnnOverviewConfig = {
  nodeLength : nodeLength_rnn,
  nodeHeight : nodeLength_rnn / 10,
  embedddingLength : nodeLength_rnn / 20 * 64, // a bit large may be better
  // embedddingLength: nodeLength_rnn,
  inputNodeHeight : nodeLength_rnn / 20, 
  plusSymbolRadius : nodeLength_rnn / 10, 
  numLayers : 4,
  edgeOpacity : 0.8,
  edgeInitColor : 'rgb(230, 230, 230)',
  edgeHoverColor : 'rgb(130, 130, 130)',
  edgeHoverOuting : false,
  edgeStrokeWidth : 0.4,
  intermediateColor : 'gray',
  layerColorScales: layerColorScales_rnn,
  svgPaddings: {top: 25, bottom: 25, left: 25, right: 25},
  kernelRectLength: 8/3,
  gapRatio: 4,
  overlayRectOffset: 12,
  classLists: ['Hate', 'Love']
};