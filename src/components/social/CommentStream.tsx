"use client";

import { useState } from "react";
import type { Comment } from "@/types";
import { shortenAddress, timeAgo } from "@/lib/format";

interface CommentStreamProps {
  comments: Comment[];
  tokenId: string;
}

export function CommentStream({ comments, tokenId }: CommentStreamProps) {
  const [newComment, setNewComment] = useState("");

  const getRoleBadge = (role: Comment["authorRole"]) => {
    switch (role) {
      case "dev":
        return (
          <span className="bg-neon text-void px-1.5 py-0.5 text-[10px] font-bold uppercase font-[family-name:var(--font-heading)]">
            DEV
          </span>
        );
      case "top_holder":
        return (
          <span className="bg-warn text-void px-1.5 py-0.5 text-[10px] font-bold uppercase font-[family-name:var(--font-heading)]">
            TOP HOLDER
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border-3 border-border">
      <div className="px-4 py-3 border-b-2 border-border flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase text-text-dim">
          Live Chat
        </h3>
        <span className="font-[family-name:var(--font-mono)] text-xs text-neon tabular-nums">
          {comments.length} messages
        </span>
      </div>

      {/* Comments List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
        {comments.map((comment) => (
          <div key={comment.id} className="px-4 py-3 hover:bg-void/30 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-[family-name:var(--font-mono)] text-xs text-neon">
                {shortenAddress(comment.authorAddress)}
              </span>
              {getRoleBadge(comment.authorRole)}
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim ml-auto">
                {timeAgo(comment.timestamp)}
              </span>
            </div>
            <p className="text-sm text-text leading-relaxed">
              {comment.content}
            </p>
            <div className="mt-1">
              <button className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim hover:text-neon transition-colors">
                &#9650; {comment.likes}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t-2 border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-void border-2 border-border focus:border-neon outline-none px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-text placeholder:text-text-dim/30"
          />
          <button className="brutal-btn bg-neon text-void font-[family-name:var(--font-heading)] font-bold text-xs uppercase px-4 py-2 border-2 border-neon hover:bg-neon/90 transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
