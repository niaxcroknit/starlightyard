# Claude 패치 묶음

코덱스가 새 소스를 보내면, 그 소스에 Claude 쪽 수정을 다시 얹는 도구입니다.

```sh
python3 tools/claude-patch/merge_patch.py source 버전태그   # 예: 20261116-3
```
- `index.html`: 캐시 무효화(?v=), 제목, 장식 옮기기 버튼·바
- `build-standalone.cjs`: ?v= 붙은 경로도 내장
- `app.js`: 화면 맞춤(fitVisible), 장식 위치(decoAt) 연결, 파일 끝에 `claude_tail.js` 추가
- `app.css`: 끝에 `claude_tail.css` 추가

코덱스가 이미 같은 내용을 포함하면 건너뛰고, 기준 줄을 못 찾으면 멈춰서 알려 줍니다.
