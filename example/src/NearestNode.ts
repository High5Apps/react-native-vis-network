import type { Position } from 'react-native-vis-network';

export default function getNearestNodeInfo(
  { x: clickX, y: clickY }: Position,
  nodePositions: { [nodeId: string]: Position }
) {
  let nearestDistance: number | undefined;
  let nearestId: string | undefined;

  Object.keys(nodePositions).forEach((nodeId) => {
    const position = nodePositions[nodeId];
    if (!position) {
      return;
    }

    const { x: nodeX, y: nodeY } = position;
    const distance = Math.pow(nodeX - clickX, 2) + Math.pow(nodeY - clickY, 2);
    if (nearestDistance === undefined || distance < nearestDistance) {
      nearestDistance = distance;
      nearestId = nodeId;
    }
  });

  return { nearestDistance, nearestId };
}
