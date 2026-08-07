# Frontend Spec — Local LLM Chat

이 문서는 `frontend/docs/chat_ui_설계도.jpg`(와이어프레임)와 `frontend/docs/image-1.png`(컴포넌트 흐름도)를 기반으로,
`frontend/` 폴더에 React(Vite)로 채팅 UI를 구현하기 위한 스펙이다. 백엔드(`backend/`)는 FastAPI + Ollama로 이미 구현이 완료되어 있으며, 이 문서는 프론트엔드에서 그 API를 어떻게 호출하고 화면을 구성할지만 다룬다.

## 1. 전제 조건

- 프론트엔드 프로젝트: `frontend/` (Vite + React 19, `npm run dev`로 실행)
- 백엔드 프로젝트: `backend/` (FastAPI, `python main.py`로 실행 → `http://localhost:8000`)
- 백엔드 CORS는 `allow_origins=["*"]`로 모든 origin을 허용하므로 프론트는 별도 프록시 설정 없이 `http://localhost:8000`을 직접 호출한다.

### Context7 MCP 사용 지침

코드 생성, 리팩터링, 오류 수정, 라이브러리 사용법 확인 시 VS Code에 설치된 **Context7 MCP**를 사용한다.
다음 라이브러리·프레임워크를 다룰 때는 반드시 Context7 MCP로 최신 공식 문서/예제를 먼저 확인한 뒤 구현한다: **FastAPI, React, Vite, Ollama**.

### 코드 작성 원칙

- 초보자도 이해할 수 있게 함수/변수명을 명확히 하고, 필요한 곳에만 짧은 주석을 단다.
- 컴포넌트는 하나의 책임만 갖도록 분리한다(입력 UI / 화면 렌더링 / API 호출 / 상태 관리를 섞지 않는다).
- 매직 넘버·문자열(예: API URL, 기본 모델명)은 상수 또는 설정 파일로 분리한다.
- 구현 전 이 스펙의 요청/응답 필드명과 백엔드 스키마(`backend/schema.py`)가 정확히 일치하는지 대조한다. 필드명 오타가 실제 런타임 오류의 가장 흔한 원인이다.

## 2. 백엔드 API 계약

`backend/schema.py`, `backend/main.py` 기준.

### POST /chat

요청 바디 (`ChatRequest`):

| 필드 | 타입 | 기본값 | 비고 |
|---|---|---|---|
| message | string | (필수) | 사용자 질문 |
| model | string | `"exaone3.5:7.8b"` | Ollama 모델명 |
| system_prompt | string | `"너는 초보자를 돕는 친절한 AI 강사다."` | |
| temperature | float | 0.5 | 0.0 ~ 2.0 |
| top_p | float | 0.9 | 0.0 ~ 1.0 |
| num_predict | int | 1024 | 1 ~ 2048 |

응답 바디 (`ChatResponse`):

```json
{
  "model": "exaone3.5:7.8b",
  "message": "모델 응답 텍스트",
  "elapsed_time": 3.421
}
```

오류 시 FastAPI가 `500`과 `{"detail": "..."}`를 반환한다. 프론트는 `response.ok`가 false면 `detail`을 읽어 에러 메시지로 표시한다.

### GET /models

응답:

```json
{ "models": ["exaone3.5:7.8b", "gemma3:4b", "llama3.2:3b"] }
```

사이드바 모델 드롭다운을 채우는 데 사용한다. (실패 시에도 화면이 깨지지 않도록, 기본 모델 하나를 fallback으로 넣어둔다.)

## 3. 화면 레이아웃 (와이어프레임 기준)

전체 2열 레이아웃.

```
┌───────────────┬─────────────────────────────────────────────┐
│  모델 설정      │  Local LLM Chat              [대화 초기화]    │
│  (Sidebar)     │  React + FastAPI + Ollama 기반 로컬 AI 채팅 앱 │
│               ├─────────────────────────────────────────────┤
│  모델 ▾        │  (메시지 목록, 스크롤 영역)                     │
│  시스템 프롬프트  │   사용자 메시지 → 우측 정렬, 파란 배경           │
│  (textarea)    │   AI 응답     → 좌측 정렬, 회색/흰색 배경        │
│  Temperature   │                                              │
│  Top P         │                                              │
│  Num Predict   ├─────────────────────────────────────────────┤
│               │  [텍스트 입력창 (Shift+Enter: 줄바꿈)] [전송]    │
└───────────────┴─────────────────────────────────────────────┘
```

- 로딩 중에는 입력창 자리에 "응답 생성 중..." 같은 표시가 뜨고, 전송 버튼은 비활성화된다 (와이어프레임 우하단 참고).
- 대화가 없을 때 입력창 placeholder 예시: `질문을 입력하세요. 예: FastAPI와 React를 연결하는 이유를 설명해줘. (Shift+Enter: 줄바꿈)`

## 4. 컴포넌트 구조 (흐름도 기준)

`image-1.png`의 데이터 흐름을 그대로 컴포넌트 계층으로 옮긴다.

```
사용자 입력
  → ChatInput          (텍스트 입력 + 전송 버튼)
      onSend(message)
  → ChatWindow          (대화 상태를 소유하는 컨테이너)
      sendChatMessage(payload)
  → chatApi.js          (fetch 래퍼)
      fetch POST /chat
  → FastAPI 백엔드 ↔ Ollama
      응답 데이터 반환
  → chatApi.js → ChatWindow state 업데이트
  → MessageList          (메시지 배열을 화면에 렌더링)
```

### 4.1 파일 구조

```
frontend/src/
├── api/
│   └── chatApi.js         # fetch 래퍼: sendChatMessage(), getModels()
├── components/
│   ├── Sidebar.jsx         # 모델 설정 패널 (모델 선택, 시스템 프롬프트, 슬라이더들)
│   ├── ChatHeader.jsx      # 제목 + 부제목 + "대화 초기화" 버튼
│   ├── ChatWindow.jsx      # 대화 상태(messages/loading/error) 소유 + 레이아웃 조립
│   ├── MessageList.jsx     # messages 배열을 순회하며 MessageBubble 렌더링
│   ├── MessageBubble.jsx   # 메시지 1건 (역할에 따라 정렬/색상 분기)
│   └── ChatInput.jsx       # 입력창 + 전송 버튼, onSend(message) 콜백만 가짐
├── App.jsx                 # <ChatWindow />를 렌더링
└── ...
```

### 4.2 컴포넌트별 책임

**`chatApi.js`**
- API 베이스 URL(`http://localhost:8000`)을 상수로 관리.
- `sendChatMessage(payload)`: `POST /chat` 호출, 실패 시 에러를 throw (호출부에서 catch).
- `getModels()`: `GET /models` 호출.
- 이 파일만 `fetch`를 알고 있고, 컴포넌트는 이 함수들만 호출한다 (컴포넌트에 fetch 코드를 직접 쓰지 않는다).

**`Sidebar.jsx`**
- props: `settings`(model, systemPrompt, temperature, topP, numPredict), `onChange(partialSettings)`.
- 모델 드롭다운은 `getModels()` 결과로 채우되, 로딩 실패 시 `model` 기본값(`exaone3.5:7.8b`) 하나만 보여준다.
- 슬라이더 값은 라벨에 실시간으로 표시 (`Temperature: 0.7` 형태, 와이어프레임과 동일).

**`ChatHeader.jsx`**
- props: `onReset()` — "대화 초기화" 버튼 클릭 시 부모의 메시지 목록을 비운다.

**`ChatWindow.jsx`**
- 이 앱의 유일한 상태 소유자(state owner). 상태: `messages`, `loading`, `error`, `settings`(모델 설정값들).
- `handleSend(message)`: 사용자 메시지를 `messages`에 추가 → `settings` + `message`로 payload 구성 → `sendChatMessage(payload)` 호출 → 성공 시 AI 응답을 `messages`에 추가, 실패 시 `error` 상태 갱신.
- `Sidebar`, `ChatHeader`, `MessageList`, `ChatInput`을 조립해 레이아웃을 구성한다.

**`MessageList.jsx`**
- props: `messages`. 배열을 매핑해 `MessageBubble`을 렌더링. 새 메시지 도착 시 하단 자동 스크롤(useRef + useEffect).

**`MessageBubble.jsx`**
- props: `role`(`user` | `assistant`), `text`, `elapsedTime?`.
- `role === 'user'`면 우측 정렬 + 파란 배경, 아니면 좌측 정렬 + 회색 배경. assistant 메시지는 `elapsed_time`을 작은 글씨로 함께 표시.

**`ChatInput.jsx`**
- props: `onSend(message)`, `isLoading`.
- 자체 입력값(state)만 관리하고, 전송 시 `onSend`만 호출 — API를 직접 알지 못한다.
- Enter 전송 / Shift+Enter 줄바꿈, 빈 문자열 전송 차단, `isLoading`이면 입력창·버튼 비활성화(와이어프레임의 "응답 생성 중..." 상태).

## 5. 상태 설계 (`ChatWindow` 기준)

```js
const [messages, setMessages] = useState([])
// [{ role: 'user' | 'assistant', text: string, elapsedTime?: number }]

const [settings, setSettings] = useState({
  model: 'exaone3.5:7.8b',
  systemPrompt: '너는 초보자를 돕는 친절한 AI 강사다.',
  temperature: 0.7,
  topP: 0.9,
  numPredict: 256,
})

const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

`sendChatMessage`에 넘기는 payload는 백엔드 필드명(`snake_case`)에 맞춰 변환한다:

```js
{
  message,
  model: settings.model,
  system_prompt: settings.systemPrompt,
  temperature: settings.temperature,
  top_p: settings.topP,
  num_predict: settings.numPredict,
}
```

## 6. 에러 처리 규칙

- `fetch` 자체 실패(네트워크 오류, 백엔드 미기동): "서버에 연결할 수 없습니다" 같은 사용자 친화 메시지로 변환해 표시.
- `response.ok`가 false: 응답 바디의 `detail`을 읽어 표시 (JSON 파싱 실패 시 상태 코드만 표시).
- 에러가 발생해도 기존 `messages`는 그대로 유지하고, 에러 메시지만 별도 영역에 노출한다 (대화 내용을 지우지 않는다).
- `loading`이 true인 동안 `ChatInput`은 비활성화해 중복 전송을 막는다.

## 7. 구현 순서 제안

1. `src/api/chatApi.js` 작성 (POST /chat, GET /models 래퍼)
2. `ChatInput.jsx` → `MessageBubble.jsx` → `MessageList.jsx` (상태 없는 표현 컴포넌트부터)
3. `Sidebar.jsx`, `ChatHeader.jsx`
4. `ChatWindow.jsx`에서 상태와 API 호출을 연결하고 전체 레이아웃 조립
5. `App.jsx`에서 `<ChatWindow />` 렌더링, 기본 Vite 템플릿 마크업 제거
6. 백엔드(`python backend/main.py`)와 함께 실제로 메시지를 주고받으며 로딩/에러 케이스 수동 테스트
7. Context7 MCP 사용 지침
본 프로젝트의 코드 생성, 리팩터링, 오류 수정, 라이브러리 사용법 확인 시 VS Code MCP Servers에 설치된 Context7 MCP를 사용한다. 다음 라이브러리 또는 프레임워크를 사용할 때는 반드시 Context7 MCP로 최신 공식 문서와 코드 예제를 확인한 뒤 구현한다.
FastAPI, React, Vite, Ollama
## 8. 오류 기록 규칙

구현 중 오류(콘솔 에러, 빌드 실패, API 응답 오류 등)를 마주치면 그냥 고치고 넘어가지 않고, **원인과 의미를 `frontend/error/error_1.md` 파일로 남긴다.** 오류가 여러 건이면 `error_2.md`, `error_3.md`처럼 번호를 이어서 새 파일로 추가한다(기존 파일을 덮어쓰지 않는다).

각 파일은 아래 형식을 따른다.

```markdown
# error_1: <오류를 한 줄로 요약>

## 오류 메시지
(콘솔/터미널에 출력된 원문 그대로 붙여넣기)

## 발생 상황
- 어떤 동작을 하다가 발생했는지 (예: "전송 버튼 클릭 시", "npm run dev 실행 시")
- 관련 파일: `경로/파일명`

## 원인
왜 이 오류가 발생했는지 (스펙과 실제 코드의 불일치, 잘못된 필드명, 누락된 의존성 등 근본 원인)

## 의미
이 오류가 방치되면 어떤 문제로 이어지는지 (예: 특정 기능 동작 불가, 데이터 유실, 다른 컴포넌트에 영향)

## 해결 방법
실제로 어떻게 수정했는지, 수정 후 재현되지 않음을 어떻게 확인했는지
```

이 기록은 같은 실수를 반복하지 않기 위한 것이므로, "무엇을 고쳤다"보다 "왜 발생했고 무엇을 의미하는지"를 중심으로 작성한다.

## 9. 컴포넌트별 스타일

와이어프레임(`image.png`)의 색상·간격을 기준으로 한다. CSS는 컴포넌트마다 동일한 이름의 파일로 분리한다 (예: `ChatInput.jsx` ↔ `ChatInput.css`), 전역 값은 `index.css`의 CSS 변수로 관리해 색이 여러 파일에 흩어지지 않게 한다.

### 9.0 공통 디자인 토큰 (`src/index.css`)

```css
:root {
  --color-primary: #4f46e5;       /* 사용자 말풍선, 전송 버튼 */
  --color-bg-app: #f7f7fb;        /* 전체 배경 */
  --color-bg-sidebar: #f2f0fb;    /* 사이드바 배경 */
  --color-bg-card: #ffffff;       /* 헤더/입력창/카드 배경 */
  --color-bg-assistant: #f5f5f7;  /* AI 말풍선 배경 */
  --color-border: #e5e5ec;        /* 기본 테두리 */
  --color-text: #1f2937;          /* 기본 텍스트 */
  --color-text-muted: #6b7280;    /* 보조 텍스트, placeholder */
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06);
  --font-base: "Pretendard", "Apple SD Gothic Neo", sans-serif;
}

body {
  margin: 0;
  font-family: var(--font-base);
  background: var(--color-bg-app);
  color: var(--color-text);
}
```

### 9.1 App / 전체 레이아웃

```css
.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}
```

### 9.2 `Sidebar.jsx` (`Sidebar.css`)

- 배경: `var(--color-bg-sidebar)`, `padding: 24px`
- 섹션 제목("모델 설정"): `font-size: 14px; font-weight: 600; margin-bottom: 20px;`
- 라벨("모델", "시스템 프롬프트", "Temperature: 0.7" 등): `font-size: 13px; color: var(--color-text-muted); margin-bottom: 6px;`
- `<select>`, `<textarea>`: 흰 배경, `border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 10px 12px; width: 100%;`
- `<input type="range">`: `accent-color: var(--color-primary);` (트랙 위 손잡이 색을 primary로)
- `<input type="number">`(Num Predict): select/textarea와 동일한 테두리·라운드 스타일
- 각 필드 사이 세로 간격: `margin-bottom: 24px;`

### 9.3 `ChatHeader.jsx` (`ChatHeader.css`)

- `background: var(--color-bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;`
- 제목: `font-size: 20px; font-weight: 700;`
- 부제목: `font-size: 13px; color: var(--color-text-muted); margin-top: 4px;`
- "대화 초기화" 버튼: `background: #fff; border: 1px solid var(--color-border); border-radius: 999px; padding: 8px 16px; font-size: 13px; cursor: pointer;` / `:hover { background: #f5f5f7; }`

### 9.4 `MessageList.jsx` (`MessageList.css`)

- `display: flex; flex-direction: column; gap: 16px; padding: 24px; overflow-y: auto; flex: 1;`

### 9.5 `MessageBubble.jsx` (`MessageBubble.css`)

공통: `padding: 12px 16px; max-width: 70%; font-size: 14px; line-height: 1.5;`

- `.bubble-user`: `align-self: flex-end; background: var(--color-primary); color: #fff; border-radius: var(--radius-lg) var(--radius-lg) 4px var(--radius-lg);`
- `.bubble-assistant`: `align-self: flex-start; background: var(--color-bg-assistant); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px;`
- `.bubble-elapsed`(응답 시간 표시): `font-size: 11px; color: var(--color-text-muted); margin-top: 6px;`

### 9.6 `ChatInput.jsx` (`ChatInput.css`)

- 컨테이너: `display: flex; gap: 12px; padding: 16px 24px; background: var(--color-bg-card); border-top: 1px solid var(--color-border);`
- `<textarea>`: `flex: 1; resize: none; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px 16px; font-size: 14px;` / `:disabled { background: var(--color-bg-assistant); color: var(--color-text-muted); }`
- 전송 버튼: `background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); padding: 0 20px; font-size: 14px; cursor: pointer;`
- 전송 버튼 비활성(로딩 중이거나 빈 입력): `background: var(--color-bg-assistant); color: var(--color-text-muted); cursor: not-allowed;` — 와이어프레임의 "응답 생성 중..." 상태와 동일한 톤

이 스타일 값들은 시작점이며, 실제 구현 중 와이어프레임과 다르게 보이면 수치를 조정해도 된다. 다만 색상은 9.0의 CSS 변수만 참조하고 컴포넌트 파일에 직접 hex 값을 쓰지 않는다 (일관성 유지, 나중에 테마 변경 시 한 곳만 수정).
