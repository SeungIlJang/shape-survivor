# 적 캐릭터 스프라이트 — 생성 프롬프트 & 적용 가이드

적 9종을 **동작(애니메이션) 포함** 이미지로 올리기 위한 문서.

---

## 0. 먼저 알아야 할 것

이 게임은 지금 **이미지 에셋이 0장**이고 전부 캔버스에 코드로 그린다.
이미지를 넣는 건 "파일만 떨구면 끝"이 아니라 **로딩 경로·용량·코드 변경**이 함께 걸린다.

### 반드시 지켜야 하는 3가지

| 항목 | 내용 |
|---|---|
| **방향** | 스프라이트는 **오른쪽(+x)을 향하게** 그린다. 게임이 `ctx.rotate(atan2(플레이어-적))`로 매 프레임 회전시킨다 |
| **색코딩** | 티어별 색은 게임 시스템이다. 아래 각 종의 지정색을 **반드시** 주조색으로 쓸 것 |
| **중심** | 정사각 캔버스 정중앙이 회전축이자 히트박스 중심 |

> 회전하므로 **위에서 내리쬐는 광원·바닥 그림자를 넣지 말 것.** 회전하면 그림자가 같이 돌아 어색해진다.
> 명암은 "중심이 밝고 가장자리가 어두운" 방사형으로만 준다.

---

## 1. 공통 규격

```
형식      PNG-32 (알파 투명 배경), 배경에 체커보드 무늬를 그리지 말 것
해상도    256 x 256 (한 프레임). 게임에서 축소해 쓴다
방향      기수(머리)가 오른쪽(+x)
배치      정사각 정중앙 정렬. 프레임마다 중심이 흔들리면 회전 시 떨린다
여백      가장자리 8px 이상 비울 것 (회전 시 잘림 방지)
시트      가로 1줄 배치 (프레임 수 x 256) 가로 스트립
```

### 프레임 구성 — 상태 2종

| 상태 | 프레임 | 용도 |
|---|---|---|
| `move` | **4** | 상시 재생(이동 중). 1↔4가 자연스럽게 이어지는 루프 |
| `death` | **4** | 처치 순간 1회 재생. 마지막 프레임은 거의 사라진 상태 |

> 피격 플래시(흰색)는 **코드가 자동 생성**하므로 따로 그리지 않아도 된다.

### 게임 내 실제 크기 (DPR 2 기준 픽셀)

| 종류 | 히트반경 r | 화면 표시 | 비고 |
|---|---|---|---|
| fast | 9 | 36px | 가장 작다 |
| shard | 10 | 40px | |
| normal | 11 | 44px | |
| weaver | 12 | 48px | |
| spiker | 13 | 52px | |
| splitter / ringed | 16 | 64px | |
| twin | 20 | 80px | |
| tank | 23 | 92px | 가장 크다 |

**36px까지 줄어든다.** 가는 선·작은 디테일은 전부 사라진다.
실루엣과 2~3단 명암으로 승부하고, 디테일은 큰 종류(tank/twin)에만 넣을 것.

---

## 2. 공통 스타일 블록

각 종 프롬프트 뒤에 **그대로** 붙인다. 이게 9종의 통일성을 만든다.

```
STYLE: Top-down view game sprite for a 2D arcade shoot-em-up, orthographic,
facing RIGHT (nose points to the right edge). Hostile alien fighter craft.
Clean hard-edged shapes, 2-3 step shading bands (no smooth gradients, no soft blur).
Bold readable silhouette that stays recognizable when scaled down to 40 pixels.
Bright rim highlight along the outline so it separates from a near-black space background.
Radial lighting from the center outward — NO top-down light, NO ground shadow
(the sprite is rotated in-game and a baked shadow would rotate with it).
Perfectly centered on a square canvas, 8px empty margin on all sides.
Background: fully transparent alpha. Do not draw a checkerboard pattern.
Limit to 3 colors plus highlight: body (desaturated), accent, glowing core.
```

---

## 3. 적 9종 프롬프트

각 블록 = `[외형]` + `[동작]` + 공통 스타일 블록.
**색은 바꾸지 말 것** — 플레이어가 외운 식별 정보다.

### 하급 (f) — 작고 날카로운 드론. 떼로 몰려온다

#### 3-1. normal · 주조색 `#ff5c7a` (산호 핑크)
```
[외형] A small wedge-shaped scout drone. Narrow pointed nose, two short swept-back
blades, a single glowing core at the center. Minimal parts — this is the weakest
and most common enemy. Coral pink #ff5c7a body with a brighter pink rim.
[동작 move 4프레임] The two blades flap slightly inward and outward, and the core
pulses brighter on frames 2-3. Subtle — it must not look like it is spinning.
[동작 death 4프레임] The core flares white, the blades snap outward and break off,
the body fractures into 3-4 shards that scatter, final frame is faint debris.
```

#### 3-2. fast · 주조색 `#ff9ec4` (연분홍)
```
[외형] A very thin dart interceptor, the slimmest of all enemies. Long needle nose,
tiny fins near the tail, a thin bright line running down the spine.
Light pink #ff9ec4 with a hot white-pink leading edge.
[동작 move 4프레임] A thrust pulse travels from tail to nose along the spine line,
and a short exhaust flicker appears behind the tail. The hull itself barely moves.
[동작 death 4프레임] Snaps in half at the middle, both halves tumble apart,
dissolving into a thin streak of sparks.
```

#### 3-3. shard · 주조색 `#a0ff5c` (라임)
```
[외형] An angular broken-crystal fragment craft, deliberately asymmetric —
one side has a larger jagged spur than the other. Sharp faceted planes.
Lime green #a0ff5c with a pale green rim and a dim core.
[동작 move 4프레임] The loose spur wobbles out of sync with the body, giving an
unstable damaged feel. Small chips drift and re-attach.
[동작 death 4프레임] Shatters outward into many small angular shards like
breaking glass, fading to nothing.
```

### 중급 (m) — 날개 달린 전투기. 형태가 분명해진다

#### 3-4. weaver · 주조색 `#b98cff` (보라)
```
[외형] A winged fighter with two long swept wings and a narrow fuselage.
Clearly more "built" than the drones — visible wing roots and a cockpit-like core.
Violet #b98cff body, lighter violet rim, bright core.
[동작 move 4프레임] The wings sweep back and forward slightly, like a bird gliding.
The core brightens as the wings sweep back.
[동작 death 4프레임] One wing tears off first, the body spins briefly,
then the fuselage bursts.
```

#### 3-5. spiker · 주조색 `#ffd24d` (황금)
```
[외형] A spiked star-fighter bristling with sharp quills around the hull.
Aggressive and prickly, roughly radial but still with a clear forward nose.
Gold #ffd24d with amber shadow bands and a white-hot core.
[동작 move 4프레임] The spikes extend and retract in a slow breathing rhythm —
longest on frame 3. Dangerous, like it is charging up.
[동작 death 4프레임] All spikes fire outward simultaneously, the hull collapses
inward and pops.
```

#### 3-6. splitter · 주조색 `#8ee85c` (연두)
```
[외형] A wide, bulky hull with a visible crack running across it — it looks like
it is about to come apart (it splits into two fast drones when killed).
Light green #8ee85c, darker green plating, crack glowing from within.
[동작 move 4프레임] The crack widens and narrows, leaking light. The two halves
shift slightly against each other.
[동작 death 4프레임] The crack tears fully open and the hull separates into
two clean halves that fly apart — telegraphing the split mechanic.
```

### 정예 (e) — 각지고 둔중한 장갑함. 크고 느리다

#### 3-7. ringed · 주조색 `#c26bff` (자주)
```
[외형] A hexagonal armored core surrounded by two broken orbital rings that do not
quite close. The rings are the signature — they must read even at small size.
Purple #c26bff hull, brighter purple rings, deep core.
[동작 move 4프레임] The two rings counter-rotate slowly against each other
(the hull stays still). Core pulses once per loop.
[동작 death 4프레임] The rings fly off outward and shatter, then the core
implodes into a point and bursts.
```

#### 3-8. tank · 주조색 `#ff8a5c` (주황)
```
[외형] The largest enemy — a heavy armored block with thick angular plating,
two forward cannon barrels, and a big dominant core. Slow and brutal looking.
Orange #ff8a5c plating, dark brown-orange shadow bands, large bright core.
[동작 move 4프레임] Armor plates shift and settle with a heavy mechanical rhythm.
The cannon barrels recoil slightly. Reads as heavy and slow.
[동작 death 4프레임] Plates blow off one by one, internal structure glows
white-hot, then a large explosion.
```

#### 3-9. twin · 주조색 `#ff6bd0` (마젠타)
```
[외형] Two linked hulls joined by a central spine, each with its own glowing core —
the twin cores are the signature. Symmetrical left-right.
Magenta #ff6bd0, darker magenta spine, two bright cores.
[동작 move 4프레임] The two cores pulse alternately (left bright, then right),
and the hulls flex slightly against the spine.
[동작 death 4프레임] The spine snaps, the two hulls separate and each core
goes critical and explodes in sequence.
```

---

## 4. 이미지를 넣을 폴더

핵심: **OTA로 받은 HTML은 앱 자체 origin에 `document.write`되므로, 상대경로가
앱에서는 APK 내장 assets로, 웹에서는 GitHub Pages로 각각 풀린다.**
→ **똑같은 파일을 두 곳에 넣으면 경로 문자열 하나로 양쪽이 동작한다.**

### 넣을 위치 2곳

```
① 웹 (GitHub Pages)
   D:\AI\workspace\game\games\img\enemies\
   → https://seungiljang.github.io/games/img/enemies/...

② 앱 (APK 내장 · 오프라인 대비)
   D:\AI\workspace\game\shape-survivor\www\img\enemies\
   → npx cap sync android 실행 시
     android/app/src/main/assets/public/img/enemies/ 로 복사됨
```

코드에서는 **상대경로 하나만** 쓴다:
```js
'img/enemies/' + type + '_move.png'
```

### 파일명 규칙

```
img/enemies/normal_move.png     (1024 x 256 = 256px x 4프레임 가로 스트립)
img/enemies/normal_death.png    (1024 x 256)
img/enemies/fast_move.png
img/enemies/fast_death.png
...  9종 x 2상태 = 18개 파일
```

### 적용 절차

```bash
# 1) 두 폴더에 같은 파일을 넣는다
# 2) 앱 쪽 동기화
cd D:\AI\workspace\game\shape-survivor
npx cap sync android

# 3) 웹 쪽 배포
cd D:\AI\workspace\game\games
git add img/enemies && git commit -m "적 스프라이트 추가" && git push
```

> ⚠️ **`npm run sync` 는 쓰지 말 것.** 그 스크립트의 `copyweb` 이
> `index.html` 을 `www/index.html` 로 덮어써서 **OTA 로더를 날린다.**
> `npx cap sync android` 만 직접 실행할 것.

### 용량 주의

18개 파일 x 4프레임. 256px PNG 한 장이 ~8KB면 프레임 72장 = **약 600KB**.
- **외부 파일로 두면** HTML 용량은 그대로(216KB) → OTA 5초 타임아웃에 영향 없음 ✅
- base64로 HTML에 박으면 ~1MB가 되어 **OTA 로딩이 위험해진다** ❌
→ 반드시 외부 파일 방식으로 갈 것.

---

## 5. 코드 쪽에 필요한 작업 (별도 요청 필요)

이미지만 넣는다고 적용되지 않는다. `hostileSprite()` 가 지금은 코드로 그린다.

- [ ] 이미지 프리로드 + **로드 실패/지연 시 현재 절차적 스프라이트로 폴백**
      (오프라인이나 첫 실행에서 적이 안 보이면 치명적)
- [ ] 프레임 인덱스 계산 — `flameSprite(frame)` 가 이미 같은 패턴을 쓴다:
      `Math.floor(time*10 + e.x*0.01) % 4`
- [ ] 피격 흰 플래시 — 이미지를 흰색으로 틴트한 변형을 오프스크린에 1회 구워 캐시
- [ ] `death` 상태 재생 — 현재는 처치 즉시 제거된다. 사망 애니메이션용 수명이 필요
- [ ] 적 60마리 x drawImage 비용 재측정 (현재 기준선: 전체 0.74~1.58ms)

> 이미지가 준비되면 위 작업을 요청해 주세요. 폴백을 반드시 함께 넣겠습니다.
