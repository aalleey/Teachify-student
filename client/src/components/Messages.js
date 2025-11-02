import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI } from '../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import Card from './Card';

const Messages = ({ userRole }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastMessageTimestampRef = useRef(null);

  // Determine API base URL for Socket.IO
  const getSocketURL = () => {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    } else if (process.env.NODE_ENV === 'production') {
      return window.location.origin;
    } else {
      return 'http://localhost:5000';
    }
  };

  // REST API polling fallback when Socket.IO is not available
  const startRestApiPolling = useCallback(() => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll for new messages every 3 seconds when Socket.IO is not available
    pollingIntervalRef.current = setInterval(async () => {
      if (!selectedConversation || isSocketConnected) return;

      try {
        const response = await messagesAPI.getConversation(selectedConversation.userId);
        const newMessages = response.data.messages || [];
        
        // Check if there are new messages
        if (newMessages.length > 0) {
          const lastMessage = newMessages[newMessages.length - 1];
          const lastTimestamp = new Date(lastMessage.timestamp).getTime();
          
          // Only update if we have new messages
          if (!lastMessageTimestampRef.current || lastTimestamp > lastMessageTimestampRef.current) {
            setMessages(newMessages);
            lastMessageTimestampRef.current = lastTimestamp;
            
            // Also refresh conversations list
            messagesAPI.getConversations().then(convResponse => {
              setConversations(convResponse.data || []);
            }).catch(err => console.error('Error refreshing conversations:', err));
          }
        } else {
          setMessages(newMessages);
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 3000);
  }, [selectedConversation, isSocketConnected]);

  // Initialize Socket.IO connection with fallback to REST API
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socketURL = getSocketURL();
    let connectionTimeout;
    let socketConnected = false;

    // Try to connect with timeout
    const newSocket = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: false, // Disable auto-reconnect on Vercel to avoid spam
      forceNew: true
    });

    // Connection timeout - if not connected in 5 seconds, use REST API fallback
    connectionTimeout = setTimeout(() => {
      if (!socketConnected) {
        console.warn('⚠️ Socket.IO connection failed. Using REST API fallback.');
        newSocket.close();
        setIsSocketConnected(false);
        // Start REST API polling
        startRestApiPolling();
      }
    }, 5000);

    newSocket.on('connect', () => {
      socketConnected = true;
      clearTimeout(connectionTimeout);
      console.log('✅ Connected to Socket.IO server');
      setIsSocketConnected(true);
      // Stop REST API polling if it was running
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    });

    newSocket.on('connect_error', (error) => {
      console.warn('⚠️ Socket.IO connection error:', error.message);
      clearTimeout(connectionTimeout);
      setIsSocketConnected(false);
      newSocket.close();
      // Start REST API polling on error
      startRestApiPolling();
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setIsSocketConnected(false);
      // Start REST API polling on disconnect
      startRestApiPolling();
    });

    const handleReceiveMessage = (data) => {
      if (selectedConversation && 
          (data.message.senderId._id === selectedConversation.userId || 
           data.message.receiverId._id === selectedConversation.userId)) {
        setMessages(prev => [...prev, data.message]);
        // Mark as read
        newSocket.emit('mark_read', { senderId: data.message.senderId._id });
      }
      // Refresh conversations list to update last message
      messagesAPI.getConversations().then(response => {
        setConversations(response.data || []);
      }).catch(err => console.error('Error refreshing conversations:', err));
    };

    const handleMessageSent = (data) => {
      setMessages(prev => [...prev, data.message]);
    };

    const handleMessageError = (error) => {
      alert('Error: ' + (error.message || 'Failed to send message'));
    };

    const handleUserTyping = (data) => {
      if (selectedConversation && data.userId === selectedConversation.userId) {
        setIsTyping(data.isTyping);
        setTypingUser(data.userName);
      }
    };

    newSocket.on('receive_message', handleReceiveMessage);
    newSocket.on('message_sent', handleMessageSent);
    newSocket.on('message_error', handleMessageError);
    newSocket.on('user_typing', handleUserTyping);

    setSocket(newSocket);

    return () => {
      clearTimeout(connectionTimeout);
      newSocket.off('receive_message', handleReceiveMessage);
      newSocket.off('message_sent', handleMessageSent);
      newSocket.off('message_error', handleMessageError);
      newSocket.off('user_typing', handleUserTyping);
      newSocket.close();
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch teachers (for students)
  const fetchTeachers = useCallback(async () => {
    if (userRole !== 'student') return;
    
    try {
      const response = await messagesAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  }, [userRole]);

  // Load conversations and teachers on mount
  useEffect(() => {
    fetchConversations();
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      lastMessageTimestampRef.current = null;
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await messagesAPI.getConversation(selectedConversation.userId);
        const fetchedMessages = response.data.messages || [];
        setMessages(fetchedMessages);
        
        // Store last message timestamp for polling
        if (fetchedMessages.length > 0) {
          const lastMessage = fetchedMessages[fetchedMessages.length - 1];
          lastMessageTimestampRef.current = new Date(lastMessage.timestamp).getTime();
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Start REST API polling if Socket.IO is not connected
    if (!isSocketConnected) {
      startRestApiPolling();
    }

    // Cleanup polling when conversation changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedConversation, isSocketConnected, startRestApiPolling]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending message (with REST API fallback)
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const subject = selectedConversation.subject || 'General';
    const messageContent = messageInput.trim();
    setMessageInput('');

    // Use Socket.IO if available, otherwise use REST API
    if (socket && isSocketConnected) {
      socket.emit('send_message', {
        receiverId: selectedConversation.userId,
        content: messageContent,
        subject
      });
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('typing', { receiverId: selectedConversation.userId, isTyping: false });
    } else {
      // REST API fallback
      try {
        await messagesAPI.sendMessage({
          receiverId: selectedConversation.userId,
          content: messageContent,
          subject
        });

        // Refresh messages immediately
        const convResponse = await messagesAPI.getConversation(selectedConversation.userId);
        setMessages(convResponse.data.messages || []);
        
        // Refresh conversations list
        const conversationsResponse = await messagesAPI.getConversations();
        setConversations(conversationsResponse.data || []);
      } catch (error) {
        console.error('Error sending message via REST API:', error);
        alert('Failed to send message: ' + (error.response?.data?.message || error.message));
        // Restore message input on error
        setMessageInput(messageContent);
      }
    }
  };

  // Handle typing indicator (only works with Socket.IO)
  const handleTyping = () => {
    if (!socket || !selectedConversation || !isSocketConnected) return;

    socket.emit('typing', { 
      receiverId: selectedConversation.userId, 
      isTyping: true 
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isSocketConnected) {
        socket.emit('typing', { 
          receiverId: selectedConversation.userId, 
          isTyping: false 
        });
      }
    }, 3000);
  };

  // Start new conversation (for students)
  const handleStartConversation = (teacher) => {
    const conversation = {
      userId: teacher._id,
      name: teacher.name,
      subject: teacher.majorSubject,
      lastMessage: null,
      unreadCount: 0
    };
    setSelectedConversation(conversation);
  };

  // Handle Enter key to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading && conversations.length === 0 && teachers.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading messages...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {userRole === 'student' ? '💬 Messages' : '📬 Inbox'}
          </h2>
          {!isSocketConnected && selectedConversation && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span>Checking for new messages...</span>
            </div>
          )}
          {isSocketConnected && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Real-time</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Conversations/Teachers List */}
          <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-800 pr-4 overflow-y-auto">
            {/* Available Teachers Section (for students only) */}
            {userRole === 'student' && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">👨‍🏫</span>
                  Start New Conversation
                </h3>
                {teachers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    <p>No teachers available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teachers.map((teacher) => {
                      // Check if teacher already has a conversation
                      const hasConversation = conversations.some(conv => conv.userId === teacher._id);
                      if (hasConversation) return null;
                      
                      return (
                        <button
                          key={teacher._id}
                          onClick={() => handleStartConversation(teacher)}
                          className="w-full text-left p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-2 border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10 hover:border-primary-500 dark:hover:border-primary-500"
                        >
                          <div className="font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                            <span>💬</span>
                            {teacher.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Subject: {teacher.majorSubject || 'General'}
                          </div>
                          <div className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">
                            Click to message →
                          </div>
                        </button>
                      );
                    })}
                    {teachers.every(teacher => conversations.some(conv => conv.userId === teacher._id)) && (
                      <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-xs">
                        <p>All teachers have active conversations</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span>{userRole === 'student' ? '💬' : '📬'}</span>
              {userRole === 'student' ? 'Your Conversations' : 'Students'}
            </h3>
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">💬</div>
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.userId === conv.userId
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {conv.name}
                        </div>
                        {conv.subject && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {conv.subject}
                          </div>
                        )}
                        {conv.lastMessage && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {conv.lastMessage.content}
                          </div>
                        )}
                        {conv.lastMessage && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 flex flex-col h-full">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 pb-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedConversation.name}
                  </h3>
                  {selectedConversation.subject && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Subject: {selectedConversation.subject}
                    </p>
                  )}
                </div>

                {/* Messages List */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2"
                  style={{ maxHeight: '450px' }}
                >
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">💭</div>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const senderId = typeof message.senderId === 'object' ? message.senderId._id?.toString() : message.senderId?.toString();
                      const currentUserId = user?._id?.toString();
                      const isOwnMessage = senderId === currentUserId;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-primary-600 text-white rounded-br-none'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div
                              className={`text-xs mt-1 ${
                                isOwnMessage
                                  ? 'text-primary-100'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {format(new Date(message.timestamp), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isTyping && typingUser && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Messages;

