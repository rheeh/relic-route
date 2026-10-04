# 《异物航线》生成素材

本文件为当前素材的导航，并保留早期两张素材的完整提示词。AI 辅助概念美术使用 Codex 内置 `image_gen` 生成；界面文字、图标、地图与 Canvas 动效另行实现。“原创”指本项目的角色设定、提示与构图，不表示纯手工绘制。

## v2 当前素材导航

| 文件 | 用途与记录 |
| --- | --- |
| `characters/lyra.png`、`characters/orion.png` | 岑遥与赫朔的透明全身立绘，另以程序裁切生成头像；[实际提示词与 Alpha 说明](characters/prompts.md) |
| `hangar-v2.png` | 角色整备、星图与出航确认的整备甲板环境；[完整提示词](hangar-v2-prompt.md) |
| `relics-v2.png` | 三列透明图集，依次为航行铭牌、同心环光核、观测铜环；[完整提示词与采样约束](relics-v2-prompt.md) |
| `field.png` | 本实验早期生成的观测环场景，当前仍用于任务档案背景；完整提示词保留如下 |
| `destinations-v2.png` | 三个等宽栏从左至右为落锚船坞的桥吊、静默环站的断环、铜蚀残带的铜色残骸，已用于星图任务卡；[完整提示词与采样约束](destinations-v2-prompt.md) |

角色与遗物是二维栅格图。环境、人物、程序光效和界面独立绘制；人物的整体位移、轻微缩放与视差不构成 Live2D、三维骨骼或独立肢体动画。

## 历史素材记录

下列两张素材为早期版本生成。`field.png` 继续作为背景使用；`lumen-core.png` 保留为历史素材，当前三件奖励由 `relics-v2.png` 提供。

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

## 历史两图的来源与说明

- 工具：Codex 内置 `image_gen`，默认工具模式；未调用外部素材库。
- 文件已从工具默认生成目录复制到本实验 `demo/assets/`，原始生成文件保持不变。
- 两图采用一致的暖石白、氧化铜绿与少量酸黄发光材质体系。
- 两图的生成记录继续保留；当前素材使用方式以本文件顶部 v2 导航为准。展示时注明 AI 辅助概念美术，并单独说明界面、交互与动效制作。

## 音轨

- 来源：本项目 `scripts/synthesize-audio.py` 使用 Python 标准库 `math`、`random`、`array`、`wave` 原创合成；没有外部音乐、采样或角色语音。
- 输出：`output/score.wav`，30 秒、48 kHz、16 bit、双声道。
- 内容：克制的深空持续音、成员选择与界面反馈。v2 时间轴如下，与 `demo/app.js` 展示模式的节点对应：

| 时间 | 画面与声音节点 |
| --- | --- |
| 2 秒 | 成员切换为赫朔 |
| 4 秒 | 成员切换回岑遥 |
| 6 秒 | 进入任务星图 |
| 8 秒 | 选择铜蚀残带 |
| 10 秒 | 选择静默环站 |
| 12 秒 | 进入任务档案 |
| 16 秒 | 出航确认 |
| 20 秒 | 确认出发，进入回收报告 |
| 21 秒 | 扫描开始，持续 1.6 秒 |
| 22.6 秒 | 识别完成 |
| 25 秒 | 领取遗物，显示已入库 |
| 28 秒 | 片尾，30 秒结束 |

- 展示影片由同一 Canvas 原型录制后与该音轨合成；页面可保持静音，影片包含音轨。

## 中文字体子集

- 来源：Google Fonts 官方 [`NotoSansSC[wght].ttf`](https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf)，许可证为同目录 OFL.txt；完整许可保存在 `fonts/NotoSansSC-OFL.txt`。
- 处理：`scripts/subset-font.py` 扫描本项目 HTML、CSS、JS，并加入 ASCII 与常见中文标点。使用 fontTools 与 Brotli 生成 WOFF2；不修改或删除原字体。
- 输出：`fonts/RelicSansSC.woff2`。修改版本内部家族名为 `Relic Sans SC`，保留原版权、OFL 及 `wght` 100–900 可变轴。
- 现有文本中的重播符号 `↻`（U+21BB）不在原 Noto Sans SC 字库内，因此子集沿用原字库的覆盖范围；该符号使用页面已有系统字体回退。
