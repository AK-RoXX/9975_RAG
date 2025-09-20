import React, { useState } from "react";

function App() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  // Handle multiple file selection
  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  // Upload multiple files
  const handleUpload = async () => {
    if (!files.length) {
      setMessage("Please select at least one file first");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Uploaded ${data.files.length} file(s) successfully!`);
        setFiles([]); // Clear file selection
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // Send chat question to backend
  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: "user", text: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsChatting(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: chatInput }),
      });

      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.answer || "Sorry, I couldn't find an answer.",
        source: data.source || "unknown"
      };

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Chat request failed.", source: "error" },
      ]);
    }

    setChatInput("");
    setIsChatting(false);
  };

  // Handle Enter key in chat input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ 
        maxWidth: "1000px", 
        margin: "auto",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "30px",
          textAlign: "center"
        }}>
          <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "300" }}>
            🤖 RAG Chatbot
          </h1>
          <p style={{ margin: "10px 0 0 0", opacity: 0.9, fontSize: "1.1rem" }}>
            Your Ai assistant that combines uploaded documents with Gemini's knowledge.
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: "30px" }}>
          
          {/* Upload Section */}
          <div style={{
            background: "#f8f9fa",
            padding: "25px",
            borderRadius: "15px",
            marginBottom: "30px",
            border: "2px dashed #dee2e6"
          }}>
            <h2 style={{ 
              margin: "0 0 20px 0", 
              color: "#495057",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              📁 Upload Files for RAG
            </h2>
            
            <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                className="file-input"
                style={{
                  padding: "12px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  flex: "1",
                  minWidth: "200px"
                }}
              />
              <button 
                onClick={handleUpload}
                disabled={isUploading || !files.length}
                className="upload-btn"
                style={{
                  padding: "12px 24px",
                  background: isUploading ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isUploading || !files.length ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
              >
                {isUploading ? "⏳ Uploading..." : "🚀 Upload"}
              </button>
            </div>
            
            {message && (
              <div style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "8px",
                background: message.includes("✅") ? "#d4edda" : "#f8d7da",
                color: message.includes("✅") ? "#155724" : "#721c24",
                border: `1px solid ${message.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`
              }}>
                {message}
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div>
            <h2 style={{ 
              margin: "0 0 20px 0", 
              color: "#495057",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              💬 Chat with RAG Bot
            </h2>
            
            {/* Info Box */}
            <div style={{ 
              background: "#e3f2fd", 
              padding: "15px", 
              borderRadius: "10px", 
              marginBottom: "20px",
              border: "1px solid #bbdefb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>ℹ️</span>
                <div>
                  <strong>How it works:</strong> This RAG system combines uploaded documents with Gemini's knowledge. 
                  When you ask questions, it first searches your uploaded files, then enhances answers with Gemini's knowledge.
                </div>
              </div>
            </div>

            {/* Chat Window */}
            <div 
              className="chat-window"
              style={{
                border: "2px solid #e9ecef",
                borderRadius: "15px",
                height: "400px",
                overflowY: "auto",
                marginBottom: "20px",
                background: "#fafafa",
                padding: "20px"
              }}
            >
              {chatHistory.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  color: "#6c757d",
                  marginTop: "150px",
                  fontSize: "1.1rem"
                }}>
                  👋 Start a conversation by asking a question!
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className="chat-bubble"
                    style={{
                      margin: "15px 0",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
                    }}>
                      <div style={{
                        maxWidth: "70%",
                        padding: "15px 20px",
                        borderRadius: "20px",
                        background: msg.sender === "user" ? "#007bff" : "#e9ecef",
                        color: msg.sender === "user" ? "white" : "#495057",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                      }}>
                        <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                          {msg.sender === "user" ? "You" : "Bot"}
                        </div>
                        <div style={{ lineHeight: "1.5" }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                    
                    {msg.sender === "bot" && msg.source && (
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#6c757d", 
                        marginTop: "5px",
                        marginLeft: "20px"
                      }}>
                        💡 Source: {msg.source === "uploaded documents + Gemini knowledge" ? 
                          "📚 Uploaded documents + 🤖 Gemini knowledge" : 
                          msg.source === "Gemini knowledge only" ? 
                          "🤖 Gemini knowledge only" : 
                          msg.source}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  style={{ 
                    width: "100%",
                    padding: "15px",
                    border: "2px solid #e9ecef",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    resize: "vertical",
                    minHeight: "60px",
                    fontFamily: "inherit"
                  }}
                />
              </div>
              <button 
                onClick={handleChat}
                disabled={isChatting || !chatInput.trim()}
                className="send-btn"
                style={{
                  padding: "15px 30px",
                  background: isChatting || !chatInput.trim() ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: isChatting || !chatInput.trim() ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                  transition: "all 0.3s ease"
                }}
              >
                {isChatting ? "⏳ Thinking..." : "💬 Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
