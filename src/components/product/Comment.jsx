import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

const Comments = ({ productId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    if (!productId) return;
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
      return;
    }

    setComments(data);
  };

  const addComment = async () => {
    if (!user) return alert("Login to comment");
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        product_id: productId,
        user_id: user.id,
        content: newComment,
      })
      .select(); // return inserted row

    if (error) {
      console.error("Error adding comment:", error);
    } else {
      setComments((prev) => [data[0], ...prev]); // show instantly
      setNewComment("");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  return (
    <div>
      <h3>Comments</h3>
      {user && (
        <div>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={addComment}>Add</button>
        </div>
      )}
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <strong>{c.user_id}</strong> —{" "}
            {new Date(c.created_at).toLocaleString()}
            <p>{c.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;
