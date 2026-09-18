import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ThumbsUp, Heart, Sparkles, Laugh, MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { productCommentApi } from "@/api/productComment.api";
import { useAuth } from "@/context/AuthContext";
import { timeAgo, cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const REACTIONS = [
  { key: "like", icon: ThumbsUp, color: "text-blue-500" },
  { key: "love", icon: Heart, color: "text-red-500" },
  { key: "helpful", icon: Sparkles, color: "text-amber-500" },
  { key: "funny", icon: Laugh, color: "text-emerald-500" },
];

export function CommentSection({ productId }) {
  const { user, isAuthenticated, role, openAuthModal } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // load comments
  const load = async () => {
    setLoading(true);

    try {
      const { data } = await productCommentApi.getComments(productId, { limit: 20 });
      setComments(data.comments || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [productId]);

  // post comment
  const handlePost = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (role !== "buyer") {
      toast.error("Only buyers can post comments");
      return;
    }

    if (!text.trim()) return;

    setPosting(true);

    try {
      const { data } = await productCommentApi.createComment(productId, text.trim());
      setComments((prev) => [data.comment, ...prev]);
      setText("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not post comment");
    } finally {
      setPosting(false);
    }
  };

  // react to comment
  const handleReact = async (commentId, reaction) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    try {
      const { data } = await productCommentApi.react(productId, commentId, reaction);
      setComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, reactions: data.reactions || c.reactions } : c)));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not react");
    }
  };

  // delete comment
  const handleDelete = async (commentId) => {
    try {
      await productCommentApi.deleteComment(productId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not delete comment");
    }
  };

  return (
    <div>
      {/* comment input */}
      <div className="mb-6 flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user?.profilePicture?.url} />
          <AvatarFallback>{user?.fullName?.[0] || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea placeholder={isAuthenticated ? "Share your thoughts about this product..." : "Login to join the discussion"} value={text} onChange={(e) => setText(e.target.value)} rows={2} />

          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={handlePost} disabled={posting || !text.trim()}>
              <Send size={14} /> Post
            </Button>
          </div>
        </div>
      </div>

      {/* comments */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={c.buyer?.profilePicture?.url || c.buyer?.profileImage?.url} />
                <AvatarFallback>{c.buyer?.fullName?.[0] || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 rounded-2xl bg-secondary/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{c.buyer?.fullName || "Buyer"}</span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>

                    {user?._id === c.buyer?._id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={14} /></button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(c._id)} className="text-red-600">
                            <Trash2 size={14} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <p className="mt-1 text-sm text-foreground/90">{c.comment}</p>

                {/* reactions */}
                <div className="mt-2 flex gap-3">
                  {REACTIONS.map(({ key, icon: Icon, color }) => (
                    <button key={key} onClick={() => handleReact(c._id, key)} className={cn("flex items-center gap-1 text-xs font-medium text-muted-foreground transition-transform hover:scale-110", color)}>
                      <Icon size={13} /> {c.reactions?.[key] || 0}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && comments.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No comments yet. Start the conversation!</p>
        )}
      </div>
    </div>
  );
}