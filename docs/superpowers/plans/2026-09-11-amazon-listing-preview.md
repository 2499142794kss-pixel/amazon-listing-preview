# Amazon Listing Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, browser-only tool that imports listing images once, classifies them by dimensions and filename, and renders an image-only Amazon-style listing/A+ preview.

**Architecture:** A small static app with three focused modules: pure classification/sorting utilities, DOM rendering and interaction state, and the visual shell. Files are read locally with object URLs; no server or external library is required.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node's built-in test runner for pure utility tests.

**Spec:** `docs/superpowers/specs/2026-09-11-amazon-listing-preview-design.md`

## Global Constraints

- Images are processed in the browser and never uploaded.
- 1500×1500 images are listing images; 1464×1200 is the A+ KV; 1464×600 images are later A+ content.
- Filename suffix numbers control natural order; `A+3-2` sorts by group 3 then carousel position 2.
- The preview renders images only and does not add textual product descriptions.
- Image display uses `object-fit: contain` and does not crop source images.

### Task 1: Pure image classification and sorting

**Files:**
- Create: `src/catalog.js`
- Create: `test/catalog.test.js`

**Interfaces:**
- `classifyImage({ name, width, height })` returns `{ bucket, group, index, valid }`.
- `sortImages(images)` returns a new array sorted without mutating the input.

- [ ] **Step 1: Write failing tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyImage, sortImages } from '../src/catalog.js';

test('classifies the three supported dimensions', () => {
  assert.equal(classifyImage({ name: 'hero-1.jpg', width: 1500, height: 1500 }).bucket, 'listing');
  assert.equal(classifyImage({ name: 'A+1-1.jpg', width: 1464, height: 1200 }).bucket, 'kv');
  assert.equal(classifyImage({ name: 'A+3-2.jpg', width: 1464, height: 600 }).bucket, 'aplus');
});

test('sorts listing suffixes and A+ group/carousel suffixes naturally', () => {
  const images = [
    { name: 'A+3-10.jpg', width: 1464, height: 600 },
    { name: 'A+3-2.jpg', width: 1464, height: 600 },
    { name: 'product-10.jpg', width: 1500, height: 1500 },
    { name: 'product-2.jpg', width: 1500, height: 1500 },
  ];
  assert.deepEqual(sortImages(images).map((image) => image.name), [
    'product-2.jpg', 'product-10.jpg', 'A+3-2.jpg', 'A+3-10.jpg'
  ]);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test test/catalog.test.js`
Expected: FAIL because `src/catalog.js` does not exist.

- [ ] **Step 3: Implement the pure utilities**

```js
export function classifyImage({ name, width, height }) {
  const aplus = name.match(/A\+\s*(\d+)(?:[-_](\d+))?/i);
  const suffix = name.match(/(?:-|_)(\d+)(?:\.[^.]+)?$/);
  const dimensions = `${width}x${height}`;
  const bucket = dimensions === '1500x1500' ? 'listing'
    : dimensions === '1464x1200' ? 'kv'
    : dimensions === '1464x600' ? 'aplus' : 'other';
  return {
    bucket,
    group: aplus ? Number(aplus[1]) : 0,
    index: aplus?.[2] ? Number(aplus[2]) : suffix ? Number(suffix[1]) : 0,
    valid: bucket !== 'other',
  };
}

export function sortImages(images) {
  return [...images].sort((a, b) => {
    const left = a.meta ?? classifyImage(a);
    const right = b.meta ?? classifyImage(b);
    const bucketOrder = { listing: 0, kv: 1, aplus: 2, other: 3 };
    return bucketOrder[left.bucket] - bucketOrder[right.bucket]
      || left.group - right.group
      || left.index - right.index
      || a.name.localeCompare(b.name, undefined, { numeric: true });
  });
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test test/catalog.test.js`
Expected: PASS.

### Task 2: Build the static app shell and rendering

**Files:**
- Create: `index.html`
- Create: `src/app.js`
- Create: `styles.css`

**Interfaces:**
- `src/app.js` imports `classifyImage` and `sortImages`, owns selected files and object URL cleanup.
- DOM hooks are `#dropzone`, `#file-input`, `#clear-button`, `#listing-thumbs`, `#listing-hero`, `#kv-preview`, and `#aplus-grid`.

- [ ] **Step 1: Add the semantic shell**

Create a split layout with a drag/drop upload card on the left and a phone-like listing preview on the right. The preview contains only image slots, thumbnails, and neutral empty states.

- [ ] **Step 2: Add the renderer and file pipeline**

Read files with `Image()` to obtain natural dimensions, create object URLs, classify each image, sort them, and render listing thumbnails, the selected hero, KV, and A+ content cards. Revoke old object URLs on clear and replacement.

- [ ] **Step 3: Add interaction handlers**

Wire click-to-select, dragover/drop highlighting, clear, and thumbnail selection. Keep the selected hero stable when possible and default to the first listing image.

### Task 3: Style the tool and verify in browser

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add the visual system**

Use a restrained dark workspace shell with warm gray preview surface, compact metadata chips, generous image framing, and responsive stacking below 980px. Keep all product content image-only.

- [ ] **Step 2: Run utility tests and static checks**

Run: `node --test test/catalog.test.js`
Expected: PASS with all tests green.

Run: `rg "TODO|TBD|lorem|description" index.html src styles.css`
Expected: no placeholder copy or product-description UI.

- [ ] **Step 3: Verify the browser flow**

Open `index.html` through a local static server, add sample files named `product-1.jpg`, `product-2.jpg`, `A+1-1.jpg`, `A+3-2.jpg`, and `A+3-10.jpg`, confirm each appears in its correct region, click thumbnails, then clear and confirm the empty state returns.
