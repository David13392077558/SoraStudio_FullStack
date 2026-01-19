import { useState } from "react";
import { generatePrompt } from "../api/gemini";

export default function SoraPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const result = await generatePrompt(
      `请为 Sora 生成一个视频提示词，要求：${input}`
    );
    setOutput(result);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Sora 视频提示词生成器</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="例如：生成一个未来城市、赛博朋克风格的视频"
        style={{ width: "100%", height: 120 }}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "生成中..." : "生成提示词"}
      </button>

      {output && (
        <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{output}</pre>
      )}
    </div>
  );
}