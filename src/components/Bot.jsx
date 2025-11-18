import React, { useState, useRef, useEffect } from "react";
import "./chatbot.css";
import { v4 as uuidv4 } from "uuid";

const API_URL = "https://api-bot.writesonic.com/v1/botsonic/generate";
const TOKEN = "f6fa851c-dd85-4825-9cc2-86cdf3330444";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatBoxRef = useRef(null);

  const chatIdRef = useRef(uuidv4());

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    addMessage(userMsg, "user");
    setInput("");

    // 🔵 BOT TYPING INDICATOR
    setIsTyping(true);
    const typingId = uuidv4();
    addMessage("Bot is typing...", "typing");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          token: TOKEN,
        },
        body: JSON.stringify({
          input_text: userMsg,
          chat_id: chatIdRef.current,
        }),
      });

      const data = await response.json();
      const botReply = data.answer || "No response";

      // 🟢 Remove typing message
      setMessages((prev) =>
        prev.filter((msg) => msg.sender !== "typing")
      );

      // 🟢 Add real bot message
      addMessage(botReply, "bot");
    } catch (error) {
      console.error(error);

      setMessages((prev) =>
        prev.filter((msg) => msg.sender !== "typing")
      );
      addMessage("Error contacting API", "bot");
    }

    setIsTyping(false);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="upper" style={{height:showChat?"600px":"auto"}}>
      {showChat ? (
        <div className="chat-container">
          <div className="chat-header">
            ChatBot
            <span
              style={{ float: "right", cursor: "pointer" }}
              onClick={() => setShowChat(false)}
            >
              ✕
            </span>
          </div>

          <div className="chat-box" ref={chatBoxRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.sender === "typing" ? "typing-msg" : msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleEnter}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      ) : (
        <div
          className="chat-launcher"
          onClick={() => setShowChat(true)}
        >
          <img
            src="https://writesonic-frontend.s3.us-east-1.amazonaws.com/frontend-assets/templates-new/BotsonicNew.png"
            alt="Open Chat"
            className="launcher-icon"
          />
        </div>
      )}
    </div>
  );
}
