# 《异物航线》生成素材

两张素材使用 Codex 内置 `image_gen` 生成，用于本项目环境背景和奖励遗物。未使用现成游戏素材；界面与图标在代码中另行实现。这里的“原创”表示本项目的生成提示与构图，不表示纯手工绘制。

## field.png

用途：深空考古任务场景背景。生成日期：2026-10-04。透明背景：否。

实际提示词：

```text
Use case: stylized-concept
Asset type: cinematic environment artwork for the background of an original deep-space archaeology game UI portfolio project, landscape 16:9.
Primary request: a huge ancient broken circular ring ruin floating in deep space, with scattered weathered rock fragments, precise and convincing science-fiction archaeology. No people or spacecraft.
Scene/backdrop: quiet near-black dark ink-green cosmos, subtle dust haze and restrained small stars, vast sense of scale.
Subject: a monumental ancient ring of warm ivory stone and ceramic, with patinated oxidized copper mechanical structures revealed in the fractures; sparse tiny acid-yellow luminescent seams. Ancient, mysterious and engineered, not fantasy magic.
Style/medium: premium photorealistic cinematic game concept art, physically credible PBR materials, beautifully controlled atmospheric depth and light, sophisticated dramatic composition.
Composition/framing: 16:9 wide landscape, whole main ring is visible, centered around 62 percent across the frame and 48 percent down. Its circular opening is seen obliquely. Leave the leftmost 30 percent very dark and low-detail for mission navigation, and keep the rightmost 12 percent dark and unobtrusive for UI. No image borders. Foreground fragments remain sparse.
Lighting/mood: cinematic soft directional light on ivory stone, deep green ambient shadows, restrained luminous core details, elegant and contemplative.
Color palette: near-black ink green, warm ivory, oxidized copper teal, minimal acid yellow.
Materials/textures: weathered porcelain-like stone, engraved engineered seams, patinated metal, very fine surface texture. Strong silhouette with rich material detail, no visual clutter.
Text: none.
Constraints: original design with no existing game IP resemblance required; no characters, no spacecraft, no text, no typography, no UI panels, no HUD, no logos, no watermark; avoid cheap neon, cyberpunk magenta, saturated blue, explosions and painted interface graphics.
```

## lumen-core.png

用途：奖励展示的独立遗物。生成日期：2026-10-04。透明背景：是；保留内置工具生成的原始 Alpha 通道。

实际提示词：

```text
Use case: stylized-concept
Asset type: standalone reward relic game artwork, high-resolution square image on a genuine transparent alpha background.
Primary request: an ancient floating mechanical sphere relic with an incomplete segmented ring shape, full object centered and entirely visible. Original premium science-fiction archaeology design.
Subject: a complex spherical orrery-like relic, weathered warm ivory ceramic and stone outer shell broken open to expose oxidized copper mechanisms. Suspended concentric thin copper rings orbit a sharply defined acid-yellow luminous core. The outer form is a partially incomplete ring of porcelain-like segments, with precise antique-engineered seams and micro-engraving. It should feel like a recovered ancient artifact from the same design world as a monumental ivory-stone circular ruin in deep ink-green space.
Style/medium: photorealistic cinematic PBR game prop render, premium collectible asset quality; physically credible solid materials, fine detail without noisy clutter, clear memorable silhouette.
Composition/framing: square canvas, relic centered, entire artifact including all orbiting rings in frame, comfortably inside the canvas with 12 percent clear padding on each side. Three-quarter view, visible depth, approximately 75 percent of canvas occupied. No clipped parts.
Lighting/mood: controlled soft studio key light, green-black reflected ambient tint in the oxidized copper, warm ivory highlights, small intense yellow core with restrained glow. Keep material definition and contour readable.
Color palette: warm ivory, patinated oxidized copper teal, dark recesses, a small acid-yellow light at the core. Match sophisticated deep-space archaeology aesthetics.
Background: genuinely transparent alpha, no scene, no floor, no pedestal, no black rectangle, no checkerboard printed into the image. Keep luminous glow local to object and preserve transparent pixels outside it.
Text: none.
Constraints: one relic only, no characters, no spacecraft, no text or letters, no labels, no UI, no HUD, no icons, no logo, no watermark; no excessive bloom, no cheap neon, no saturated purple or electric blue. Original design, no direct imitation of an existing game.
```

## 来源与说明

- 工具：Codex 内置 `image_gen`，默认工具模式；未调用外部素材库。
- 文件已从工具默认生成目录复制到本实验 `demo/assets/`，原始生成文件保持不变。
- 两图采用一致的暖石白、氧化铜绿与少量酸黄发光材质体系。
- 展示时应注明 AI 辅助生成环境与遗物美术；游戏 UI、交互与动效设计单独说明。

## 音轨

- 来源：本项目 `scripts/synthesize-audio.py` 使用 Python 标准库 `math`、`random`、`array`、`wave` 原创合成；没有外部音乐、采样或角色语音。
- 输出：`output/score.wav`，30 秒、48 kHz、16 bit、双声道。
- 内容：克制的深空持续音与 UI 提示。2 秒选中、5 秒详情、10 秒确认、14 秒出发、17 秒扫描开始、17.9 秒显影完成、23 秒领取、27 秒片尾。
- 展示影片由同一 Canvas 原型录制后与该音轨合成；页面可保持静音，影片包含音轨。

## 中文字体子集

- 来源：Google Fonts 官方 [`NotoSansSC[wght].ttf`](https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf)，许可证为同目录 OFL.txt；完整许可保存在 `fonts/NotoSansSC-OFL.txt`。
- 处理：`scripts/subset-font.py` 扫描本项目 HTML、CSS、JS，并加入 ASCII 与常见中文标点。使用 fontTools 与 Brotli 生成 WOFF2；不修改或删除原字体。
- 输出：`fonts/RelicSansSC.woff2`。修改版本内部家族名为 `Relic Sans SC`，保留原版权、OFL 及 `wght` 100–900 可变轴。
- 现有文本中的重播符号 `↻`（U+21BB）不在原 Noto Sans SC 字库内，因此子集沿用原字库的覆盖范围；该符号使用页面已有系统字体回退。
