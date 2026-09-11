// 配置区：尺寸 / 容差 / 导出参数。你日后要调只改这里，不用动逻辑。
// 窗口 key 必须与 app.js 里的 stores 键、index.html 的 data-window 一致。

export const WINDOWS = {
  showcase: {
    key: 'showcase',
    label: '橱窗 Showcase',
    expected: { w: 1500, h: 1500 },
    colorVar: 'orange',
  },
  pcAplus: {
    key: 'pcAplus',
    label: 'A+ PC',
    expected: { w: 1464, h: 600 },
    colorVar: 'purple',
  },
  appAplus: {
    key: 'appAplus',
    label: 'A+ APP',
    expected: { w: 1200, h: 900 },
    colorVar: 'blue',
  },
};

// 窗口排列顺序（上传区从上到下）
export const WINDOW_ORDER = ['showcase', 'pcAplus', 'appAplus'];

// 尺寸容差：拖入图的宽/高与 expected 偏差在此范围内给黄色提示，但依然放入窗口。
export const TOLERANCE = 40;

// 导出参数
export const EXPORT_QUALITY = 0.94;
export const EXPORT_FILENAME = 'amazon-listing-preview.jpg';

// 拼合间距（像素）。aplus / app 已设为 0 —— 按编号无缝拼接，无竖向缝隙。
export const GAPS = {
  showcase: 50, // 橱窗竖排间距
  aplus: 0, // A+PC 各模块/变体之间无缝
  app: 0, // A+APP 各模块/变体之间无缝
  section: 50, // PC 段与 App 段之间的留白
};
