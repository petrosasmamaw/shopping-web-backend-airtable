import React, { useState, useEffect } from "react";
import { fetchComments, addComment } from "./commentsAPI";

const Comments = ({ productId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchComments(productId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleAddComment = async () => {
    if (!user) return alert("Please login to comment");
    if (!newComment.trim()) return;

    const newRec = await addComment(productId, user.id, newComment);
    setComments((prev) => [newRec, ...prev]);
    setNewComment("");
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Comments</h3>

      {user && (
        <div>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={handleAddComment}>Add</button>
        </div>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length > 0 ? (
        <ul>
          {comments.map((c) => (
            <li key={c.id}>
              <strong>{c.fields?.user_id}</strong> — {c.fields?.created_at || ""}
              <p>{c.fields?.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export default Comments;
