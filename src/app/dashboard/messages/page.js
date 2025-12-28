"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Trash2, 
  Calendar, 
  User, 
  MessageSquare, 
  Loader2, 
  ExternalLink,
  RefreshCw,
  Inbox
} from "lucide-react";

const host = process.env.NEXT_PUBLIC_API_HOST || 'https://asicweb-portal.longpc.xyz';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${host}/api/contacts`, { cache: 'no-store' });
      const data = await res.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const deleteMessage = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`${host}/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(messages.filter(msg => msg._id !== id));
        if (selectedMsg?._id === id) setSelectedMsg(null);
      }
    } catch (error) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section - Cực kỳ tối giản */}
        <div className="flex items-center justify-between mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Messages <span className="text-emerald-600">List</span>
          </h1>
          
          <button 
            onClick={fetchMessages}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:text-emerald-600 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* LEFT: Sidebar List */}
          <div className="lg:col-span-2 space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading && messages.length === 0 ? (
              <div className="flex flex-col items-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <Loader2 className="animate-spin text-emerald-600 w-8 h-8 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                <Inbox className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No messages</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg._id}
                  onClick={() => setSelectedMsg(msg)}
                  className={`group p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer relative ${
                    selectedMsg?._id === msg._id 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-900/20' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${selectedMsg?._id === msg._id ? 'text-emerald-100' : 'text-emerald-600'}`}>
                      {new Date(msg.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-1 leading-tight line-clamp-1">{msg.subject}</h3>
                  <p className={`text-[11px] font-medium ${selectedMsg?._id === msg._id ? 'text-emerald-50/70' : 'text-slate-400'}`}>
                    {msg.name}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* RIGHT: Detail View */}
          <div className="lg:col-span-3">
            {selectedMsg ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none sticky top-8">
                {/* Detail Header */}
                <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                        <User className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="font-black uppercase tracking-tight text-xl leading-none mb-2">{selectedMsg.name}</h2>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500 font-bold">{selectedMsg.email}</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(selectedMsg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Subject</p>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {selectedMsg.subject}
                    </h4>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-10 min-h-[250px]">
                  <div className="flex items-center gap-2 mb-6 text-slate-300">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Content</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base font-medium">
                    {selectedMsg.message}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-slate-50 dark:bg-slate-800/20 flex justify-between items-center">
                  <button 
                    onClick={() => deleteMessage(selectedMsg._id)}
                    className="flex items-center gap-2 px-6 py-4 border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-95 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>

                  <a 
                    href={`mailto:${selectedMsg.email}`}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95"
                  >
                    Reply <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] border-dashed">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <Mail className="text-slate-200 dark:text-slate-700 w-10 h-10" />
                </div>
                <h3 className="text-slate-400 font-black uppercase tracking-widest text-xs">Inbox</h3>
                <p className="text-slate-300 dark:text-slate-600 text-[10px] uppercase mt-2 tracking-tighter italic">Select a message from the list to view details</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}