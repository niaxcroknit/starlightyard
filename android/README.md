# 별빛 마당 — 안드로이드 앱

안드로이드 스튜디오에서 이 폴더(`StarlightYard-android`)를 그대로 열면 됩니다. 노드(Node)나 다른 설치는 필요 없어요.

1. 안드로이드 스튜디오 → **Open** → 이 폴더 선택
2. 처음 열면 Gradle Sync가 자동으로 돌아요(인터넷 필요, 몇 분 걸릴 수 있어요)
3. 위쪽 ▶(Run)을 누르면 연결한 폰이나 에뮬레이터에서 실행돼요
4. 설치 파일 만들기: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**
   - 플레이 스토어용은 **Build → Generate Signed App Bundle / APK** 에서 서명 키를 만들어 `.aab`로 만들어요

## 들어 있는 것
- 앱 화면: `app/src/main/assets/www/` (웹 버전과 같은 파일)
- 앱 코드: `app/src/main/java/com/starlightyard/app/MainActivity.java`
- 앱 이름/아이콘: `res/values/strings.xml`, `res/mipmap-*`, `res/drawable-nodpi/ic_launcher_art.png`
- 앱 아이디: `com.starlightyard.app` (`app/build.gradle`에서 바꿀 수 있어요)

## 안드로이드에서 다른 점
- 사진 고르기, 백업 파일 저장(저장 위치 고르는 창), 코드·링크 복사가 안드로이드 방식으로 동작해요
- 뒤로 가기: 열린 창 닫기 → 풍등 보기 나가기 → 앱 나가기 순서
- 이메일 로그인은 메일로 온 숫자를 넣는 방식만 돼요(링크는 브라우저로 열려요)
- 저장 데이터는 이 앱 안에 따로 저장돼요. 웹/아이폰에서 쓰던 마당은 설정 → 서버에 저장(같은 이메일 로그인)이나 백업 파일로 옮길 수 있어요

## 웹 버전을 고친 뒤 다시 넣기
저장소 루트에서 `sh tools/make-android.sh` 를 실행하면 최신 웹 파일이 `assets/www`로 복사돼요.

요구 사항: Android Studio Narwhal 3 Feature Drop(2025.1.3) 이상 · Android Gradle Plugin 8.13 · Gradle 8.13 · compileSdk/targetSdk 36(안드로이드 16) · minSdk 24
