# 正式角色素材

本文件保留岑遥与赫朔两位角色的原始生成记录。v3 的四位角色均用于《异物航线》的游戏 UI 概念原型，以 Codex 内置 `image_gen` 制作。角色美术属于 AI 辅助生成；界面构图、文字、程序图形和动效单独实现，不将 PNG 视为骨骼或 Live2D 动画。

## 当前四位角色导航

| 角色 | 立绘与生成记录 |
| --- | --- |
| 岑遥 · LYRA | [lyra.png](lyra.png)，原始提示词保留如下 |
| 赫朔 · ORION | [orion.png](orion.png)，原始提示词保留如下 |
| 伊芙 · EVE | [eve.png](eve.png)；[提示词、Alpha 与头像裁切](eve-prompt.md) |
| 岩策 · ROOK | [rook.png](rook.png)；[提示词与头像裁切](rook-prompt.md) |

## 岑遥 · LYRA

文件：`lyra.png`。成年女远航导航员。生成日期：2026-10-04。

最终素材为 1024 × 1536 RGBA，保留生成工具的真实透明 Alpha。原图与透明清理两次操作均使用内置工具；未使用 Python 绘图或抠图。

实际生成提示词：

```text
Use case: stylized-concept
Asset type: final production-quality full-body transparent character key art for an original sci-fi archaeology game UI portfolio, high-resolution portrait composition. This is a standalone character asset, not a UI mockup.
Primary request: LYRA, an adult female deep-space navigator, visibly in her late twenties, composed, intelligent and approachable, with a natural lived-in presence.
Character: short silver-gray hair with one distinct dark black streak, amber eyes, refined adult face and realistic stylized proportions. She wears an ivory white short functional work jacket over a dark ink-navy archaeology work suit, a striking long coral-orange scarf gently drifting toward her right side, a precise utility belt with a few practical devices and a small brass observation instrument at her waist. Fully clothed and practical workwear.
Pose: front-facing three-quarter view, natural relaxed standing stance, weight resting comfortably on one leg. One hand rests at the waist-side brass observer device and the other arm hangs relaxed. Both hands readable with natural fingers, no weapon. Full legs and solid work boots are visible.
Style/medium: premium original science-fiction animation character illustration, restrained clean linework, clear well-designed shapes and color blocks, subtle finely rendered material texture, sophisticated painted shadow planes and a soft cinematic rim light. Polished character art suitable as the central hero asset of a game UI. Neither photorealism nor generic glossy 3D render. Original design, no direct imitation of any existing IP.
Palette and materials: ivory white, ink navy, warm coral orange, worn brass utility details. A cool cyan edge light softly separates the outer contour. Cloth has tangible fine folds; metal has restrained detail. Strong recognizable scarf-and-short-jacket silhouette, avoid excessive tiny components.
Composition/framing: vertical portrait canvas, full character large and occupying approximately 88 percent of canvas height. All hair, drifting scarf, hands, legs and boots fully inside frame. Clear breathing room around head and feet, minimum 5 percent margin. Clean balanced silhouette with scarf extending to one side. Character centered, no cropping. This asset will be displayed at around 740 pixels high in a 1600 by 900 game interface.
Background: genuine transparent alpha, absolutely no environment, floor, backdrop, frame, graphic panel, checkerboard painted into the image, or cast shadow rectangle.
Text: none.
Constraints: adult, functional fully clothed costume, no sexualized pose, no childlike face or body, no oversized anime eyes, no text, no logo, no watermark, no interface graphics, no weapons, no existing franchise character resemblance, no extra limbs, no missing fingers, no clipped feet.
```

透明轮廓与服装不透明度清理提示词：

```text
Use case: background-extraction
Asset type: final transparent character sprite for a game UI.
Input image: edit target is the attached LYRA character, preserve her exact design.
Primary request: make a clean production character cutout on a genuinely transparent alpha background. Remove every atmospheric backdrop, gray/brown/cyan fog, halo, vignette, floor glow, and diffuse cloud outside the character. Preserve the character herself completely, including her full ivory jacket, dark navy suit, pale skin, silver-and-black hair, orange scarf, brass instrument, hands, legs, and boots.
Critical alpha requirement: all solid clothing, face, hair mass, hands, equipment, and boots must be fully opaque. Do not mistake dark navy fabric for background and do not make any sections of trousers transparent. Pixels outside the actual hair/cloth/boot silhouette must be alpha zero, with only normal antialiasing at the contour. Keep the cool cyan rim light only on the physical character edges, with no outer glow.
Composition: preserve the complete full-body pose and identity. Slightly reduce the full character to leave 5 percent clear breathing room at the top and bottom and 5 percent to the right of the scarf tip. Everything remains inside the image; no clipped hair, scarf or boots.
Style invariants: retain the exact polished sci-fi concept character art and face, palette, costume details and hand anatomy from the source. This is only transparent-cutout cleanup and padding, not a redesign.
No background, no checkerboard printed in the image, no text, no logo, no watermark.
```

## 赫朔 · ORION

文件：`orion.png`。成年男遗物工程师。生成日期：2026-10-04。

1024 × 1536 RGBA，保留内置工具的真实透明 Alpha。以岑遥的最终图片作为画风与服装世界参考，不复用角色面孔。脸、双手、机械手套及全身轮廓已通过局部放大检查；用于检查的 JPEG 裁片只位于系统临时目录，交付 PNG 未经过外部抠图或重绘。

实际提示词：

```text
Use case: stylized-concept
Asset type: final production-quality full-body transparent character key art for an original sci-fi archaeology game UI, high-resolution portrait composition.
Input image: LYRA is a style and costume-world reference ONLY. Match the illustration rendering quality, restrained line treatment, ivory/ink-navy/coral/brass palette and cold cyan rim accent. Do not copy her face, hair, body, scarf, pose or equipment.
Primary request: ORION, an adult male ancient-relic engineer, warm brown skin, short black curly hair, compact strong natural physique, confident and friendly adult expression.
Character and costume: dark ink-navy thick functional work jacket with an ivory-white front panel and a small coral-orange shoulder marker, sleeves rolled up to show sturdy forearms. Wears practical navy work trousers and solid work boots. A brass mechanical tool glove on one hand and a small compact repair device at his belt or in his other hand identify him as a relic engineer. Precise readable workwear construction, restrained few tools, no excessive tiny components. His silhouette is broad, sturdy and compact, clearly different from the navigator's short jacket and drifting scarf.
Pose: front-facing three-quarter view, relaxed natural standing stance, shoulders open and friendly. One mechanical-gloved hand rests loosely by his side, the other hand naturally holds a compact repair device at waist level. Clean readable fingers and plausible hands. Full legs and boots visible, no weapon.
Style/medium: premium original science-fiction animation and finely rendered concept character illustration, restrained clean linework, deliberate color blocks, rich but controlled fabric and brass textures, subtle painted shadow planes. Keep the same high-end illustrated character finish as the reference while giving this man a distinct face and occupation. Avoid generic glossy 3D mannequin finish.
Palette and lighting: ivory white, ink navy, coral-orange accent, weathered warm brass. A thin cool cyan rim light ON the physical outer contour only; no diffuse atmosphere or cloud outside the body.
Composition/framing: vertical portrait canvas. Complete full-body character large, about 86 to 88 percent of canvas height, at least 5 percent genuinely clear padding above hair and below boots and outside hands. Everything inside the frame, no clipped hands or feet. Full object centered, strong readable silhouette, intended display height about 740px.
Background and alpha: genuine transparent alpha background. All solid clothing including dark navy trousers, face, exposed arms, hands and boots must be opaque, not partially cut away. Everything outside the real physical silhouette transparent alpha zero; no backdrop, no fog, no glow cloud, no floor, no cast shadow rectangle, no printed checkerboard.
Text: none.
Constraints: original adult male, fully clothed functional workwear, no sexualized body, no childlike proportions, no logos, no watermark, no lettering, no UI, no background, no weapon, no existing IP resemblance, no additional limbs, no fragmented fingers.
```

## 展示与信用

- 两张角色立绘均为 AI 辅助角色概念美术，由 Codex 内置 `image_gen` 生成。
- 最终 PNG 的角色实体、服装和装备保留不透明像素，外围保持真实 Alpha；没有用 Python 绘图、抠图或去背景。
- 两张图都以完整人物站姿交付；在原生 1600 × 900 界面中使用约 740 px 展示高度时，图像画布宽约 493 px，人物周围留白由界面排版负责。
- 立绘不包含骨骼、Live2D 分层或角色动画；整体位移、视差、光效和界面转场由原型代码实现。
