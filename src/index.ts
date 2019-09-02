import { Vector2 } from 'three';
import { readFile } from 'fs';

function orientation(p: Vector2, q: Vector2, r: Vector2) {
  // Return positive if p-q-r are clockwise, neg if ccw, zero if colinear.
  return (q.y - p.y) * (r.x - p.x) - (q.x - p.x) * (r.y - p.y);
}

function hulls(points: Vector2[]) {
  // Graham scan to find upper and lower convex hulls of a set of 2d points.
  const U: Vector2[] = [];
  const L: Vector2[] = [];
  points.sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y));
  for (const p of points) {
    while (
      U.length > 1 &&
      orientation(U[U.length - 2], U[U.length - 1], p) <= 0
    ) {
      U.pop();
    }
    while (
      L.length > 1 &&
      orientation(L[L.length - 2], L[L.length - 1], p) >= 0
    ) {
      L.pop();
    }
    U.push(p);
    L.push(p);
  }
  return [U, L];
}

function rotatingCalipers(points: Vector2[]) {
  // Given a list of 2d points, finds all ways of sandwiching the points between two parallel lines that touch one point each, and yields the sequence of pairs of points touched by each pair of lines.
  const [U, L] = hulls(points);
  let i = 0;
  let j = L.length - 1;
  const result: Vector2[][] = [];
  while (i < U.length - 1 || j > 0) {
    result.push([U[i], L[j]]);
    // if all the way through one side of hull, advance the other side
    if (i === U.length - 1) {
      j--;
    } else if (j == 0) {
      i += 1;
    }
    // still points left on both lists, compare slopes of next hull edges
    // being careful to avoid divide-by-zero in slope calculation
    else if (
      (U[i + 1].y - U[i].y) * (L[j].x - L[j - 1].x) >
      (L[j].y - L[j - 1].y) * (U[i + 1].x - U[i].x)
    ) {
      i++;
    } else {
      j--;
    }
  }
  return result;
}

function diameter(points: Vector2[]) {
  console.log(rotatingCalipers(points));
  const { squaredDiameter, pair } = rotatingCalipers(points)
    .map(([p, q]) => ({
      squaredDiameter: p.distanceTo(q),
      pair: [p, q]
    }))
    .reduce(
      (acc, value) =>
        value.squaredDiameter > acc.squaredDiameter ? value : acc,
      {
        squaredDiameter: 0,
        pair: []
      }
    );
  console.log(squaredDiameter, pair);
}

readFile('./points2.json', { encoding: 'utf-8' }, (err, data) => {
  const points = (JSON.parse(data) as number[][]).map(p =>
    new Vector2().fromArray(p)
  );
  console.log(diameter(points));
});
