import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

const ChatPopOutContext = createContext(null);

export function ChatPopOutProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [messagesDb, setMessagesDb] = useState({});
  const [flaggedIds, setFlaggedIds] = useState(new Set());
  const [tags, setTags] = useState([]);
  const [convTags, setConvTags] = useState({});
  const [popOuts, setPopOuts] = useState([]);

  // Active panel chats tracking (so we can poll them for messages)
  const [activePanelChats, setActivePanelChats] = useState({ A: null, B: null });

  // Moderation / Takedown Modal States
  const [showTakedownModal, setShowTakedownModal] = useState(false);
  const [takedownConv, setTakedownConv] = useState(null);
  const [takedownPkgId, setTakedownPkgId] = useState(null);
  const [takedownPkgTitle, setTakedownPkgTitle] = useState('');
  const [takedownReason, setTakedownReason] = useState('');

  // Full Transcript Modal State
  const [fullTranscriptConvId, setFullTranscriptConvId] = useState(null);

  // ─── Fetch Helper Actions ──────────────────────────────────────────────────
  
  const fetchAllData = useCallback(async () => {
    const savedAdmin = localStorage.getItem('destin8_admin');
    if (!savedAdmin) return;

    try {
      // Fetch conversations
      const convsData = await api.getAdminConversations();
      setConversations(convsData);

      // Map flagged IDs
      const flags = new Set(convsData.filter(c => c.is_flagged).map(c => c.id));
      setFlaggedIds(flags);

      // Map conversation tags
      const cTags = {};
      convsData.forEach(c => {
        cTags[c.id] = c.tags.map(t => t.id);
      });
      setConvTags(cTags);

      // Fetch tags list
      const tagsData = await api.getAdminTags();
      const formattedTags = tagsData.map(t => ({ id: t.id, label: t.name, color: t.color }));
      setTags(formattedTags);
    } catch (err) {
      console.error('Error fetching admin chat list:', err);
    }
  }, []);

  const fetchActiveMessages = useCallback(async () => {
    const savedAdmin = localStorage.getItem('destin8_admin');
    if (!savedAdmin) return;

    const ids = new Set();
    if (activePanelChats.A) ids.add(activePanelChats.A);
    if (activePanelChats.B) ids.add(activePanelChats.B);
    if (fullTranscriptConvId) ids.add(fullTranscriptConvId);
    popOuts.forEach(id => ids.add(id));

    const activeList = Array.from(ids);
    if (activeList.length === 0) return;

    try {
      await Promise.all(activeList.map(async (id) => {
        const msgs = await api.getAdminMessages(id);
        setMessagesDb(prev => ({ ...prev, [id]: msgs }));
      }));
    } catch (err) {
      console.error('Error polling active chat messages:', err);
    }
  }, [activePanelChats, fullTranscriptConvId, popOuts]);

  // ─── central loops ─────────────────────────────────────────────────────────

  // Initial and login check
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Immediate message loading when active conversation list changes
  const activeChatIdsString = JSON.stringify([
    activePanelChats.A,
    activePanelChats.B,
    fullTranscriptConvId,
    ...popOuts
  ]);

  useEffect(() => {
    fetchActiveMessages();
  }, [activeChatIdsString, fetchActiveMessages]);

  // Polling loop
  useEffect(() => {
    const intervalConvs = setInterval(() => {
      fetchAllData();
    }, 4000);

    const intervalMessages = setInterval(() => {
      fetchActiveMessages();
    }, 4000);

    return () => {
      clearInterval(intervalConvs);
      clearInterval(intervalMessages);
    };
  }, [fetchAllData, fetchActiveMessages]);


  // ─── Mutation Handlers ─────────────────────────────────────────────────────

  const toggleFlag = useCallback(async (id) => {
    const isCurrentlyFlagged = flaggedIds.has(id);
    const nextFlagged = !isCurrentlyFlagged;
    
    // Snappy UI update
    setFlaggedIds(prev => {
      const n = new Set(prev);
      if (nextFlagged) n.add(id);
      else n.delete(id);
      return n;
    });

    try {
      await api.toggleAdminFlag(id, nextFlagged, nextFlagged ? "Flagged by admin monitoring" : null);
      fetchAllData();
    } catch (err) {
      alert("Error toggling flag: " + err.message);
      // Revert on error
      fetchAllData();
    }
  }, [flaggedIds, fetchAllData]);

  const toggleConvTag = useCallback(async (convId, tagId) => {
    const currentTags = convTags[convId] || [];
    const nextTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];

    // Snappy UI update
    setConvTags(prev => ({ ...prev, [convId]: nextTags }));

    try {
      await api.updateConvTags(convId, nextTags);
      fetchAllData();
    } catch (err) {
      alert("Error updating conversation tags: " + err.message);
      fetchAllData();
    }
  }, [convTags, fetchAllData]);

  const handleSendWarning = useCallback(async (convId, text) => {
    if (!text?.trim()) return;
    try {
      const newMsg = await api.sendSystemWarning(convId, text.trim());
      setMessagesDb(prev => ({
        ...prev,
        [convId]: [...(prev[convId] || []), newMsg]
      }));
      // Fetch latest conversations to update snippets
      fetchAllData();
    } catch (err) {
      alert("Error sending warning: " + err.message);
    }
  }, [fetchAllData]);

  const openPopOut = useCallback((convId) => {
    setPopOuts(prev => prev.includes(convId) ? prev : [...prev, convId]);
  }, []);

  const closePopOut = useCallback((convId) => {
    setPopOuts(prev => prev.filter(id => id !== convId));
  }, []);

  const handleInitiateTakedown = useCallback(async (conv) => {
    try {
      const packages = await api.getPackages();
      const match = packages.find(p => p.title.toLowerCase().includes(conv.package.toLowerCase()) || 
                                       conv.package.toLowerCase().includes(p.title.toLowerCase()));
      if (match) {
        setTakedownConv(conv);
        setTakedownPkgId(match.id);
        setTakedownPkgTitle(match.title);
        setTakedownReason('');
        setShowTakedownModal(true);
      } else {
        alert(`Could not find package "${conv.package}" in the database.`);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }, []);

  const handleConfirmTakedown = useCallback(async () => {
    if (!takedownPkgId || !takedownReason.trim()) return;
    try {
      await api.takedownPackage(takedownPkgId, takedownReason.trim());
      alert(`Package "${takedownPkgTitle}" taken down.`);
      setShowTakedownModal(false);
    } catch (err) {
      alert('Takedown failed: ' + err.message);
    }
  }, [takedownPkgId, takedownReason, takedownPkgTitle]);

  return (
    <ChatPopOutContext.Provider
      value={{
        conversations,
        setConversations,
        messagesDb,
        setMessagesDb,
        flaggedIds,
        setFlaggedIds,
        tags,
        setTags,
        convTags,
        setConvTags,
        popOuts,
        setPopOuts,
        toggleFlag,
        toggleConvTag,
        handleSendWarning,
        openPopOut,
        closePopOut,
        showTakedownModal,
        setShowTakedownModal,
        takedownConv,
        takedownPkgTitle,
        takedownReason,
        setTakedownReason,
        handleInitiateTakedown,
        handleConfirmTakedown,
        fullTranscriptConvId,
        setFullTranscriptConvId,
        activePanelChats,
        setActivePanelChats,
        fetchAllData
      }}
    >
      {children}
    </ChatPopOutContext.Provider>
  );
}

export function useChatPopOut() {
  return useContext(ChatPopOutContext);
}
