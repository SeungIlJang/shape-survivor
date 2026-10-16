# 갤로그의 귀환 — 레트로 픽셀아트 이미지 생성 프롬프트

레퍼런스: 갤러가/1942 계열 탑다운 슈팅 픽셀아트.
크림색 선체 + 적색·주황 액센트, 짙은 남색 배경, 거친 픽셀, 안티에일리어싱 없음.

---

## 0. 결정됨 — (B) 컨셉 레퍼런스 전용  *(2026-10-16)*

**생성 이미지는 게임에 직접 넣지 않는다.** 팔레트·실루엣·디테일 밀도를 정하는 레퍼런스로만 쓰고,
실제 렌더링은 지금처럼 캔버스 2D 절차적 방식으로 한다.

그래서 이 문서를 쓸 때:
- **§4 후처리, §5 코드 전환 체크리스트는 무시해도 된다** (A안으로 선회할 때만 필요).
- 투명 배경·정확한 픽셀 그리드를 억지로 요구하지 말 것. 그 제약을 빼면 생성 품질이 올라간다.
  → §1 배경 지정은 **레퍼런스용(B)** 쪽을 쓴다.
- 중요한 건 "바로 쓸 수 있는 스프라이트"가 아니라 **"무엇을 코드로 옮길지 결정할 수 있는 그림"**이다.
- 뽑은 그림에서 실제로 가져올 것은 §8에 정리했다.

<details>
<summary>왜 A(픽셀 에셋 전환)를 접었는가 — 펼쳐보기</summary>

### (A) 실제 게임 에셋으로 넣는다 — 채택 안 함
- 지금 게임은 **캔버스 2D 100% 절차적 렌더링**이다. 이미지 에셋이 0장이다.
  여기에 픽셀 스프라이트만 넣으면 **매끈한 성운·발광 플라즈마·그라디언트 HUD와 정면으로 충돌**한다.
  픽셀로 가려면 배경·이펙트·HUD까지 전부 픽셀로 바꿔야 하고, 사실상 비주얼 전면 재작업이다.
- 용량 문제도 있다. OTA가 단일 HTML을 5초 안에 받는 구조라, 스프라이트 시트를 base64로 박으면
  현재 189KB에서 수 MB로 뛴다. 외부 이미지로 빼면 오프라인 폴백이 깨진다.
- → 가려면 가되, **"스프라이트 몇 장 추가"가 아니라 아트 디렉션 전환**이라는 걸 알고 시작할 것.

추가로, 픽셀로 가면 **좌표 떨림(jitter)** 문제가 있다. 이 게임은 카메라가 따라가는 무한 필드라
좌표가 전부 소수점인데, 픽셀 스프라이트를 소수 좌표에 그리면 픽셀이 미세하게 흔들려 지저분해진다.
정수 좌표 스냅 + 논리 해상도 정수배 업스케일로 렌더 파이프라인을 바꿔야 한다.

</details>

> **AI 생성 픽셀아트의 현실**: 대부분의 생성기는 "픽셀아트처럼 보이는 일러스트"를 만든다.
> 픽셀 그리드가 어긋나고, 안티에일리어싱이 끼고, 팔레트가 제멋대로 늘어난다.
> 8티어 진화처럼 **일관성이 생명인 연작은 AI로 뽑기 가장 어렵다.**
>
> **다만 B안에서는 이게 거의 문제가 안 된다.** 어차피 그림을 그대로 쓰지 않고
> 색·형태·밀도만 읽어낼 것이기 때문이다. 픽셀이 조금 어긋나 있어도 상관없다.
> 그러니 완벽한 한 장을 뽑으려 매달리지 말고, **구도·배색이 다른 여러 장을 빠르게 뽑아
> 고르는 쪽**이 훨씬 효율적이다.

---

## 1. 공통 스타일 블록

모든 프롬프트 **뒤에** 이 블록을 붙인다. 이게 에셋 간 통일성을 만든다.

```
STYLE: 16-bit pixel art sprite, top-down view, retro arcade shoot-em-up
(Galaga / 1942 era, early 1980s arcade cabinet). Chunky visible square pixels,
hard edges, NO anti-aliasing, NO gradients, NO blur, no modern shading.
Strictly bilateral symmetry. Centered composition. Flat 2D, orthographic top-down.
Limited palette, max 8 colors, no dithering except deliberate 2-color checker.
Crisp 1:1 pixel grid.

PALETTE (use only these):
  cream white  #F5EDE0
  bone shade   #D8C7A8
  crimson      #C13B2E
  bright red   #E04B3A
  amber orange #E8842A
  gold         #F0B429
  deep navy    #1B2A4A
  outline      #10131F
```

> 팔레트 hex는 레퍼런스 이미지에서 눈으로 뽑은 근사값이다.
> 원본에서 스포이드로 정확히 찍어 교체하면 통일성이 더 올라간다.

**배경 지정** — 용도에 따라 택1:
- 에셋용(A): `Background: flat solid magenta #FF00FF, single flat color, no shading, no stars.`
  (나중에 키잉으로 날리기 위함. 생성기는 투명 배경을 거의 못 만든다.)
- 레퍼런스용(B): `Background: deep navy #1B2A4A starfield with small white and amber
  4-point star sparkles scattered sparsely.`

**생성 설정**
- 정사각 1:1, 1024×1024로 크게 뽑고 §4에서 줄인다. 처음부터 32×32로 뽑으라고 하면 대부분 실패한다.
- Midjourney: `--ar 1:1 --style raw --no antialiasing, blur, gradient, 3d, bevel`
- DALL·E / GPT Image: "each pixel must be a clearly visible square block" 문장을 본문에 넣을 것
- Stable Diffusion: 픽셀아트 LoRA 사용이 압도적으로 유리. 품질 차이가 크다.

---

## 2. 에셋별 프롬프트

### 2-1. 주인공 함선 — 최고 등급(T7) 먼저

가장 화려한 단계를 먼저 확정하고, 거기서 부품을 떼어내며 하위 티어를 만든다.
반대로 하면 상위 티어에서 붙일 게 떨어진다.

```
A player spaceship sprite for a top-down arcade shooter, facing up (nose at top).
Cream-white armored hull with crimson red wing panels and amber orange engine nozzles.
Heavily equipped elite fighter: a sharp pointed nose, a dark cockpit canopy near the front,
two large swept wings with upward-bent winglets at the tips, a pair of small forward canards,
two rear stabilizer fins, four engine nozzles across the stern glowing amber,
a raised spine along the centerline, and small weapon pods mounted on each wing.
Powerful and ornate but still readable as one clean silhouette.

[+ STYLE 블록]
[+ 배경 지정]
```

### 2-2. 주인공 함선 — 최저 등급(T0)

```
A small starter spaceship sprite for a top-down arcade shooter, facing up (nose at top).
Cream-white hull with a single crimson red stripe, one amber engine nozzle at the stern,
a dark cockpit canopy, and two small stubby delta wings. Minimal, lean, lightly armed —
clearly the weakest tier of an upgrade line. Simple silhouette, very few parts.

[+ STYLE 블록]
[+ 배경 지정]
```

> 중간 티어(T1~T6)는 위 둘 사이를 부품 단위로 채운다.
> 부품 추가 순서: 선미 핀 → 미익 → 선체 패널 → 카나드 → 무장 포드 → 등쪽 스파인 → 윙렛.
> 한 장씩 따로 뽑으면 8단계를 일관되게 맞추기 거의 불가능하다.
> **→ §7의 '세로 티어 시트' 방식을 먼저 볼 것. 그쪽이 훨씬 잘 나온다.**

### 2-3. 적 유닛 9종

적은 **플레이어와 색이 달라야 한다.** 플레이어가 크림색이니 적은 차가운 쪽으로 민다.
현재 게임의 적 색코딩(f=분홍/연두, m=보라/노랑, e=주황/자홍)은 레트로 팔레트와 안 맞으니
아래처럼 티어별로 다시 묶는 것을 권한다.

```
A sprite sheet row of 3 enemy spaceships for a top-down arcade shooter, all facing down
(nose pointing toward the viewer's bottom), arranged side by side with even spacing.
They are hostile alien fighters: angular, insect-like, hostile-looking.
Tier colors: steel blue-grey hull #7A8CA8 with glowing crimson #C13B2E cores.
  1) small fast scout — thin dart with two swept-back blades
  2) medium fighter — wide wings with a glowing core at the center
  3) heavy gunship — bulky armored block with side cannons
Each ship must be clearly distinguishable in silhouette alone.

[+ STYLE 블록]
[+ 배경 지정]
```

같은 틀로 중급(m) / 정예(e) 3종씩 2번 더 돌린다. 티어별 색 제안:
- f(잡몹): steel blue-grey `#7A8CA8` + crimson core
- m(중급): violet `#8C6AA8` + gold core
- e(정예): dark slate `#4A5570` + bright red core

### 2-4. 보스

```
A large boss spaceship sprite for a top-down arcade shooter, facing down.
A massive alien dreadnought: wide armored wings, a huge glowing crimson core at the center,
multiple cannon barrels along the leading edge, layered armor plates, menacing silhouette.
Much bigger and more detailed than a regular enemy — clearly the stage boss.
Dark slate grey #4A5570 armor with crimson #C13B2E and gold #F0B429 accents.

[+ STYLE 블록]
[+ 배경 지정]
```

### 2-5. 탄환 · 이펙트 시트

```
A pixel art sprite sheet of projectiles and effects for a retro arcade shooter,
arranged in a neat grid on a flat background, each cell clearly separated:
  - a vertical amber orange laser bolt, short and bright, with a white-hot core
  - a round crimson plasma orb with a short comet tail
  - a 4-frame explosion animation, from small spark burst to large ring blast
  - a 3-frame muzzle flash
  - a small pickup gem, diamond shaped, cyan
All in the same limited palette and the same pixel scale.

[+ STYLE 블록]
[+ 배경 지정]
```

### 2-6. 배경 타일 (반복 가능)

```
A seamless tileable background tile for a vertical scrolling arcade shooter.
Deep navy #1B2A4A space field with small scattered stars: tiny white dots,
amber 4-point sparkles, and a few larger cream-white stars.
Sparse and dark — it must sit behind gameplay without competing for attention.
Seamlessly tileable on all four edges.

[+ STYLE 블록, 배경 지정은 생략]
```

### 2-7. UI 아이콘 세트

```
A pixel art icon set for a retro arcade game UI, arranged in a grid,
each icon 1:1 and clearly separated, all the same pixel scale:
heart (health), lightning bolt (attack power), boot (movement speed),
coin (currency), shield, star, pause bars, speaker, crossed swords.
Bold chunky shapes readable at very small size, thick dark outlines.

[+ STYLE 블록]
[+ 배경 지정]
```

---

## 3. 일관성을 지키는 요령

1. **한 세션에서 연속으로 뽑는다.** 생성기는 직전 맥락을 어느 정도 이어간다.
2. **시드를 고정한다.** 같은 시드 + 프롬프트 일부만 변경하면 룩이 유지된다.
3. **먼저 뽑은 1장을 레퍼런스 이미지로 첨부**해서 나머지를 생성한다
   (Midjourney `--sref`, GPT Image 이미지 입력, SD img2img/IPAdapter).
4. 팔레트 블록은 **토씨 하나 바꾸지 말고** 매번 그대로 붙인다.
5. 방향을 명시한다 — 아군은 `facing up`, 적은 `facing down`. 섞이면 나중에 다 회전시켜야 한다.

---

## 4. 생성 후 처리 — ⚠️ A안 전용 (현재 불필요)

생성 결과는 1024px짜리 "픽셀아트풍 일러스트"다. 그대로 쓰면 안 된다.

1. **다운스케일** — 니어리스트 네이버(Nearest Neighbor)로 32×32 또는 48×48까지 줄인다.
   절대 바이리니어/바이큐빅을 쓰지 말 것. 픽셀이 뭉개진다.
2. **팔레트 양자화** — §1의 8색으로 강제 축소(Aseprite: Sprite → Color Mode → Indexed).
   이 단계에서 AI가 끼워 넣은 중간색이 날아가며 비로소 픽셀아트가 된다.
3. **투명 처리** — 마젠타 배경을 Select by Color로 지운다.
4. **수작업 정리** — 대칭 맞추기, 외곽선 1px로 정리, 어긋난 픽셀 제거.
   이 단계는 생략할 수 없다. 보통 생성보다 이쪽이 시간이 더 든다.
5. **스프라이트 시트로 합친다** — 개별 PNG를 하나로 묶어야 drawImage 호출이 줄어든다.

도구: Aseprite(유료, 사실상 표준) / Piskel(무료 웹) / libresprite(무료 포크)

---

## 5. 픽셀로 전환할 때 코드가 해야 할 일 — ⚠️ A안 전용 (현재 불필요)

참고용 체크리스트. 이것까지 해야 "픽셀 게임"이 된다.

- [ ] 캔버스 `imageSmoothingEnabled = false` (안 하면 스프라이트가 뿌옇게 보간된다)
- [ ] 논리 해상도를 낮게 잡고 정수배 업스케일 (예: 240×520 → ×2, ×3). 현재는 DPR 기반 실해상도라 구조가 다르다.
- [ ] 배경 성운/행성 → 픽셀 타일 + 디더링으로 교체
- [ ] 레이저/플라즈마의 가산합성 발광 → 픽셀 단계 셰이딩으로 교체 (글로우는 픽셀아트와 상극)
- [ ] 사선 컷 HUD → 픽셀 프레임 + 비트맵 폰트
- [ ] 스프라이트 시트 base64 인라인 vs 외부 로드 — OTA 용량/오프라인 폴백 정책 결정
- [ ] 적 60마리 + 탄막 수백 발에서 drawImage 비용 재측정

---

## 6. 레퍼런스 이미지를 직접 쓰는 법 (가장 확실함)

프롬프트만으로 레퍼런스의 느낌을 재현하는 것보다, **그 이미지를 그대로 입력으로 주는 쪽**이 훨씬 정확하다.

```
[레퍼런스 이미지 첨부]
Match this exact art style, palette, pixel scale and level of detail.
Keep the same cream-white / crimson / amber color scheme and the same chunky pixel size.
Now draw: <원하는 대상 — 예: a heavily armed elite version of this ship with four engines
and bent wingtips>
Same top-down view, same symmetry, same flat background.
```

이 방식이면 §1 팔레트 블록 없이도 톤이 맞는다. 첨부 가능한 생성기에서는 이걸 우선 쓸 것.

---

## 8. 레퍼런스에서 코드로 옮기는 법  ★ B안의 핵심

그림을 뽑는 건 절반이다. **그림에서 무엇을 읽어 코드로 옮길지**가 나머지 절반이다.

### 8-1. 레퍼런스 한 장에서 뽑아 적을 5가지

| 항목 | 어떻게 읽나 | 코드에서 어디로 가나 |
|---|---|---|
| **팔레트** | 스포이드로 hex 3~5개 | 색 상수 테이블로 고정 |
| **색 역할 비율** | 본체 : 액센트 : 발광이 대략 몇 대 몇인가 | 보통 70 : 20 : 10. 발광을 넘기면 눈이 아프다 |
| **명암 단계 수** | 한 면에 색이 몇 단계로 끊기나 (2단? 3단?) | `mixHex()` 비율 개수 |
| **외곽선** | 있는가 / 색 / 반지름 대비 굵기 | `lineWidth = r * 비율` |
| **디테일 밀도** | 반지름 대비 부품이 몇 개인가 | 티어별 부품 개수 상한 |

마지막 항목이 특히 중요하다. 레트로 스프라이트가 깔끔해 보이는 이유는 **부품 수가 적기 때문**이지
잘 그려서가 아니다. 32px 스프라이트에 들어가는 알아볼 수 있는 부품은 보통 4~6개다.

### 8-2. 픽셀의 "단계 셰이딩"을 캔버스로 옮기는 법

이게 두 스타일을 잇는 기술적 다리다. 그라디언트에 **같은 위치에 색 정지점을 두 번 찍으면
부드러운 전환이 아니라 딱 끊기는 띠**가 된다.

```js
// ❌ 부드러운 그라디언트 — 픽셀 감성과 상극
gr.addColorStop(0,   '#5ce1ff');
gr.addColorStop(1,   '#1f6f93');

// ✅ 3단 띠 — 레트로 느낌이 나면서 벡터의 선명함은 유지된다
gr.addColorStop(0,    '#8af0ff');   // 하이라이트
gr.addColorStop(0.34, '#8af0ff');
gr.addColorStop(0.34, '#5ce1ff');   // 같은 위치에 한 번 더 → 경계가 딱 끊김
gr.addColorStop(0.67, '#5ce1ff');
gr.addColorStop(0.67, '#1f6f93');   // 그림자
gr.addColorStop(1,    '#1f6f93');
```

단계 수는 **2~3단이면 충분**하다. 4단을 넘기면 다시 부드러워 보여서 의미가 없다.

### 8-3. 적용 범위 — 유닛만, 배경은 그대로

| 대상 | 처리 |
|---|---|
| 플레이어·적·보스 | **단계 셰이딩**, 제한 팔레트, 또렷한 외곽선 |
| 탄환·픽업 | 단계 셰이딩. 단 발광 감쇠는 유지(가독성 장치다) |
| 성운·행성·별 | **건드리지 않는다.** 부드러운 그라디언트 유지 |
| HUD | 이미 각진 톤. 그대로 |

배경만 부드럽게 남기는 게 핵심이다. 전부 단단하게 만들면 평평해지고,
전부 부드럽게 두면 유닛이 배경에 묻힌다. **대비가 가독성을 만든다.**

### 8-4. 하지 말 것

- 레퍼런스의 **크림색 선체를 플레이어에 그대로 적용**하기 — 현재 플레이어는 청록이고,
  흰 외곽선과 합쳐 피아 식별을 담당한다. 색을 옮기려면 적 팔레트까지 같이 재배치해야 한다.
- 레퍼런스가 **저해상도라서 단순한 것**을 "디자인이 단순해야 한다"로 오해하기.
  캔버스는 해상도 제약이 없으니 같은 부품 수로 더 깨끗하게 그릴 수 있다.
- 픽셀 격자·디더링 흉내 내기. 중간에 걸치면 제일 어설프다. 갈 거면 완전히 가고, 아니면 안 간다.

---

## 7. 레퍼런스 B — 세로 티어 시트 (8단계 진화에 이게 맞다)

두 번째 레퍼런스는 성격이 다르다. 한 장에 여러 기체가 세로로 쌓인 **게임 에셋 시트**다.

**레퍼런스 A와 다른 점**
| | A (갤러가 화면) | B (티어 시트) |
|---|---|---|
| 배경 | 남색 별밭 | **투명(체커보드)** — 바로 쓸 수 있는 에셋 |
| 팔레트 | 크림·적·주황 한 벌로 고정 | **기체마다 색이 다름** (적/은/주황/청/보라) |
| 디테일 | 거친 저해상도 | 조금 더 높은 해상도, 내부 셰이딩 있음 |
| 구성 | 장면 1컷 | **등급 진화 세트** |

### 핵심 — 티어는 '부품'만이 아니라 '색'으로도 올린다

지금 구현은 전 티어가 청록 한 색이고(각성 시만 금색), 부품 추가만으로 등급을 표현한다.
레퍼런스 B는 **등급이 오를 때 색 자체가 바뀐다.** 이게 훨씬 즉각적으로 읽힌다.

제안하는 티어 색 진행:
```
T0-T1  은회색 #C8D2DE  (훈련기)
T2-T3  청색   #4A90D9  (제식기)
T4-T5  주황   #E8842A  (정예기)
T6     보라   #9B5DE5  (지휘기)
T7     적금색 #E8443A + #F0B429  (기함)
```

> ⚠️ **주의**: 이 게임에서 색은 피아 식별 장치다. 플레이어가 주황·보라로 바뀌면
> 현재 적 색(주황 tank `#ff8a5c`, 보라 ringed `#c26bff`)과 충돌한다.
> 색을 바꾸려면 **적 팔레트도 같이 재배치**해야 한다(§2-3 참고).
> 아니면 색은 청록 계열로 묶고 **명도/채도만 티어별로 올리는** 절충안을 쓴다.

### 세로 티어 시트 프롬프트

```
A vertical pixel art sprite sheet of 8 spaceship tiers for a top-down arcade shooter,
stacked in a single column, evenly spaced, all facing up (nose at top),
all perfectly centered on the same vertical axis, all at the same pixel scale.

They are the SAME ship design evolving through 8 upgrade tiers — the silhouette family
must stay recognizable while each tier visibly gains parts and grows wider:
  1. tiny starter interceptor, two stubby delta wings, one engine
  2. adds small rear fins, two engines
  3. adds rear stabilizer fins
  4. adds hull panel lines and bright leading-edge stripes
  5. adds forward canards, three engines
  6. adds wing-mounted weapon pods and navigation lights
  7. adds a raised dorsal spine, four engines
  8. adds upward-bent winglets and a glowing energy core — the flagship

Each tier is progressively larger, wider-winged and more ornate than the one above it.
Dark cockpit canopy near the nose on every tier. Strictly bilateral symmetry.

Background: fully transparent (alpha channel), no background color, no checkerboard drawn.

[+ STYLE 블록]
```

**왜 이쪽이 잘 나오나** — 한 장 안에서 생성되므로 모델이 스스로 일관성을 맞춘다.
따로 8번 돌리면 매번 다른 기체가 나온다.

**한계** — 8개는 대부분의 생성기에게 너무 많다. 형태가 뭉개지거나 개수가 안 맞는다.
**4개씩 두 번(T0~T3 / T4~T7)으로 쪼개고, 두 번째는 첫 결과를 레퍼런스로 첨부**하는 게 현실적이다.

### 투명 배경 주의

레퍼런스 B의 체커보드는 "투명"을 뜻하는 표시지, 그려진 무늬가 아니다.
생성기에 `transparent background`라고 하면 **체커보드 무늬를 실제로 그려버리는 경우가 많다.**
대응:
- 프롬프트에 `no checkerboard pattern, no transparency grid drawn` 을 명시한다
- 그래도 안 되면 §1의 마젠타 배경으로 뽑고 §4에서 키잉한다 (가장 확실)
- 알파를 제대로 내보내는 건 사실상 전용 픽셀아트 모델 정도다

### 두 레퍼런스를 동시에 쓰기

가장 정확한 방법은 **두 장을 같이 첨부**하는 것이다.

```
[레퍼런스 A 첨부] [레퍼런스 B 첨부]
Use the color palette and chunky pixel style of the FIRST image.
Use the sprite-sheet layout, transparent background and tier-progression structure
of the SECOND image.
Now draw: 8 upgrade tiers of a single player ship, stacked vertically, facing up.
```

