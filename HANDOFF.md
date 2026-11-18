# 별빛 마당 — 현재 상태 (코덱스 전달용)

> 마지막 갱신: 2026-11-13 오후 (Claude). 코덱스가 클레이 디자인으로 바꾼 버전 위에 Claude가 기능과 모바일 버그를 손봤습니다.
> 이전 단계 문서는 `reference/HANDOFF-original.md`(최초 도트 버전)입니다. 그 안의 "동물 디자인부터 다시"는 이미 끝난 일입니다.
> 저장소: `niaxcroknit/starlightyard` (`main`), 배포: GitHub Pages `https://niaxcroknit.github.io/starlightyard/` (루트 `index.html` → `source/`).

---

## 0. 반드시 지킬 원칙 (사용자 확정)

### 꼭 지킬 것
- 반려동물을 떠나보낸 사람이 아이들과 조용히 시간을 보내는 **잔잔하고 따뜻한** 파스텔 클레이 마당. 벌칙·실패·배고픔 게이지·연속 방문 보상·결석 불이익 없음.
- **고양이는 말하지 않음.** 말풍선은 `야옹/냐앙/미야옹/냥!/먀아/골골골…`만. 문장 대사는 하늘에 상자 없이 글자로(그림자 15%). 강아지·토끼·햄스터는 말풍선.
- **"울어도 괜찮아" 류 문구 금지.**
- **후회 위로는 별 편지 안에서만.** 편지 내용에 후회 키워드가 있으면 아이가 알아서 위로. 편지 내용은 어디로도 보내지 않음(기기 안에서만 판단).
- 최대 10마리, **가로·세로 모두 꽉 차게**, 앱 아이콘에 동물 없음.
- 화면은 **단순하게**. 설명 문구 최소화.
- **새 기능·모션은 바로 적용하지 말고 먼저 미리보기 이미지로 보여 주고** 사용자가 고르면 적용. (사용자가 "바로 적용"이라고 하면 바로.)
- 색은 반드시 **현재 디자인 무드**(크림 패널 `rgba(255,251,246,.92)`, 자두색 글씨 `#645163`, 보조 `#96849a`, 라벤더 버튼 `#ead8e9`/`#624c68`, 핑크 `#e9a7ba`)에 맞출 것. 참고 이미지의 색을 그대로 가져오지 말 것.
- 디데이 카드는 **설정 안에서만**(메인 마당에 띄우지 않음).

### 하지 말 것
봉사·기부 유도 / 추모 공간·배웅·졸업 엔딩 / 공유 추모·함께 기억하기 / 마음 그래프 / 연속 방문 스트릭·FOMO / "울어도 괜찮아" / 아이콘에 동물 / 동물 그림체를 도트·양모·수채 등으로 되돌리기.

---

## 1. 실행

```sh
cd source
npm start      # http://localhost:8787 (분리된 그림은 HTTP로 열어야 함)
npm test       # 문법·그림 33개·날짜 계산·설정 날짜 카드
npm run build  # 단일 파일 source/dist/starlight-yard.html (그림·폰트 내장, 약 13MB, git 제외)
```
패키지 설치·API 키 불필요. `source/dist/`는 `.gitignore`에 있음.

## 2. 파일 구조

| 경로 | 내용 |
|---|---|
| `index.html` (루트) | GitHub Pages 진입점 → `./source/`로 이동 |
| `.nojekyll` | Pages에서 Jekyll 처리 끔 |
| `source/index.html` | 화면 구조. doctype·viewport(`maximum-scale=1, viewport-fit=cover`)·manifest·아이콘 포함 |
| `source/app.css` | 스타일. 뒤로 갈수록 나중에 덧붙인 덮어쓰기 규칙(아래 §4 순서) |
| `source/app.js` | 전부 **하나의 즉시실행함수** 안. 파일 맨 끝 `})();`가 그 닫힘. 새 코드는 반드시 그 안에 넣을 것 |
| `source/assets/` | 동물·걷기·배경·소품 그림, 폰트 (`assets-manifest.json`) |
| `source/manifest.webmanifest`, `source/icon-512.png` | 홈 화면 추가용 |
| `icons/` | 확정 앱 아이콘(노을 하늘·별·무지개·하트, 동물 없음) |
| `previews/` | 코덱스가 만든 마당·동물 미리보기 |
| `previews/claude/` | Claude가 만든 별 편지·모래삽 미리보기 (§5) |
| `reference/` | 승인된 동물 그림체, 이전 인수인계 문서 |

## 3. 기능 현황

### 코덱스 단계에서 이미 있던 것
아이 소개(36품종, 사진, 날짜), 클레이 3D 동물(정면·옆·뒤·잠, 걷기 432프레임), 마당 이동, 밥 주기, 똥, 공놀이, 별 편지, 꾸미기 13종(온기 해금·켜고 끄기), 같이 숨 쉬기(1분), 작은 부탁(앱 밖 하루), 문질러 쓰다듬기(손을 늦게 따라오는 스프링), 쪽지, 기념일 케이크, 디데이(설정 안, `family[].dates={born,met,star}`, `dayKind`, `G.widgetPetId`).

### Claude가 이번에 추가·수정한 것

| 기능 | 핵심 코드 | 메모 |
|---|---|---|
| 별 편지 **종이비행기 모션** | `flyLetter()` | 쓴 글이 종이로 떠오름 → 양 모서리 접힘 → 반 접혀 종이비행기 → 점선 자국 남기며 하늘로 → 별. 비행 중엔 `rising.hold=true`로 하늘 별을 숨겼다가 도착 시 풀어 줌. 좌표는 확대 상태(`camZ/camX/camY`) 반영 |
| **휠 날짜 선택** | `openDatePicker()`, `dpRead()`, `refreshDateBtns()`, `#dpVeil` | 날짜 칸 4개(`petMet/petBorn/petStar/petDay`)를 `type=hidden` + `.date-btn`으로 교체. 값 바꾸면 `input` 이벤트를 쏴서 기존 코덱스 로직 그대로 동작. 연(1985~올해)·월·일 스크롤 스냅, "지우기" 있음. 색은 디자인 무드 |
| **마당만 확대** | 파일 끝쪽 pinch IIFE, `camZ` | 두 손가락 = 캔버스에만 CSS transform(1~2.6배), 메뉴는 그대로. 페이지 확대는 막음(`touch-action`, `gesturestart` preventDefault, `maximum-scale=1`). 캔버스 좌표 계산은 `/camZ` |
| **사용 방법 안내** | `#guideVeil`, `openGuide()`, `G.guideSeen` | 첫 방문(또는 처음 소개 후) 4장: 쓰다듬기 → 온기(빛 모으기) → 꾸미기 → 메뉴·두 손가락 확대. 설정 "사용 방법 다시 보기" |
| **백업 · 옮기기** | `saveBackup()`, `readBackup()`, `applyBackup()`, `G.lastBackup` | 설정 맨 아래. 파일 `별빛마당-백업-YYYYMMDD.json` = `{app:"starlight-yard", version:1, exportedAt, data:G}`. 저장 순서: claude.ai `downloads` → 모바일 공유 시트 → `<a download>`. 불러오기 전 내용 요약을 보여 주고 확인 |
| **똥 치우기 모래삽 모션** | `cleanPoop()` → `updateScoops()`/`drawScoopClean()`/`drawScoop()` → `finishPoop()` | 하늘색 클레이 삽 등장 → 밑으로 밀어 넣기 → 들어 올려 흙 털기 → 반짝 사라짐(약 1.7초, `SCOOP_T`) |
| **공 안 사라지던 버그** | `updateBall()`, `ballFade()` | 공 물고 오던 아이를 쓰다듬기/밥/다른 곳 탭하면 길을 잃어 공이 영원히 남던 문제. 길 잃으면 그 자리에 내려놓고 사라짐, 바닥 공은 가까운 아이 재파견, 20~40초 안전장치 |
| 아주 좁은 화면(≈250px, 글꼴 확대) | `app.css` "Very narrow screens" | 디데이 숫자 한 줄 유지, 마당 이름 공간 확보, 메뉴 글자 단어 단위 줄바꿈 |
| 칸 넘침 | `app.css` "overflow guards" | `fieldset{min-width:0}`, 범례(legend) 상자 안으로 |
| 모바일 꽉 찬 화면 | `app.css` 끝부분, `app.js` resize 블록 | `.stage{position:fixed;inset:0}`, `html,body` 고정·`100dvh`, 상단 바·창은 `env(safe-area-inset-*)`만큼 띄움, 바탕 `#efe7ef`, `visualViewport`·회전 시 다시 맞춤, 입력 후 스크롤 원위치, 안내 문구는 `--dockH` 위 |

### 저장 데이터 `G` (추가된 필드)
`guideSeen`, `lastBackup`, `blooms`, `bloomSpots`, `favorDone`, `hidden`(치운 장식), `yardName` 등. 키는 `localStorage["starlight-yard-v1"]` 그대로. **가족·사진·편지를 초기화하는 변경 금지.** 필드 추가 시 `normalize()`에 기본값.
claude.ai 아티팩트 환경에서만 `window.claude.use("db")`로 계정 비공개 동기화(그 외 환경에서는 조용히 건너뜀). 아티팩트 권한: `db`, `user`, `downloads`.

## 4. CSS 덮어쓰기 순서 (app.css 뒤쪽)
코덱스 기본 → "Settings can be narrower…"(디데이 넘침) → "Very narrow screens…" → "Full-bleed on phones…" → "overflow guards" → date button / wheel picker → star letter flight → pinch → how-to guide → "Always fill exactly…" → backup → hint above dock → "Date picker in the yard's own palette". 같은 선택자를 다시 쓸 땐 이 순서를 고려.

## 5. 미리보기만 하고 아직 적용 안 한 것
- `previews/claude/letter-private-save-preview.png`: 지난 편지 위 "내가 쓴 편지는 나만 볼 수 있어요" 안내 + 편지마다 **"간직하기"(편지를 카드 이미지로 만들어 사진에 저장)**. 사용자 승인 전.
- `previews/claude/letter-motion-preview.png`: 편지 아래 🔒 "이 휴대폰에만 저장돼요" 한 줄 — 모션만 적용됐고 이 문구는 미적용.
- 실시간 기기 간 연동(로그인+서버): 사용자에게 질문만 해 둔 상태. "편지는 기기에만"이라는 원칙과 충돌하므로 결정 전 구현 금지.

## 6. 확인이 필요한 것 (실기기)
- iOS Safari/카카오톡 인앱 브라우저의 **아래쪽 잘림**: 사용자가 여러 번 제보. 현재는 `.stage` 고정 + 안내 문구를 메뉴 위로 올린 상태. 한때 `visualViewport` 차이만큼 마당을 올리는 보정을 넣었다가 **툴바 없는 화면에서 아래에 빈 라벤더 띠**가 생겨 되돌림. 실제 아이폰 캡처로 다시 확인할 것.
- 두 손가락 확대는 합성 포인터 이벤트로만 확인. 실기기 확인 필요.
- 브라우저 자동 검사로는 320/375/390 세로, 667/844 가로, 768/1024 태블릿에서 넘침 없음 확인.

## 7. 검증 방법 (Claude가 쓴 방식)
Playwright(크로미움)로 `source/`를 HTTP로 띄우고 localStorage에 샘플 상태를 넣어 화면을 열고, 창마다 `getBoundingClientRect`로 상자 밖으로 나간 요소를 찾고, 모션은 프레임별 캡처로 확인. 내부 상태가 필요하면 **테스트용 복사본**의 `app.js` 끝에 `window.__ball` 같은 노출 코드를 잠깐 넣어서 확인(저장소에는 넣지 않음).

## 마당 공유 · 풍등 (2026-11-18 추가, 사용자 요청으로 '공유 금지' 원칙을 바꿈)
- 설정 → 마당 공유: 주인이 6자리 공유 코드를 만들고, 코드/링크(`?visit=코드`)를 받은 사람은 **구경 + 풍등 띄우기만** 가능. 수정은 주인만.
- 서버: Supabase 프로젝트 `ppojjak`의 `sy_yards`, `sy_lanterns` 표(다른 표와 분리). 표는 직접 못 읽고 `sy_*` 함수로만 접근. 주인 비밀값은 `G.share.secret`에만 있고 서버엔 해시만.
- 공유되는 것: 마당 이름·하늘·온기·장식/위치·아이 이름/종/한마디, 사진은 '아이 사진도 보여주기'를 켤 때만. **별 편지·날짜·기분 기록은 보내지 않음.**
- 놀러 간 동안 `window.__syVisit`로 save()를 막아 방문자 자기 마당 데이터는 절대 바뀌지 않음.
- 코드 위치: `tools/claude-patch/apply_share.py`, `share_tail.js`, `share_tail.css` (merge_patch.py가 마지막에 자동 실행).

## 서버 저장 (이메일 로그인, 2026-11-18)
- 설정 → 서버에 저장: 이메일로 받은 숫자 6개로 로그인(Supabase Auth, ppojjak 프로젝트). 마당이 바뀌면 2.5초 뒤 `sy_saves`(본인만 읽고 쓰는 RLS)에 통째로 저장.
- 처음 로그인하는 폰에 다른 마당이 있으면 **절대 자동으로 덮지 않고** 고르게 함(고를 때까지 매번 다시 물음). 한 번 맞춘 뒤로는 더 최근에 바뀐 쪽을 따라감.
- 새로 설치한 폰은 첫 화면의 '전에 쓰던 마당이 있어요 · 이메일로 불러오기'로 복원.
- 코드: `tools/claude-patch/cloud_tail.js`, `cloud_tail.css` (apply_share.py가 함께 붙임). 시작 중 save()가 먼저 불리므로 상태 변수는 `var`로 둘 것.
