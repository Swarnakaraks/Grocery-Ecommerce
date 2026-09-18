import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  Search,
  Send,
  Store as StoreIcon,
} from "lucide-react";

import { chatApi } from "@/api/chat.api";
import { useAuth } from "@/context/AuthContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { cn, timeAgo } from "@/lib/utils";

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(
    searchParams.get("conversation") || null,
  );
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const isInitialMessageLoad = useRef(true);
  const shouldScrollAfterSend = useRef(false);

  // load conversations
  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConvos(true);

    try {
      const { data } = await chatApi.getMyConversations();
      setConversations(data.conversations || []);
    } catch {
      // silent
    } finally {
      if (!silent) setLoadingConvos(false);
    }
  }, []);

  // check scroll position
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    return distanceFromBottom < 120;
  }, []);

  // scroll messages
  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior,
        block: "end",
      });
    });
  }, []);

  // load messages
  const loadMessages = useCallback(
    async (id, silent = false) => {
      if (!id) return;

      if (!silent) {
        setLoadingMessages(true);
        isInitialMessageLoad.current = true;
      }

      try {
        const { data } = await chatApi.getMessages(id);
        const newMessages = data.messages || [];
        const userIsNearBottom = isNearBottom();

        setMessages((previousMessages) => {
          if (
            previousMessages.length === newMessages.length &&
            previousMessages.every(
              (message, index) =>
                message._id === newMessages[index]?._id &&
                message.text === newMessages[index]?.text,
            )
          ) {
            return previousMessages;
          }

          return newMessages;
        });

        if (
          !silent ||
          isInitialMessageLoad.current ||
          userIsNearBottom ||
          shouldScrollAfterSend.current
        ) {
          setTimeout(() => scrollToBottom("auto"), 50);

          isInitialMessageLoad.current = false;
          shouldScrollAfterSend.current = false;
        }

        chatApi.markAsRead(id).catch(() => {});
      } catch {
        // silent
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [isNearBottom, scrollToBottom],
  );

  // initial conversations
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // selected conversation
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    loadMessages(activeId);
  }, [activeId, loadMessages]);

  // polling
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);

      if (activeId) loadMessages(activeId, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeId, loadConversations, loadMessages]);

  // select conversation
  const selectConversation = (id) => {
    setActiveId(id);
    setSearchParams({ conversation: id });
    setMessages([]);
    setSearch("");
  };

  // back to conversations
  const handleBack = () => {
    setActiveId(null);
    setMessages([]);
    setSearchParams({});
  };

  // send message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim() || !activeId || sending) return;

    const draft = text.trim();

    setText("");
    setSending(true);
    shouldScrollAfterSend.current = true;

    try {
      const { data } = await chatApi.sendMessage(activeId, draft);

      if (data?.data) {
        setMessages((previousMessages) => [
          ...previousMessages,
          data.data,
        ]);
      }

      await loadConversations(true);

      setTimeout(() => {
        scrollToBottom("smooth");
        shouldScrollAfterSend.current = false;
      }, 50);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not send message",
      );

      setText(draft);
      shouldScrollAfterSend.current = false;
    } finally {
      setSending(false);
    }
  };

  // enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (text.trim() && !sending) handleSend(e);
    }
  };

  // get other party
  const getOtherParty = (conversation) => {
    const isBuyer = user?._id === conversation.buyer?._id;
    const person = isBuyer ? conversation.seller : conversation.buyer;

    return {
      person,
      isBuyer,
      store: conversation.store,
    };
  };

  const activeConvo = conversations.find(
    (conversation) => conversation._id === activeId,
  );

  // filter conversations
  const filteredConvos = conversations.filter((conversation) => {
    const { person, store } = getOtherParty(conversation);
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      person?.fullName?.toLowerCase().includes(query) ||
      store?.storeName?.toLowerCase().includes(query) ||
      store?.name?.toLowerCase().includes(query)
    );
  });

  const activePerson = activeConvo
    ? getOtherParty(activeConvo).person
    : null;

  const activeStore = activeConvo
    ? getOtherParty(activeConvo).store
    : null;

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-primary/[0.03] via-background to-background px-3 py-4 sm:px-4 md:py-6 lg:px-8">
      <div className="mx-auto h-[calc(100vh-120px)] min-h-[600px] max-h-[850px] w-full max-w-7xl overflow-hidden rounded-3xl border border-primary/10 bg-card shadow-xl shadow-primary/5">
        <div className="grid h-full grid-cols-1 md:grid-cols-[340px_1fr]">
          {/* conversation sidebar */}
          <aside
            className={cn(
              "flex h-full flex-col border-r border-border/70 bg-background",
              activeId && "hidden md:flex",
            )}
          >
            {/* sidebar header */}
            <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-br from-primary via-primary/95 to-emerald-700 px-4 py-5 text-primary-foreground">
              <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 right-20 h-28 w-28 rounded-full bg-white/5" />

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 shadow-sm backdrop-blur-sm">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-white">
                        Messages
                      </h2>

                      <p className="text-xs text-white/70">
                        Your conversations
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {conversations.length}
                  </span>
                </div>

                {/* search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />

                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="h-10 rounded-xl border-white/10 bg-white pl-9 pr-3 text-gray-600 placeholder:text-gray-600 shadow-none backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-white/30"
                  />
                </div>
              </div>
            </div>

            {/* conversation list */}
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <Spinner />
              ) : filteredConvos.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10">
                    <MessageCircle className="h-7 w-7 text-primary/70" />
                  </div>

                  <p className="text-sm font-semibold">
                    No conversations
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                    Your conversations will appear here.
                  </p>
                </div>
              ) : (
                filteredConvos.map((conversation) => {
                  const { person, store } =
                    getOtherParty(conversation);

                  const isActive = activeId === conversation._id;

                  return (
                    <button
                      key={conversation._id}
                      type="button"
                      onClick={() =>
                        selectConversation(conversation._id)
                      }
                      className={cn(
                        "group relative flex w-full items-center gap-3 border-b border-border/50 px-4 py-3.5 text-left transition-all",
                        "hover:bg-primary/[0.035]",
                        isActive &&
                          "bg-gradient-to-r from-primary/[0.10] via-primary/[0.04] to-transparent",
                      )}
                    >
                      {/* active indicator */}
                      {isActive && (
                        <motion.span
                          layoutId="activeConversation"
                          className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-gradient-to-b from-primary to-emerald-500"
                        />
                      )}

                      {/* avatar */}
                      <div className="relative shrink-0">
                        <Avatar
                          className={cn(
                            "h-12 w-12 border-2 transition-all",
                            isActive
                              ? "border-primary/30 shadow-md shadow-primary/10"
                              : "border-border",
                          )}
                        >
                          <AvatarImage
                            src={
                              person?.profilePicture?.url ||
                              person?.profileImage?.url
                            }
                            alt={person?.fullName}
                          />

                          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                            {person?.fullName?.[0]?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>

                        <span
                          className={cn(
                            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                            isActive
                              ? "bg-primary"
                              : "bg-muted-foreground/30",
                          )}
                        />
                      </div>

                      {/* conversation info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "truncate text-sm",
                              isActive
                                ? "font-bold text-primary"
                                : "font-semibold",
                            )}
                          >
                            {person?.fullName || "User"}
                          </p>

                          {conversation.lastMessageAt && (
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {timeAgo(conversation.lastMessageAt)}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-1">
                          <StoreIcon className="h-3 w-3 shrink-0 text-primary/60" />

                          <p className="truncate text-xs text-muted-foreground">
                            {store?.storeName ||
                              store?.name ||
                              "Store"}
                          </p>
                        </div>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {conversation.lastMessage ||
                            "Start the conversation"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* chat area */}
          <main
            className={cn(
              "flex h-full min-h-0 flex-col bg-gradient-to-br from-primary/[0.025] via-background to-emerald-500/[0.025]",
              !activeId && "hidden md:flex",
            )}
          >
            {!activeId ? (
              /* empty chat */
              <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center">
                {/* decorative background */}
                <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative mb-6"
                >
                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/10 bg-card shadow-xl">
                    <MessageCircle className="h-10 w-10 text-primary" />
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-bold"
                >
                  Your Messages
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground"
                >
                  Select a conversation from the left to start chatting
                  with a buyer or seller.
                </motion.p>
              </div>
            ) : (
              <>
                {/* chat header */}
                <header className="relative flex h-[76px] shrink-0 items-center gap-3 overflow-hidden border-b border-primary/10 bg-gradient-to-r from-primary via-primary/95 to-emerald-700 px-4 text-primary-foreground shadow-sm sm:px-5">
                  <div className="absolute -right-10 -top-16 h-36 w-36 rounded-full bg-white/10" />
                  <div className="absolute -bottom-16 right-32 h-28 w-28 rounded-full bg-white/5" />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative z-10 text-white hover:bg-white/10 hover:text-white md:hidden"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <Avatar className="relative z-10 h-11 w-11 border-2 border-white/30 shadow-md">
                    <AvatarImage
                      src={
                        activePerson?.profilePicture?.url ||
                        activePerson?.profileImage?.url
                      }
                      alt={activePerson?.fullName}
                    />

                    <AvatarFallback className="bg-white/15 font-semibold text-white">
                      {activePerson?.fullName?.[0]?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="relative z-10 min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-white">
                      {activePerson?.fullName || "User"}
                    </h3>

                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/70">
                      <StoreIcon className="h-3 w-3" />
                      {activeStore?.storeName ||
                        activeStore?.name ||
                        "Store"}
                    </p>
                  </div>

                
                </header>

                {/* message area */}
                <div
                  ref={messagesContainerRef}
                  className="relative flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-5"
                >
                  {/* gradient background */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-primary/[0.025] blur-3xl" />
                    <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-emerald-400/[0.025] blur-3xl" />

                    <div className="absolute inset-0 opacity-[0.018]">
                      <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:20px_20px]" />
                    </div>
                  </div>

                  <div className="relative mx-auto flex max-w-4xl flex-col gap-2">
                    {loadingMessages ? (
                      <div className="py-10">
                        <Spinner />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 shadow-sm">
                          <MessageCircle className="h-7 w-7 text-primary/70" />
                        </div>

                        <p className="text-sm font-semibold">
                          No messages yet
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Send a message to start the conversation.
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {messages.map((message, index) => {
                          const isMine =
                            message.sender?._id === user?._id;

                          const previousMessage =
                            messages[index - 1];

                          const previousWasMine =
                            previousMessage?.sender?._id === user?._id;

                          const showSpacing =
                            index === 0 ||
                            isMine !== previousWasMine;

                          return (
                            <motion.div
                              key={message._id}
                              initial={{
                                opacity: 0,
                                y: 6,
                                scale: 0.98,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                              }}
                              transition={{ duration: 0.18 }}
                              className={cn(
                                "flex w-full",
                                isMine
                                  ? "justify-end"
                                  : "justify-start",
                                showSpacing && "mt-3",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex max-w-[85%] items-end gap-2 sm:max-w-[70%]",
                                  isMine
                                    ? "flex-row-reverse"
                                    : "flex-row",
                                )}
                              >
                                {/* opponent avatar */}
                                {!isMine ? (
                                  <Avatar className="mb-1 h-7 w-7 shrink-0 border border-border/60 shadow-sm">
                                    <AvatarImage
                                      src={
                                        activePerson?.profilePicture
                                          ?.url ||
                                        activePerson?.profileImage
                                          ?.url
                                      }
                                    />

                                    <AvatarFallback className="bg-background text-[10px] font-semibold text-primary shadow-sm">
                                      {activePerson?.fullName?.[0]?.toUpperCase() ||
                                        "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : null}

                                {/* message bubble */}
                                <div
                                  className={cn(
                                    "relative px-3.5 py-2.5 shadow-sm",
                                    isMine
                                      ? "rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-primary/10"
                                      : "rounded-2xl rounded-bl-md border border-border/70 bg-card text-foreground shadow-black/[0.03]",
                                  )}
                                >
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {message.text}
                                  </p>

                                  <div
                                    className={cn(
                                      "mt-1 flex items-center justify-end gap-1",
                                      isMine
                                        ? "text-white/65"
                                        : "text-muted-foreground",
                                    )}
                                  >
                                    <span className="text-[10px]">
                                      {timeAgo(message.createdAt)}
                                    </span>

                                    {isMine && (
                                      <CheckCheck className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}

                    <div
                      ref={bottomRef}
                      className="h-px w-full"
                    />
                  </div>
                </div>

                {/* message input */}
                <div className="shrink-0 border-t border-primary/10 bg-card/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] backdrop-blur-sm">
                  <form
                    onSubmit={handleSend}
                    className="mx-auto flex max-w-4xl items-end gap-2"
                  >
                    <div className="relative flex-1">
                      <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="h-11 rounded-full border-border/70 bg-muted/40 px-4 pr-12 shadow-none transition-all focus-visible:border-primary/30 focus-visible:ring-primary/20"
                      />

                      {text.trim() && (
                        <span className="pointer-events-none absolute bottom-1/2 right-4 translate-y-1/2 text-[10px] text-muted-foreground">
                          Enter
                        </span>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="icon"
                      disabled={sending || !text.trim()}
                      className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-emerald-600 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25"
                    >
                      {sending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
