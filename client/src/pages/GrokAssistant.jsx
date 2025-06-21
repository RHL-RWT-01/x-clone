import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";

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
        onClick={() => document.getElementById(`ai_modal_${post._id}`).showModal()}
        className="text-sm text-blue-500 hover:underline mt-2 flex items-center gap-1"
      >
        <RiRobot2Fill className="text-blue-500" /> Ask AI
      </button>

      <dialog id={`ai_modal_${post._id}`} className="modal">
        <div className="modal-box bg-base-100 border border-gray-700 rounded relative">
          <form method="dialog">
            <button
              className="absolute right-2 top-2 text-xl text-gray-400 hover:text-gray-700"
              aria-label="Close"
              type="submit"
            >
              &times;
            </button>
          </form>
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <RiRobot2Fill /> Grok Assistant
          </h3>

          <textarea
            className="textarea textarea-bordered w-full mb-2 text-sm"
            rows={3}
            placeholder="Ask something about this post..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          ></textarea>

          <button
            className="btn btn-primary btn-sm rounded-full"
            disabled={isPending}
            onClick={() => mutate()}
          >
            {isPending ? "Thinking..." : "Ask"}
          </button>

          {response && (
            <div className="mt-4 text-sm whitespace-pre-wrap border-t pt-2 border-gray-600">
              {response}
              {cutoff && (
                <p className="text-warning mt-2">⚠️ Response may be incomplete.</p>
              )}
            </div>
          )}

          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default GrokAssistant;
