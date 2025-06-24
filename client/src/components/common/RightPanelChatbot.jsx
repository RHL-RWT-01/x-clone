import { useState, useRef, useEffect } from "react";
import { IoMdChatbubbles, IoMdClose } from "react-icons/io";
import { FiSend, FiRefreshCcw } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const RightPanelChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! 👋 Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="fixed bottom-5 right-5 z-60">
      {/* Toggle Button */}
      {!open && (
        <button
          className="bg-blue-950 text-white p-3 rounded-xl shadow-lg hover:scale-140 transition border-spacing-2 border border-gray-700 flex items-center justify-center"
          onClick={() => setOpen(true)}
          title="Open Grok"
        >
          <IoMdChatbubbles size={26} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="w-[400px] h-[480px] bg-[#0f0f0f] text-white rounded-xl shadow-xl border border-gray-700 flex flex-col animate-slideUp backdrop-blur-md">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <FaRobot size={18} />
              Grok
            </h2>
            <div className="flex gap-3 text-gray-400">
              <button
                onClick={() => setMessages([])}
                className="hover:text-white"
                title="Reset"
              >
                <FiRefreshCcw size={18} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="hover:text-white"
                title="Close"
              >
                <IoMdClose size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-600"
            ref={containerRef}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  msg.from === "user"
                    ? "bg-blue-600 text-white self-end ml-auto"
                    : "bg-gray-800 text-white self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <p className="text-gray-500 text-xs animate-pulse">
                Grok is thinking…
              </p>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-[#111]">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 px-3 py-2 bg-[#1a1a1a] text-white rounded-md border border-gray-600 outline-none text-sm"
                placeholder="Type your question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white flex items-center gap-1"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanelChatbot;
