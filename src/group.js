// 分组与排序：保留「按 A+ 编号分组」，并支持小数点变体命名（A+3.1 / A+3.2）。
// 无 A+ 前缀时退化为按文件名里的数字做顺序拼接，有第二数字（变体）才聚合轮播。

// 解析文件名，返回 { order, variant, groupKey }：
//   "A+3.1"  -> { order: 3, variant: 1, groupKey: "A+3" }
//   "A+3-1"  -> { order: 3, variant: 1, groupKey: "A+3" }   （兼容旧横线命名）
//   "A+3"    -> { order: 3, variant: 0, groupKey: "A+3" }
//   "3.1"    -> { order: 3, variant: 1, groupKey: "N3" }     （无 A+ 前缀的退化解）
//   "banner1"-> { order: 1, variant: 0, groupKey: null }     （各自成模块，按编号顺序无缝拼接）
//   "pic"    -> { order: Infinity, groupKey: null }          （无数字，排最后）
export function parseName(name) {
  const aplus = name.match(/A\+\s*(\d+)(?:[.\-_](\d+))?/i);
  if (aplus) {
    return {
      order: Number(aplus[1]),
      variant: aplus[2] ? Number(aplus[2]) : 0,
      groupKey: `A+${Number(aplus[1])}`,
    };
  }
  const fallback = name.match(/(\d+)(?:[.\-_](\d+))?/);
  if (fallback) {
    const order = Number(fallback[1]);
    const variant = fallback[2] ? Number(fallback[2]) : 0;
    // 仅在明确出现「编号.变体」时才聚合为轮播；否则各自成模块（按 order 排序拼接）
    return { order, variant, groupKey: fallback[2] ? `N${order}` : null };
  }
  return { order: Infinity, variant: 0, groupKey: null };
}

// 自然排序：先编号 order，再变体 variant，再文件名字典序。
export function sortImages(images) {
  return [...images].sort((a, b) => {
    const la = a.parse ?? parseName(a.name);
    const lb = b.parse ?? parseName(b.name);
    return la.order - lb.order || la.variant - lb.variant || a.name.localeCompare(b.name, undefined, { numeric: true });
  });
}

// 把同一窗口内的图片聚合：
//   - 同一 A+ 编号（含变体 A+3.1/A+3.2）聚成一个轮播组；
//   - 无前缀但带「编号.变体」的也聚合轮播；
//   - 其余每张各自成模块，但都按 order 排好序，便于无缝竖排。
// 返回的组顺序已按编号升序排好。
export function groupImages(images) {
  const sorted = sortImages(images);
  const groups = new Map();
  sorted.forEach((img) => {
    const p = img.parse ?? parseName(img.name);
    const key = p.groupKey ?? `SINGLE:${img.id}`;
    if (!groups.has(key)) groups.set(key, { key, isSingle: !p.groupKey, slides: [] });
    groups.get(key).slides.push(img);
  });
  return [...groups.values()];
}
