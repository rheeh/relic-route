# 伊芙 · EVE 角色素材

文件：`eve.png`。生成日期：2026-10-04。来源：Codex 内置 `image_gen`。本素材是 **AI 辅助二维角色概念美术**，不是手绘稿、3D 模型或骨骼动画。

以本项目既有 `lyra.png` 与 `orion.png` 作为画风和服装世界参考；没有修改这两张图片，也没有引用他人或现成游戏的角色资产。

最终图像为 **1024 × 1536 RGBA**。保留内置工具生成的原始透明 Alpha，四角 Alpha 为 0。通过局部放大检查面部、双手、脉冲手枪与衣物边缘；仅在临时目录生成检查用 JPEG，交付 PNG 没有经过外部抠图或重绘。

## 构图与头像裁切

- 角色头部中心约为 `(445, 135)`，相对画布约为 `(0.435, 0.088)`。
- 头肩区域中心约为 `(445, 205)`，相对画布约为 `(0.435, 0.133)`。
- 建议头肩源裁切框：`x=270, y=0, width=350, height=410`；如需方形头像，可从 `x=280, y=0, width=340, height=340` 开始调整。
- 这些位置是基于实际生成图像的视觉估计，源图保持全身。右手持枪在画面左侧，斗篷向画面右侧展开。

## 实际提示词

```text
Use case: stylized-concept
Asset type: a final production-quality full-body transparent character key art sprite for the original game UI project RELIC ROUTE, portrait canvas 1024 x 1536.
Input images: LYRA and ORION are style and costume-world references only. Match their premium semi-realistic game concept illustration, refined adult faces, controlled linework, textured functional clothing, ivory/ink-navy/brass palette and cool cyan rim light. Do not copy either face or silhouette.
Primary request: EVE, an adult East Asian female scout and precision shooter, visibly late twenties to thirties, normal natural adult proportions, cool composed confidence. She has short black hair with a sharp asymmetrical cut and a distinctly East Asian adult face. Natural brown eyes, no exaggerated anime eyes, no childlike appearance.
Character costume: a bone-white and dark ink-navy functional scout uniform, fitted for mobility but fully clothed and practical, sturdy streamlined boots, a small brass utility belt. A distinctive dark navy outer cloak with a vivid teal-green lining hangs from the shoulders, drifting modestly toward her left and ending around the knees. The cloak creates a clean recognizable triangular silhouette, clearly different from LYRA's orange scarf and ORION's broad engineer jacket. Refined sparse devices, no excessive clutter, no large orange scarf.
Equipment and pose: front-facing three-quarter standing stance, natural balanced weight on one leg. Her anatomical right hand holds one compact futuristic pulse pistol loosely at thigh level, muzzle pointing downward toward the floor. Index finger rests naturally outside the trigger guard; a plausible readable grip and realistic five-finger hand anatomy. The pistol is an original small sci-fi design with matte navy, warm brass hardware and a narrow teal energy detail, no real-world gun branding. Her other hand is relaxed near the utility belt. No firing, no muzzle flash, no action scene.
Style/medium: the same polished semi-realistic illustrated game concept art as the two supplied references. Sophisticated painted material shading, crisp readable color-block design and restrained outlines. Face and hands receive production quality detail. This is a 2D illustration, not a 3D asset or photorealistic photograph.
Lighting: soft studio key light, thin cool cyan rim ON the physical edges only. No diffuse halo, atmosphere, fog, glow cloud or vignette outside the character.
Composition/framing: full character centered in a 1024 x 1536 portrait canvas, occupying roughly 88 percent of the height. Complete head, cloak, hands, pistol, legs and feet are comfortably inside the canvas, with at least 5 percent clear margin above the hair and below the boots. Readable head and shoulder placement for later avatar cropping. No clipped parts.
Background and alpha: genuine transparent alpha, no environment, no ground, no background color, no printed checkerboard. All solid body, dark fabric, cape, boots and weapon must remain opaque. Outside the actual physical silhouette alpha zero, normal antialiasing at the contour only.
Text: none.
Constraints: original adult character, no existing IP imitation, no logo, no text, no labels, no watermark, no UI panels, no sexualized pose or costume, no extra limbs or fingers, no additional weapons, no duplicate person.
```

