import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatbotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Chatbot = ({ isOpen, setIsOpen }: ChatbotProps) => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً! كيف يمكنني مساعدتك اليوم؟" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "ما هي الدورات المتاحة؟",
    "كيف أسجل في دورة؟",
    "هل الدورات مجانية؟",
    "كيف أحصل على الشهادة؟",
    "كيف أتواصل معكم؟"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setShowQuickQuestions(false);
    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok || !response.body) {
        throw new Error("فشل الاتصال بالخادم");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      // Add assistant message placeholder
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
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
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent
                };
                return newMessages;
              });
            }
          } catch {
            continue;
          }
        }
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[9998]"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bg-background border shadow-xl z-[9999] flex flex-col ${
          isMobile 
            ? "inset-4 rounded-lg" 
            : "bottom-6 right-6 w-96 h-[500px] rounded-lg"
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-semibold">مساعد المنصة</h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 pr-6 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-4">
              {/* Quick Questions */}
              {showQuickQuestions && messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center mb-3">أسئلة شائعة:</p>
                  {quickQuestions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full text-right justify-start text-sm"
                      onClick={() => sendMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end pl-4" : "justify-start pr-4"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start pr-4">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <p className="text-sm">جاري الكتابة...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="اكتب رسالتك..."
                disabled={isLoading}
                className="flex-1 text-right pr-5"
                dir="rtl"
              />
              <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
