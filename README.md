<div align="center">
  <br />
  <h1>⚖️ Lex-Link</h1>
  <p>
    <strong>AI 기반 금융/IT 규제 컴플라이언스 통합 대시보드 (Reg-Tech)</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
    <img src="https://img.shields.io/badge/Gemini_AI-1A73E8?style=for-the-badge&logo=google&logoColor=white" />
  </p>
</div>

<br />

## 📖 프로젝트 취지 (Motivation)

**Lex-Link**는 "금융기관 규제 담당자", "IT 보안/CISO 담당자", "컴플라이언스 부서" 등을 위해 설계된 최첨단 **레그테크(Reg-Tech) 솔루션**입니다.

기존 금융사 및 빅테크 기업의 규제 담당자들은 수백 페이지에 달하는 **[외부 법률 및 가이드라인]**과 회사 내부의 **[내규 지침]** 간의 정합성(Gap)을 찾기 위해 방대한 문서들을 수동으로 비교하고 검증해야만 했습니다. 이로 인해 컴플라이언스 준수 비용이 늘어나고, 법률 개정(예: 망분리 완화 가이드라인 도입 등)에 발 빠르게 대응하지 못하는 문제점이 있었습니다.

Lex-Link는 **대규모 언어 모델(Gemini 2.5 AI)과 다이어그램 매핑 UI**를 통해 이 과정을 파격적으로 자동화합니다. 외부 규제와 내부 지침의 상호 참조 관계를 시각적으로 한눈에 파악하고, 단 한 번의 드롭으로 최신 규율과의 법률적 Gap을 실시간으로 분석하여 **자동으로 내부 지침 수정안(Redlining)을 권고**해 줍니다. 


## ✨ 핵심 기능 (Key Features)

- **🕸️ 인터랙티브 규제 매핑 다이어그램 (`React Flow`)**
  - 복잡한 최신 외부 전자금융 법률(망분리, 개인정보보호법 등)과 내부 사내 규정 간의 연결을 `Node & Edge`로 1:N 시각화하여 구조적 파악을 돕습니다.
- **🤖 실시간 AI Gap 분석 및 Redlining 권고안 (`Gemini AI`)**
  - 업로드된 내부 문서와 외부 규정을 스트리밍으로 상호 대조하며, 규제 위반 소지가 있는 항목을 적발(Gap Found)하고 적법한 "조항 수정 제안서(To-Be)"를 작성합니다.
- **🛡️ 엔터프라이즈급 리뷰 모달 및 결재 플로우**
  - 관리자가 AI의 수정안을 검토 후 **[승인/반려]** 할 수 있는 승인 파이프라인 기능과 전체 화면 포커스 모드를 지원하여 CISA 관점의 추적성을 보장합니다.
- **📊 동적 컴플라이언스 스코어 (`Tremor UI`)**
  - 발견된 위반 및 조치 상태를 기반으로 사내 규정 준수율 점수(Compliance Score)를 동적으로 스코어링하여 경영진의 직관적인 의사결정을 돕습니다.
- **💾 클라이언트 무손실 상태 스토리지 복원**
  - Redux 기반의 `Store Subscribe` 캐싱을 통해 브라우저 `LocalStorage`에 실시간으로 분석 리포트가 안전하게 저장되어, 오프라인 및 새로고침 환경에서도 작업하던 대시보드를 즉시 복원합니다.


## 🛠 기술 스택 (Tech Stack)

### Frontend Layer
- **Framework**: React 18, Vite
- **TypeScript**: 정적 타입 검증 및 안정성 높은 코드 설계
- **State Management**: Redux Toolkit (RTK)
- **Routing & Networking**: `@google/generative-ai` (Gemini API Streaming SDK)

### UI / UX / Visualization
- **React Flow**: 규제 노드 간의 동적 맵 다이어그램 엔진
- **Tailwind CSS**: 유틸리티 기반의 세밀하고 반응형인 레이아웃 및 애니메이션
- **Tremor v3**: 금융/엔터프라이즈용 인사이트 대시보드 컴포넌트 라이브러리

### Architecture
- 망분리가 필수적인 엔터프라이즈 환경 및 높은 보안 수준을 고려하여 민감 정보 관리는 클라이언트 `LocalStorage`를 활용하고 프론트엔드 레벨에서의 보안 샌드박싱 처리를 고려하였습니다.


## 🚀 설치 및 실행 방법 (Installation & Getting Started)

사전에 `Node.js` (버전 18 이상 권장)가 설치되어 있어야 합니다.

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/Lex-Link.git
cd Lex-Link

# 2. 패키지 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

터미널에 노출되는 `http://localhost:5173/` (또는 5174)로 접속하시면 즉시 프로젝트를 확인하실 수 있습니다.


## 💡 데모 시연 프로세스 (How to Use)
1. **파일 업로드**: 좌측 드롭존을 이용해 모의 `Sample_Internal_Guideline.txt` 파일을 업로드합니다.
2. **AI 분석 시작**: 우측 상단의 `[AI Gap 분석 시작]` 버튼을 누릅니다.
3. **글로벌 로딩**: 전체 화면 분석 스크린이 가동되며 방대한 데이터 간의 매핑을 실시간 진행합니다.
4. **결과 확인**: 위반이 적발된 내부 규정 노드(붉은색 점멸)를 클릭하면 전체화면 모달이 열립니다.
5. **승인 및 점수 조율**: AI가 제안해 주는 조항 수정 제안서를 읽고 `[수정안 승인]` 처리를 완료하면 기업의 전체 Compliance Score가 상승합니다.

---

> 본 저장소에는 네트워크 통신 없이 로컬 프리젠테이션 환경에서 결과를 보여주기 위한 단일 HTML 데모 구동 파일인 **`offline_demo.html`** 도 함께 포함되어 있습니다. (발표, 공모전 등 제출용)
