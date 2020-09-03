import { rnnOverviewConfig } from '../config.js';

// Configs
const nodeHeight = rnnOverviewConfig.nodeHeight;
const nodeLength = rnnOverviewConfig.nodeLength;
const inputNodeHeight = rnnOverviewConfig.inputNodeHeight;
const embeddingLen = rnnOverviewConfig.embedddingLength;

/**
 * Compute the [minimum, maximum] of a 1D or 2D array.
 * @param {[number] or number} array or number
 */
export  const getExtent = (array) => {
  let min = Infinity;
  let max = -Infinity;

  // Scalar
  if (array.length === undefined || array.length === 1 ) {
    return [array, array];
  }

  // 1D array
  if (array[0].length === undefined) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] < min) {
        min = array[i];
      } else if (array[i] > max) {
        max = array[i];
      }
    }
    return [min, max];
  }

  // 2D array
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[0].length; j++) {
      if (array[i][j] < min) {
        min = array[i][j];
      } else if (array[i][j] > max) {
        max = array[i][j];
      }
    }
  }
  return [min, max];
}

/**
 * Convert the svg element center coord to document absolute value
 * // Inspired by https://github.com/caged/d3-tip/blob/master/index.js#L286
 * @param {elem} elem 
 */
export const getMidCoords = (svg, elem) => {
  if (svg !== undefined) {
    let targetel = elem;
    while (targetel.getScreenCTM == null && targetel.parentNode != null) {
      targetel = targetel.parentNode;
    }
    // Get the absolute coordinate of the E point of element bbox
    let point = svg.node().ownerSVGElement.createSVGPoint();
    let matrix = targetel.getScreenCTM();
    let tbbox = targetel.getBBox();
    // let width = tbbox.width;
    let height = tbbox.height;

    point.x += 0;
    point.y -= height / 2;
    let bbox = point.matrixTransform(matrix);
    return {
      top: bbox.y,
      left: bbox.x
    };
  }
}

/**
 * Return the output knot (right boundary center)
 * @param {object} point {x: x, y:y}
 */
export const getOutputKnotRNN = (point, deltaX, deltaY) => {
  return {
    x: point.x + deltaX,
    y: point.y + deltaY
  };
}

/**
 * Return the output knot (left boundary center)
 * @param {object} point {x: x, y:y}
 */
export const getInputKnotRNN = (point,deltaY) => {
  return {
    x: point.x,
    y: point.y + deltaY 
  }
}

/**
 * Compute edge data
 * @param {[[[number, number]]]} nodeCoordinate Constructed neuron svg locations
 * @param {[object]} rnn Constructed rnn model
 */
export const getLinkDataRNN = (nodeCoordinate, rnn) => {
  let linkData = [];
  // Create links backward (starting for the first layer)
  for (let l = 1; l < rnn.length; l++) {
    for (let n = 0; n < rnn[l].length; n++) {
      let isOutput = rnn[l][n].layerName === 'output';
      // for calibration of the position of y in dense layer is nodeHeight /2, 
      let targetDeltaY = l ===1 ? inputNodeHeight/2 : nodeHeight /2;
      let curTarget = getInputKnotRNN(nodeCoordinate[l][n],targetDeltaY);
      for (let p = 0; p < rnn[l][n].inputLinks.length; p++) {
        // Specially handle output layer (since we are ignoring the flatten)
        let inputNodeIndex = rnn[l][n].inputLinks[p].source.index;
        
        if (isOutput) {
          let flattenDimension = rnn[l-1][0].output.length *
            rnn[l-1][0].output.length;
          if (inputNodeIndex % flattenDimension !== 0){
              continue;
          }
          inputNodeIndex = Math.floor(inputNodeIndex / flattenDimension);
        }
        // check if the source node in input layer exists, skip it if not
        let curSource;
        let sourceDeltaX = rnn[l-1][n].type !== 'embedding'? nodeLength: embeddingLen;
        // the height of input elements is nodeLength /10
        let sourceDeltaY = l===1? inputNodeHeight/2 :nodeHeight /2;
        if (rnn[l-1][inputNodeIndex]){
          curSource = getOutputKnotRNN(nodeCoordinate[l-1][inputNodeIndex], sourceDeltaX, sourceDeltaY);
        } else {

          continue
        }
        let curWeight = rnn[l][n].inputLinks[p].weight;
        linkData.push({
          source: curSource,
          target: curTarget,
          weight: curWeight,
          targetLayerIndex: l,
          targetNodeIndex: n,
          sourceNodeIndex: inputNodeIndex
        });
      }
    }
  }
  return linkData;
}

/**
 * Return the output knot (right boundary center)
 * @param {object} point {x: x, y:y}
 */
export const getOutputKnot = (point) => {
  return {
    x: point.x + nodeLength,
    y: point.y + nodeLength / 2
  };
}

/**
 * Return the output knot (left boundary center)
 * @param {object} point {x: x, y:y}
 */
export const getInputKnot = (point) => {
  return {
    x: point.x,
    y: point.y + nodeLength / 2
  }
}

/**
 * Compute edge data
 * @param {[[[number, number]]]} nodeCoordinate Constructed neuron svg locations
 * @param {[object]} cnn Constructed CNN model
 */
export const getLinkData = (nodeCoordinate, cnn) => {
  let linkData = [];
  // Create links backward (starting for the first conv layer)
  for (let l = 1; l < cnn.length; l++) {
    for (let n = 0; n < cnn[l].length; n++) {
      let isOutput = cnn[l][n].layerName === 'output';
      let curTarget = getInputKnot(nodeCoordinate[l][n]);
      for (let p = 0; p < cnn[l][n].inputLinks.length; p++) {
        // Specially handle output layer (since we are ignoring the flatten)
        let inputNodeIndex = cnn[l][n].inputLinks[p].source.index;
        
        if (isOutput) {
          let flattenDimension = cnn[l-1][0].output.length *
            cnn[l-1][0].output.length;
          if (inputNodeIndex % flattenDimension !== 0){
              continue;
          }
          inputNodeIndex = Math.floor(inputNodeIndex / flattenDimension);
        }
        let curSource = getOutputKnot(nodeCoordinate[l-1][inputNodeIndex]);
        let curWeight = cnn[l][n].inputLinks[p].weight;
        linkData.push({
          source: curSource,
          target: curTarget,
          weight: curWeight,
          targetLayerIndex: l,
          targetNodeIndex: n,
          sourceNodeIndex: inputNodeIndex
        });
      }
    }
  }
  return linkData;
}


/**
 * Color scale wrapper (support artificially lighter color!)
 * @param {function} colorScale D3 color scale function
 * @param {number} range Color range (max - min)
 * @param {number} value Color value
 * @param {number} gap Tail of the color scale to skip
 */
export const gappedColorScale = (colorScale, range, value, gap) => {
  if (gap === undefined) { gap = 0; }
  let normalizedValue = (value + range / 2) / range;
  return colorScale(normalizedValue * (1 - 2 * gap) + gap);
}