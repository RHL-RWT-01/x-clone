import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { IoMdChatbubbles, IoMdClose } from "react-icons/io";
import { FiSend, FiRefreshCcw, FiLoader } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RightPanelChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! 👋 Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const containerRef = useRef(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (userInput) => {
      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, mode: "chat" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed");
      return data.response;
    },
    onSuccess: (botResponse) => {
      setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Something went wrong." },
      ]);
    },
  });

  // Send handler
  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const toSend = input;
    setInput("");
    mutate(toSend);
  };

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  return (
    <div className="fixed bottom-5 right-5 z-60">
      {!open && (
        <button
          className="bg-blue-950 text-white p-3 rounded-xl shadow-lg hover:scale-140 transition border border-gray-700 flex items-center justify-center"
          onClick={() => setOpen(true)}
          title="Open Grok"
        >
          <IoMdChatbubbles size={26} />
        </button>
      )}

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
                onClick={() =>
                  setMessages([
                    { from: "bot", text: "Hi there! 👋 Ask me anything." },
                  ])
                }
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
            {isPending && (
              <p className="text-gray-500 text-xs flex items-center gap-2 animate-pulse">
                <FiLoader className="animate-spin" /> Grok is thinking…
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
                disabled={isPending}
              />
              <button
                onClick={handleSend}
                disabled={isPending}
                className={`px-3 py-2 rounded-md text-white flex items-center gap-1 ${
                  isPending
                    ? "bg-blue-900 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
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
