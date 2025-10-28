// src/api/commentsAPI.js
import axios from "axios";

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const COMMENTS_TABLE = import.meta.env.VITE_AIRTABLE_COMMENTS_TABLE;
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${COMMENTS_TABLE}`;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// Fetch all comments for a product
export const fetchComments = async (productId) => {
  const filter = encodeURIComponent(`{product_id}='${productId}'`);
  const res = await axios.get(`${AIRTABLE_URL}?filterByFormula=${filter}`, { headers });
  return res.data.records.map((r) => ({
    id: r.id,
    ...r.fields,
  }));
};

// Add a comment
export const addComment = async (productId, userId, content) => {
  const payload = {
    records: [
      {
        fields: {
          product_id: productId,
          user_id: userId,
          content: content,
        },
      },
    ],
  };

  const res = await axios.post(AIRTABLE_URL, payload, { headers });
  return res.data.records[0];
};
