"use client";

import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { useRouter } from "next/navigation";
import { useUser } from "../ClientLayout";
import { uploadMedia } from "@/lib/api-image";

interface User {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    icon?: string;
    bio?: string;
    lastMessage?: string;
}

interface Media {
    type: string;  // "image" ou "video" ou "unknown"
    url: string;
}

interface Message {
    id: number;
    from_user_id: number;
    to_user_id: number;
    message: string;
    medias: Media[];
    created_at?: string;
    // "sender" ou "receiver"
    type: string;
}

export default function ChatUI() {
    const router = useRouter();
    const { userId } = useUser();

    const [search, setSearch] = useState("");
    const [userList, setUserList] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const [localMedias, setLocalMedias] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);


    const fetchUsers = async () => {
        try {
            const actualSearch = search.startsWith("@") ? search.slice(1) : search;
            const url = `/api/messages/list?search=${encodeURIComponent(actualSearch)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) {
                setUserList(data);
            } else {
                console.error("Données users invalides:", data);
            }
        } catch (error) {
            console.error("Erreur fetchUsers:", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [search]);


    const fetchConversation = async (toUserId: number) => {
        try {
            const url = `/api/messages/conversation?fromUser=${userId}&toUser=${toUserId}`;
            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) {
                setMessages(data);
                scrollToBottom();
            } else {
                console.error("Données conversation invalides:", data);
            }
        } catch (err) {
            console.error("Erreur fetchConversation:", err);
        }
    };

    const handleSelectUser = async (user: User) => {
        setSelectedUser(user);
        setMessages([]);
        setLocalMedias([]);
        await fetchConversation(user.id);
    };

    useEffect(() => {
        if (!selectedUser) return;
        const interval = setInterval(() => {
            fetchConversation(selectedUser.id);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedUser]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setLocalMedias((prev) => [...prev, ...files]);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };


    const handleSendMessage = async () => {
        if (!selectedUser) return;

        try {
            const uploadedMedias: Media[] = [];
            for (const file of localMedias) {
                const fileType = file.type.startsWith("image/")
                    ? "image"
                    : file.type.startsWith("video/")
                        ? "video"
                        : "unknown";

                const uploaded = await uploadMedia(file);
                uploadedMedias.push({
                    type: fileType,
                    url: uploaded.url
                });
            }

            const body = {
                from_user_id: userId,
                to_user_id: selectedUser.id,
                message: newMessage,
                medias: uploadedMedias,
            };

            const res = await fetch("/api/messages/conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                console.error("Erreur envoi message");
                return;
            }

            const msg: Message = await res.json();
            setMessages((prev) => [...prev, msg]);
            setNewMessage("");
            setLocalMedias([]);
            scrollToBottom();
        } catch (error) {
            console.error("Erreur handleSendMessage:", error);
        }
    };

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const goToProfile = (username: string) => {
        router.push(`/profiles/${username}`);
    };


    return (
        <div className="flex justify-center w-full">
            <div className="w-[22.5%] fixed left-10">
                <div className="h-[600px] w-full bg-(--secondary) rounded-xl flex flex-col overflow-hidden">
                    <div className="text-xl font-bold p-5 text-[var(--text-primary)]">📩 Messagerie</div>

                    <div className="p-3 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur ou @username..."
                            className="w-full bg-[var(--input)] p-2 rounded-lg text-[var(--text-primary)]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-3 p-5 overflow-y-auto scrollbar-custom">
                        {userList.length > 0 ? (
                            userList.map((user) => {
                                const isSelected = (selectedUser && user.id === selectedUser.id);

                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        className={` flex items-center p-3 rounded-lg cursor-pointer  hover:bg-opacity-70 transition-all duration-300 bg-[var(--input)] ${isSelected ? "scale-105 bg-(--input-selected) ring-2 ring-(--blue)" : ""} `}
                                        style={{ transformOrigin: "left center" }}
                                    >
                                        <img
                                            src={user.icon ? user.icon : "/img/default_user_icon.png"}
                                            alt="icon"
                                            className="w-10 h-10 rounded-full mr-3 object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)]">
                                                {user.firstname} {user.lastname}
                                            </p>
                                            <p className="text-xs text-[var(--text-grey)]">@{user.username}</p>
                                            {user.lastMessage && (
                                                <p className="text-xs text-[var(--text-grey)] mt-1 line-clamp-1 overflow-ellipsis">
                                                    {user.lastMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-[var(--text-grey)] text-center">
                                Aucun utilisateur
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-[50%] max-h-[700px] overflow-scroll-x scrollbar-custom">
                <div className="h-[150px] w-full bg-(--secondary) rounded-xl flex items-center p-5">
                    {selectedUser ? (
                        <div className="flex flex-col">
                            <p className="font-semibold text-[var(--text-primary)] text-lg">
                                {selectedUser.firstname} {selectedUser.lastname}
                            </p>
                            <p
                                onClick={() => goToProfile(selectedUser.username)}
                                className="text-xs text-[var(--blue)] cursor-pointer hover:underline"
                            >
                                @{selectedUser.username}
                            </p>

                            {selectedUser.bio && (
                                <p className="text-xs text-[var(--text-grey)] mt-1">
                                    {selectedUser.bio}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-[var(--text-primary)]">
                            Sélectionnez un utilisateur pour voir la conversation.
                        </p>
                    )}
                </div>

                <div className="mt-5 h-[400px] w-full bg-(--secondary) rounded-xl flex flex-col p-5 space-y-4 overflow-y-auto scrollbar-custom">
                    {messages.map((msg) => {
                        const isMe = msg.type === "sender";
                        const bubbleClass = isMe
                            ? "bg-blue-500 text-white dark:bg-blue-400 dark:text-white"
                            : "bg-gray-300 text-black dark:bg-gray-700 dark:text-white";

                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`p-3 rounded-lg max-w-xs shadow-lg ${bubbleClass}`}>
                                    <p>{msg.message}</p>

                                    {msg.medias && msg.medias.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-2">
                                            {msg.medias.map((media, index) => {
                                                if (media.type === "image") {
                                                    return (
                                                        <img
                                                            key={index}
                                                            src={media.url}
                                                            alt="media"
                                                            className="max-w-[200px] rounded-lg"
                                                        />
                                                    );
                                                } else if (media.type === "video") {
                                                    return (
                                                        <video
                                                            key={index}
                                                            src={media.url}
                                                            controls
                                                            className="max-w-[200px] rounded-lg"
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <p key={index} className="text-xs">
                                                            Fichier non géré
                                                        </p>
                                                    );
                                                }
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="mt-5 h-[80px] w-full bg-(--secondary) rounded-xl flex items-center p-4">
                    <div className="relative flex items-center w-full">
                        <input
                            onKeyDown={(e) => e.code == "Enter" && handleSendMessage()}
                            type="text"
                            placeholder="Tapez un message..."
                            className="flex-1 bg-[var(--input)] p-3 rounded-lg text-[var(--text-primary)] placeholder-[var(--text-grey)] transition-all duration-300 focus:ring-2 focus:ring-[var(--blue)] focus:outline-none"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            type="button"
                            className="ml-3 hover:opacity-70"
                            onClick={triggerFileSelect}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6 w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5
                     a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 
                     1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5
                     a4.5 4.5 0 0 0 1.242 7.244"
                                />
                            </svg>
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>

                    <button
                        onClick={handleSendMessage}
                        className="ml-3 bg-[var(--blue)] px-4 py-2 rounded-lg text-white font-semibold shadow-md hover:bg-opacity-80 transition-all duration-300"
                    >
                        Envoyer
                    </button>
                </div>
            </div>

            <div className="w-[22.5%] h-[700px] fixed right-10 bg-(--secondary) rounded-xl flex flex-col items-center">
                {selectedUser ? (
                    <>
                        <div className="mt-10 flex flex-col items-center">
                            {selectedUser.icon ? (
                                <img
                                    src={selectedUser.icon}
                                    alt="avatar"
                                    className="w-16 h-16 rounded-full mb-3 object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-[var(--border-grey-light)] rounded-full mb-3" />
                            )}
                            <p className="font-semibold text-[var(--text-primary)]">
                                {selectedUser.firstname} {selectedUser.lastname}
                            </p>
                            <p
                                onClick={() => goToProfile(selectedUser.username)}
                                className="text-[var(--blue)] text-xs cursor-pointer hover:underline"
                            >
                                @{selectedUser.username}
                            </p>

                            {selectedUser.bio && (
                                <p className="text-[var(--text-grey)] text-sm mt-1 px-5 text-center">
                                    {selectedUser.bio}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 w-[85%]">
                            <p className="text-[var(--text-grey)] mb-2 font-semibold">Fichiers à envoyer</p>
                            {localMedias.length === 0 ? (
                                <p className="text-[var(--text-grey)] text-sm">Aucun fichier sélectionné</p>
                            ) : (
                                <div className="max-h-[200px] overflow-y-auto grid grid-cols-3 gap-2">
                                    {localMedias.map((file, i) => {
                                        const fileURL = URL.createObjectURL(file);
                                        if (file.type.startsWith("image/")) {
                                            return (
                                                <img
                                                    key={i}
                                                    src={fileURL}
                                                    alt="Aperçu"
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            );
                                        } else if (file.type.startsWith("video/")) {
                                            return (
                                                <video
                                                    key={i}
                                                    src={fileURL}
                                                    controls
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            );
                                        } else {
                                            return (
                                                <div
                                                    key={i}
                                                    className="w-16 h-16 bg-[var(--border-grey-light)] rounded-lg flex items-center justify-center"
                                                >
                                                    <p className="text-[var(--text-primary)] text-xs">Fichier</p>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-5 w-[85%]">
                            <p className="text-[var(--text-grey)] mb-2 font-semibold">Derniers médias de la conversation</p>
                            {(() => {
                                const conversationMedias = [...messages.flatMap((m) => m.medias)].reverse();
                                const lastMedias = conversationMedias.slice(0, 6);

                                if (lastMedias.length === 0) {
                                    return <p className="text-[var(--text-grey)] text-sm">Aucune image/vidéo</p>;
                                }
                                return (
                                    <div className="max-h-[200px] overflow-y-auto grid grid-cols-3 gap-2">
                                        {lastMedias.map((media, index) => {
                                            if (media.type === "image") {
                                                return (
                                                    <img
                                                        key={index}
                                                        src={media.url}
                                                        alt="media"
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                );
                                            } else if (media.type === "video") {
                                                return (
                                                    <video
                                                        key={index}
                                                        src={media.url}
                                                        controls
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="w-16 h-16 bg-[var(--border-grey-light)] rounded-lg flex items-center justify-center"
                                                    >
                                                        <p className="text-[var(--text-primary)] text-xs">Fichier</p>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </>
                ) : (
                    <p className="text-[var(--text-primary)] mt-10 px-5 text-center">
                        Sélectionnez un utilisateur
                        <br />
                        pour voir son profil
                    </p>
                )}
            </div>
        </div>
    );
}
