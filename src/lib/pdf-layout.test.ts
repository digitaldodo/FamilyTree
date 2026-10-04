import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { jsPDF } from 'jspdf';
import {
  computePixelRatio,
  computeTreeLayout,
  getPageSize,
  MIN_READABLE_MM_PER_PX,
  resolveOrientation,
} from './pdf-layout';

/** Builds a real jsPDF page from a layout and returns the MediaBox it wrote. */
function mediaBoxOf(layout: ReturnType<typeof computeTreeLayout>) {
  const pdf = new jsPDF({
    orientation: layout.page.orientation,
    unit: 'mm',
    format: [layout.page.width, layout.page.height],
  });
  const raw = Buffer.from(pdf.output('arraybuffer')).toString('latin1');
  const match = raw.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/);
  assert.ok(match, 'PDF has a MediaBox');
  const [, , , w, h] = match;
  return { widthPt: parseFloat(w), heightPt: parseFloat(h) };
}

const MM_TO_PT = 72 / 25.4;

describe('orientation resolution', () => {
  test('defaults to landscape', () => {
    assert.strictEqual(resolveOrientation(undefined, 500, 2000), 'landscape');
  });
  test('explicit portrait is respected', () => {
    assert.strictEqual(resolveOrientation('portrait', 2000, 500), 'portrait');
  });
  test('auto follows tree proportions', () => {
    assert.strictEqual(resolveOrientation('auto', 2000, 500), 'landscape');
    assert.strictEqual(resolveOrientation('auto', 500, 2000), 'portrait');
  });
});

describe('A4 pages', () => {
  test('A4 landscape is 297 x 210', () => {
    const p = getPageSize('A4', 'landscape');
    assert.deepStrictEqual([p.width, p.height], [297, 210]);
  });
  test('A4 portrait is 210 x 297', () => {
    const p = getPageSize('A4', 'portrait');
    assert.deepStrictEqual([p.width, p.height], [210, 297]);
  });
});

describe('tree layout', () => {
  const trees = [
    { name: 'tiny', w: 400, h: 240 },
    { name: 'medium', w: 1400, h: 900 },
    { name: 'wide', w: 3200, h: 700 },
    { name: 'tall', w: 900, h: 3000 },
    { name: 'large', w: 5000, h: 3600 },
  ];

  for (const orientation of ['landscape', 'portrait'] as const) {
    for (const t of trees) {
      test(`${t.name} tree, ${orientation}: real PDF page matches, tree fits and is centered`, () => {
        const layout = computeTreeLayout({
          treeWidthPx: t.w,
          treeHeightPx: t.h,
          orientation,
        });

        // The actual PDF MediaBox reflects the requested orientation.
        const box = mediaBoxOf(layout);
        assert.ok(Math.abs(box.widthPt - layout.page.width * MM_TO_PT) < 0.5);
        assert.ok(Math.abs(box.heightPt - layout.page.height * MM_TO_PT) < 0.5);
        assert.strictEqual(box.widthPt > box.heightPt, orientation === 'landscape');

        // Entire tree is inside the printable area (nothing cropped).
        const { area, image } = layout;
        const eps = 1e-6;
        assert.ok(image.x >= area.x - eps && image.y >= area.y - eps);
        assert.ok(image.x + image.w <= area.x + area.w + eps);
        assert.ok(image.y + image.h <= area.y + area.h + eps);

        // Aspect preserved.
        assert.ok(Math.abs(image.w / image.h - t.w / t.h) < 1e-6);

        // Centered both ways.
        assert.ok(Math.abs(image.x + image.w / 2 - (area.x + area.w / 2)) < 1e-6);
        assert.ok(Math.abs(image.y + image.h / 2 - (area.y + area.h / 2)) < 1e-6);

        // It fills the area on at least one axis (no huge unused region).
        const fillsW = Math.abs(image.w - area.w) < 1e-6;
        const fillsH = Math.abs(image.h - area.h) < 1e-6;
        assert.ok(fillsW || fillsH);
      });
    }
  }

  test('a normal tree stays on A4 landscape (297 x 210)', () => {
    const layout = computeTreeLayout({ treeWidthPx: 1400, treeHeightPx: 900, orientation: 'landscape' });
    assert.strictEqual(layout.page.paper, 'A4');
    assert.deepStrictEqual([layout.page.width, layout.page.height], [297, 210]);
    assert.ok(layout.mmPerPx >= MIN_READABLE_MM_PER_PX);
  });

  test('a very large tree steps up to a larger landscape ISO size, not portrait', () => {
    const layout = computeTreeLayout({ treeWidthPx: 5000, treeHeightPx: 3600 });
    assert.notStrictEqual(layout.page.paper, 'A4');
    assert.strictEqual(layout.page.orientation, 'landscape');
    assert.ok(layout.page.width > layout.page.height);
    assert.ok(Math.abs(layout.page.width / layout.page.height - Math.SQRT2) < 0.01);
  });

  test('papers can be restricted (physical printing stays on A4)', () => {
    const layout = computeTreeLayout({ treeWidthPx: 5000, treeHeightPx: 3600, papers: ['A4'] });
    assert.strictEqual(layout.page.paper, 'A4');
  });

  test('empty bounds are rejected', () => {
    assert.throws(() => computeTreeLayout({ treeWidthPx: 0, treeHeightPx: 100 }));
  });
});

describe('pixel ratio', () => {
  test('stays within limits and the pixel budget', () => {
    const layout = computeTreeLayout({ treeWidthPx: 6000, treeHeightPx: 4000 });
    const ratio = computePixelRatio(layout, 6000, 4000);
    assert.ok(ratio > 0 && ratio <= 3);
    assert.ok(6000 * 4000 * ratio * ratio <= 16_000_000 + 1);
  });
});
