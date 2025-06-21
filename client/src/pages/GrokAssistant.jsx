import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { FiLoader, FiSend } from "react-icons/fi";

const GrokAssistant = ({ post }) => {
  const [query, setQuery] = useState("Explain this post");
  const [response, setResponse] = useState("");
  const [cutoff, setCutoff] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Post: """${post.text}"""\n\nQuestion: ${query}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed");
      return data;
    },
    onSuccess: (data) => {
      setResponse(data.response);
      setCutoff(data.cutoff);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <>
      <button
        onClick={() =>
          document.getElementById(`ai_modal_${post._id}`).showModal()
        }
        className="text-sm text-blue-500 hover:text-blue-400 mt-2 flex items-center gap-1 transition"
      >
        <RiRobot2Fill className="text-blue-500" />
        Ask AI
      </button>

      <dialog id={`ai_modal_${post._id}`} className="modal">
        <div className="modal-box bg-[#0f0f0f] border border-gray-700 text-white rounded-xl max-w-xl w-full shadow-2xl relative">
          {/* Close Button */}
          <form method="dialog">
            <button
              className="absolute right-3 top-3 text-xl text-gray-500 hover:text-red-400 transition"
              aria-label="Close"
              type="submit"
            >
              &times;
            </button>
          </form>

          {/* Header */}
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <RiRobot2Fill size={20} className="text-blue-700" />
            Grok
          </h3>

          {/* Textarea for query */}
          <textarea
            className="textarea w-full text-sm p-2 bg-[#1a1a1a] border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-600"
            rows={3}
            placeholder="Ask something about this post..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          ></textarea>

          {/* Ask Button */}
          <button
            onClick={() => mutate()}
            className={`mt-3 btn btn-sm flex items-center gap-2 px-4 py-2 rounded-full text-white ${
              isPending
                ? "bg-blue-900 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <FiLoader className="animate-spin" /> Thinking...
              </>
            ) : (
              <>
                <FiSend size={14} /> Ask
              </>
            )}
          </button>

          {/* Response Box */}
          {response && (
            <div className="mt-5 p-3 bg-[#1a1a1a] rounded-md text-sm border border-gray-700 max-h-60 overflow-y-auto space-y-2">
              <p>{response}</p>
              {cutoff && (
                <p className="text-yellow-400 text-xs mt-2">
                  ⚠️ Response may be incomplete.
                </p>
              )}
            </div>
          )}

          {/* Modal backdrop */}
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default GrokAssistant;
