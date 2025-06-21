import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import GrokAssistant from "../../pages/GrokAssistant";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const postOwner = post.user;
  const isLiked = post.likes.includes(authUser._id);

  const isMyPost = authUser._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt);

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      // this is not the best UX, bc it will refetch all posts
      // queryClient.invalidateQueries({ queryKey: ["posts"] });

      // instead, update the cache directly for that post
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      {/* Avatar */}
      <div className="avatar">
        <Link
          to={`/profile/${postOwner.username}`}
          className="w-8 rounded-full overflow-hidden"
        >
          <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
        </Link>
      </div>

      {/* Post Content */}
      <div className="flex flex-col flex-1">
        {/* User Info */}
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${postOwner.username}`} className="font-bold">
            {postOwner.fullName}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner.username}`}>
              @{postOwner.username}
            </Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isDeleting ? (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              ) : (
                <LoadingSpinner size="sm" />
              )}
            </span>
          )}
        </div>

        {/* Text and Image */}
        <div className="flex flex-col gap-3 overflow-hidden mt-2">
          <span>{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              alt="post"
              className="h-80 object-contain rounded-lg border border-gray-700"
            />
          )}
        </div>

        {/* Action Bar */}
        <div className="flex justify-between mt-4 text-slate-500">
          {/* Comment */}
          <div
            className="flex-1 flex items-center justify-center gap-1 cursor-pointer group"
            onClick={() =>
              document.getElementById(`comments_modal${post._id}`).showModal()
            }
          >
            <FaRegComment className="w-4 h-4 group-hover:text-sky-400" />
            <span className="text-sm group-hover:text-sky-400">
              {post.comments.length}
            </span>
          </div>

          {/* Repost */}
          <div className="flex-1 flex items-center justify-center gap-1 cursor-pointer group">
            <BiRepost className="w-5 h-5 group-hover:text-green-500" />
            <span className="text-sm group-hover:text-green-500">0</span>
          </div>

          {/* Like */}
          <div
            className="flex-1 flex items-center justify-center gap-1 cursor-pointer group"
            onClick={handleLikePost}
          >
            {isLiking ? (
              <LoadingSpinner size="sm" />
            ) : isLiked ? (
              <FaRegHeart className="w-4 h-4 text-pink-500" />
            ) : (
              <FaRegHeart className="w-4 h-4 group-hover:text-pink-500" />
            )}
            <span
              className={`text-sm ${
                isLiked ? "text-pink-500" : "text-slate-500"
              } group-hover:text-pink-500`}
            >
              {post.likes.length}
            </span>
          </div>

          {/* Bookmark */}
          <div className="flex-1 flex items-center justify-center gap-1 cursor-pointer group">
            <FaRegBookmark className="w-4 h-4 group-hover:text-yellow-400" />
          </div>

          {/* GrokAssistant */}
          <div className="flex-1 flex items-center justify-center gap-1">
            <GrokAssistant post={post} />
          </div>
        </div>

        {/* Comments Modal */}
        <dialog id={`comments_modal${post._id}`} className="modal">
          <div className="modal-box border border-gray-600 rounded">
            <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
            <div className="flex flex-col gap-3 max-h-60 overflow-auto">
              {post.comments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No comments yet 🤔 Be the first one 😉
                </p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2 items-start">
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={
                            comment.user.profileImg || "/avatar-placeholder.png"
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-bold">
                          {comment.user.fullName}
                        </span>
                        <span className="text-gray-700 text-sm">
                          @{comment.user.username}
                        </span>
                      </div>
                      <div className="text-sm">{comment.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment input */}
            <form
              className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
              onSubmit={handlePostComment}
            >
              <textarea
                className="textarea w-full p-1 rounded text-md resize-none border border-gray-800 focus:outline-none"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
              </button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button className="outline-none">close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
};

export default Post;
