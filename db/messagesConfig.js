import pool from "./pool.js";

async function addMessage(message, title, user_id) {
  await pool.query(
    "INSERT INTO messages (user_id, title, text) VALUES($1, $2, $3)",
    [user_id, title, message]
  );
}

async function getMessages() {
  const { rows } = await pool.query(
    'SELECT messages.*, "members-only"."full-name" AS author_name FROM messages JOIN "members-only" ON messages.user_id = "members-only".id ORDER BY timestamp DESC'
  );
  return rows;
}

async function deleteMessage(id) {
  await pool.query("DELETE FROM messages WHERE id = $1", [id]);
}

export { addMessage, getMessages, deleteMessage };
