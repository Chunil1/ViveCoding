import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with a key, which can be passed from the UI
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string = '';

  setApiKey(key: string) {
    // API keys should only contain standard ASCII characters. Remove hidden unicode or whitespace string to prevent Headers.append TypeError.
    this.apiKey = key.trim().replace(/[^\x20-\x7E]/g, '');
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  hasApiKey() {
    return !!this.apiKey;
  }

  async *streamComplianceCheck(externalRule: string, internalGuideline: string) {
    if (!this.genAI) {
      throw new Error("API Key is not set.");
    }

    // Use the universally supported gemini-pro (1.0) model due to 404 fallback issues
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
당신은 금융 규제 및 IT 보안 거버넌스 전문가인 레그테크(Reg-Tech) 어시스턴트입니다.
다음 두 문서를 비교하여 내부 지침에서 빠지거나 틀린 부분을 찾고, 반영해야 할 수정안(Redlining)을 한국어로 제안해주세요.
최종 사용자는 비개발자인 '금융기관 규제 담당자'이므로, 지나치게 기술적인 용어보다는 직관적이고 명확하게 요약해서 알려주세요.

# 외부 규제 (기준)
${externalRule}

# 업로드된 내부 시스템 규정 (검토 대상)
${internalGuideline}

결과는 다음 형식을 바탕으로, 친절하게 설명하며 수정안을 제안해주세요. 불필요한 인사말은 생략하세요.
`;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      try {
        const chunkText = chunk.text();
        if (chunkText) yield chunkText;
      } catch (e) {
        console.warn("Error parsing chunk text, possibly safety blocked:", e);
      }
    }
  }
}

export const geminiService = new GeminiService();
