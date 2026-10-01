export type Point = { x: number; y: number };

const EDGE = 0.4;

export function polygonArea(points: Point[]) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return sum / 2;
}

export function polygonCentroid(points: Point[]): Point {
  let cx = 0;
  let cy = 0;
  let signed = 0;
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const cross = current.x * next.y - next.x * current.y;
    signed += cross;
    cx += (current.x + next.x) * cross;
    cy += (current.y + next.y) * cross;
  }
  signed *= 0.5;
  if (Math.abs(signed) < 0.001) {
    const total = points.reduce(
      (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
      { x: 0, y: 0 },
    );
    return { x: total.x / points.length, y: total.y / points.length };
  }
  return { x: cx / (6 * signed), y: cy / (6 * signed) };
}

function lineSide(a: Point, b: Point, point: Point) {
  return (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
}

function dedupe(points: Point[]) {
  const unique: Point[] = [];
  for (const point of points) {
    const previous = unique[unique.length - 1];
    if (!previous || Math.hypot(previous.x - point.x, previous.y - point.y) > EDGE) {
      unique.push(point);
    }
  }
  if (unique.length > 2) {
    const first = unique[0];
    const last = unique[unique.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) <= EDGE) unique.pop();
  }
  return unique;
}

export function splitPolygon(poly: Point[], a: Point, b: Point): [Point[], Point[]] | null {
  const positive: Point[] = [];
  const negative: Point[] = [];
  let crosses = false;

  for (let i = 0; i < poly.length; i++) {
    const current = poly[i];
    const next = poly[(i + 1) % poly.length];
    const currentSide = lineSide(a, b, current);
    const nextSide = lineSide(a, b, next);

    if (currentSide >= -EDGE) positive.push(current);
    if (currentSide <= EDGE) negative.push(current);

    if ((currentSide > EDGE && nextSide < -EDGE) || (currentSide < -EDGE && nextSide > EDGE)) {
      const distance = currentSide / (currentSide - nextSide);
      const hit = {
        x: current.x + (next.x - current.x) * distance,
        y: current.y + (next.y - current.y) * distance,
      };
      positive.push(hit);
      negative.push(hit);
      crosses = true;
    }
  }

  if (!crosses) return null;
  const left = dedupe(positive);
  const right = dedupe(negative);
  if (left.length < 3 || right.length < 3) return null;
  if (Math.abs(polygonArea(left)) < 12 || Math.abs(polygonArea(right)) < 12) return null;
  return [left, right];
}

export function outwardPush(a: Point, b: Point, origin: Point, distance: number): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const gradientX = -dy / length;
  const gradientY = dx / length;
  const sign = Math.sign(lineSide(a, b, origin)) || 1;
  return { x: gradientX * sign * distance, y: gradientY * sign * distance };
}

export function fanTriangles(points: Point[]): Point[][] {
  if (points.length < 3) return [];
  if (points.length === 3) return [points];
  const center = polygonCentroid(points);
  const triangles: Point[][] = [];
  for (let i = 0; i < points.length; i++) {
    const next = points[(i + 1) % points.length];
    const triangle = [center, points[i], next];
    if (Math.abs(polygonArea(triangle)) >= 12) triangles.push(triangle);
  }
  return triangles;
}
