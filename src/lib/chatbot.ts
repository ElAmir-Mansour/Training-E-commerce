import { supabase } from "@/integrations/supabase/client";

export const fetchChatbotKnowledge = async () => {
  const { data, error } = await supabase
    .from('chatbot_knowledge')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addChatbotKnowledge = async (knowledge: {
  title: string;
  content: string;
  category: string;
  is_active?: boolean;
}) => {
  const { error } = await supabase
    .from('chatbot_knowledge')
    .insert([knowledge]);
  
  if (error) throw error;
};

export const updateChatbotKnowledge = async (
  id: string,
  updates: {
    title?: string;
    content?: string;
    category?: string;
    is_active?: boolean;
  }
) => {
  const { error } = await supabase
    .from('chatbot_knowledge')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteChatbotKnowledge = async (id: string) => {
  const { error } = await supabase
    .from('chatbot_knowledge')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

type Message = { role: "user" | "assistant"; content: string };

export async function streamChatbot({
  messages,
  onDelta,
  onDone,
}: {
  messages: Message[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
}) {
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`;

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    if (resp.status === 429) {
      throw new Error("تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً");
    }
    if (resp.status === 402) {
      throw new Error("خطأ في الدفع، يرجى التواصل مع الإدارة");
    }
    throw new Error("فشل بدء المحادثة");
  }

  if (!resp.body) throw new Error("فشل بدء المحادثة");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
