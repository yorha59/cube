
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Move, PieceState } from '../types';

interface AIHelperProps {
  currentMoves: Move[];
  pieces: PieceState[];
}

const AIHelper: React.FC<AIHelperProps> = ({ currentMoves, pieces }) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getHint = async () => {
    setLoading(true);
    setSuggestion(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stateSummary = pieces.map(p => `Pos:${p.position.join(',')} Top:${p.colors.top}`).slice(0, 15).join(';');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `作为一个三阶魔方专家，根据当前魔方状态的部分描述（${stateSummary}）以及最后执行的几步操作（${currentMoves.slice(-10).join(', ')}），给我一个接下来的解法思路或公式建议（20字以内，中文）。`,
        config: {
            systemInstruction: "你是一个专业的、极简主义的魔方教练。你只提供最关键的下一步建议。",
            temperature: 0.5,
        }
      });

      setSuggestion(response.text || "观察魔方，寻找十字。");
    } catch (error) {
      setSuggestion("连接 AI 失败。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-emerald-500/5 backdrop-blur-2xl rounded-[2rem] p-6 border border-emerald-500/20 shadow-2xl max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AI Strategist</span>
        </div>
        <button 
          onClick={getHint}
          disabled={loading}
          className="text-[10px] bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-tighter transition-all"
        >
          {loading ? 'Analyzing...' : 'Get Strategy'}
        </button>
      </div>
      
      <div className="min-h-[60px] flex items-center bg-black/20 rounded-2xl p-4 border border-white/5">
        {suggestion ? (
          <p className="text-sm text-emerald-100/80 leading-relaxed font-medium italic">
            "{suggestion}"
          </p>
        ) : (
          <p className="text-xs text-gray-500 font-medium">
            等待分析指令... 也可以使用键盘 <span className="text-gray-400 font-bold">U/D/L/R/F/B</span> 直接操控。
          </p>
        )}
      </div>
    </div>
  );
};

export default AIHelper;
