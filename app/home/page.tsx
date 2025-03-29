"use client";

import { useEffect, useState, useRef } from "react";
import { uploadMedia } from "@/lib/api-image";
import { UserProfile } from "@/app/types/user";
import { useTheme, useUser } from "../ClientLayout";
import Image from "next/image";

import Tweets from "../components/tweet/Tweets";

import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useRouter } from "next/navigation";

import GifPicker from "gif-picker-react";
import EmojiPicker from "emoji-picker-react";

gsap.registerPlugin(Draggable);

interface Hashtag {
	id: number;
	name: string;
}

interface MentionUser {
	id: number;
	username: string;
	firstname: string;
	lastname: string;
	icon?: string;
}

export default function Home() {
	const { userId } = useUser();
	const { theme }: { theme: any } = useTheme();

	const [tweet, setTweet] = useState<string>("");
	const [medias, setMedias] = useState<
		{ type: string; file: string | null; url: string }[]
	>([]);
	const [userData, setUserData] = useState<UserProfile | null>(null);

	const [hashtags, setHashtags] = useState<Hashtag[]>([]);
	const [filteredHashtags, setFilteredHashtags] = useState<Hashtag[]>([]);
	const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);

	const [mentionResults, setMentionResults] = useState<MentionUser[]>([]);
	const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
	const [oldTweetsTotal, setOldTweetsTotal] = useState<number>(0);
	const [tweetDiffCount, setTweetDiffCount] = useState<number>(0);
	const [refreshTweets, setRefreshTweets] = useState<number>(0);
	const [showGifPicker, setShowGifPicker] = useState<boolean>(false);
	const [showEmojis, setShowEmojis] = useState<boolean>(false);

	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		const checkScreenSize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);

		return () => {
			window.removeEventListener("resize", checkScreenSize);
		};
	}, []);

	useEffect(() => {
		const interval = setInterval(async () => {
			try {
				const resp = await fetch("/api/tweet?page=count");
				if (!resp.ok) return;

				const data = await resp.json();
				const totalCount = data.totalCount || 0;

				if (oldTweetsTotal === 0) {
					setOldTweetsTotal(totalCount);
				} else if (totalCount > oldTweetsTotal) {
					const diff = totalCount - oldTweetsTotal;

					setTweetDiffCount(diff);
					setOldTweetsTotal(totalCount);
				}
			} catch (err) {
				console.log("Erreur count tweets:", err);
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [oldTweetsTotal]);

	useEffect(() => {
		if (userId) {
			fetch("/api/users/userData?userId=" + userId, { method: "GET" })
				.then((res) => res.json())
				.then((data) => setUserData(data[0]));
		} else {
			setUserData(null);
		}
	}, [userId]);

	useEffect(() => {
		const getHashtag = async () => {
			try {
				const res = await fetch("/api/tweet/hashtag?hashtag=all", {
					method: "GET",
					credentials: "include",
				});
				if (!res.ok) {
					throw new Error("Erreur récupération hashtags");
				}
				const data = await res.json();
				setHashtags(data.hashtags || []);
			} catch (error) {
				console.log("Erreur récupération hashtags:", error);
			}
		};
		getHashtag();
	}, []);

	const handleRefreshTweets = () => {
		setOldTweetsTotal(0);
		setTweetDiffCount(0);
		setRefreshTweets((prev) => prev + 1);
	};

	const handlePostTweet = async () => {
		try {
			const newMedias = await Promise.all(
				medias.map(async (element) => {
					if (element.file) {
						const media = await uploadMedia(element.file);
						return { type: element.type, url: media.url };
					} else {
						return { type: element.type, url: element.url };
					}
				})
			);

			const getStringHashtagList = (text: string | null | undefined) => {
				let list: any[] = [];
				text?.split(/(@\w+|#\w+)/g).map((part) => {
					if (part.startsWith("#")) {
						list.push(part.replace("#", ""));
					}
				});
				return list;
			};

			if (tweet.length <= 0 && newMedias.length <= 0) {
				return;
			}

			await fetch("/api/home", {
				method: "POST",
				body: JSON.stringify({
					tweet: tweet,
					medias: newMedias,
					filteredHashtags: getStringHashtagList(tweet),
				}),
			});

			handleRefreshTweets();
			setTweet("");
			setMedias([]);
		} catch (err) {
			console.log("Erreur post tweet:", err);
		}
	};

	const handleFileUpload = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*,video/*";
		input.click();

		input.addEventListener("change", (e: any) => {
			const file = e.target.files[0];
			if (file) {
				const fileType = file.type.startsWith("image/")
					? "image"
					: file.type.startsWith("video/")
						? "video"
						: "unknown";

				const reader = new FileReader();
				reader.onload = (ev: any) => {
					setMedias((prev) => [
						...prev,
						{ type: fileType, file, url: ev.target.result },
					]);
				};
				reader.readAsDataURL(file);
			}
		});
	};

	const resetImageFile = (id: number) => {
		setMedias((prev) => prev.filter((_, i) => i !== id));
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setTweet(value);

		const matchHashtag = value.match(/#(\w*)$/);
		const matchMention = value.match(/@(\w*)$/);

		if (matchHashtag) {
			const searchTerm = matchHashtag[1].toLowerCase();
			if (searchTerm === "") {
				setFilteredHashtags(hashtags);
			} else {
				setFilteredHashtags(
					hashtags.filter((tag) =>
						tag.name.toLowerCase().startsWith(searchTerm)
					)
				);
			}
			setShowHashtagSuggestions(true);
			setShowMentionSuggestions(false);
		} else if (matchMention) {
			const searchTerm = matchMention[1].toLowerCase();
			if (!searchTerm) {
				fetchUsersForMention("");
			} else {
				fetchUsersForMention(searchTerm);
			}
			setShowMentionSuggestions(true);
			setShowHashtagSuggestions(false);
		} else {
			// Rien
			setShowHashtagSuggestions(false);
			setShowMentionSuggestions(false);
		}
	};

	const fetchUsersForMention = async (searchTerm: string) => {
		try {
			const res = await fetch(
				`/api/users?search=${encodeURIComponent(searchTerm)}`,
				{
					method: "GET",
				}
			);
			if (!res.ok) {
				return;
			}
			const data = await res.json();
			setMentionResults(data || []);
		} catch (err) {
			console.log("Erreur fetch mention users:", err);
			setMentionResults([]);
		}
	};

	const handleSelectHashtag = (name: string) => {
		const updatedTweet = tweet.replace(/#\w*$/, `#${name}`);
		setTweet(updatedTweet);
		setShowHashtagSuggestions(false);
	};

	const handleSelectMention = (user: MentionUser) => {
		const updatedTweet = tweet.replace(/@\w*$/, `@${user.username}`);
		setTweet(updatedTweet);
		setShowMentionSuggestions(false);
	};

	const onGifClick = (gif: any) => {
		setMedias((prev) => [
			...prev,
			{ type: "image", file: null, url: gif.url },
		]);
		setShowGifPicker(false);
	}

	const onEmojiClick = (emoji: any) => {
		setTweet((prev) => prev + emoji.emoji);
	}

	return (
		<>

			{tweetDiffCount > 0 && (
				<div
					onClick={handleRefreshTweets}
					className="fixed rounded-full cursor-pointer top-10 w-[250px] h-[35px] flex items-center justify-center bg-(--blue) z-99"
				>
					<p className="">{tweetDiffCount} nouveaux tweets</p>
				</div>
			)}

			<div className="w-[90%] [@media(min-width:987px)]:w-[50%] m-auto h-auto">
				<div className="relative w-full h-auto py-5 bg-[var(--secondary)] rounded-xl flex items-start">
					<Image
						width={200}
						height={200}
						className="ml-10 rounded-full w-[60px] h-[60px] p-1 object-cover"
						src={
							userData?.icon ? userData.icon : "/img/default_user_icon.png"
						}
						alt="avatar"
					/>

					<div className="flex flex-col relative items-start justify-start w-[80%] ml-5">
						<textarea
							onKeyDown={(e) => e.code == "Enter" && handlePostTweet()}
							value={tweet}
							onChange={handleChange}
							placeholder="Quoi de neuf ?!"
							className="block w-[100%] max-xl:w-[90%] p-3 border border-[var(--border-input)] focus:outline-none rounded-lg bg-[var(--input)] text-[var(--text-primary)]"
						/>

						{showGifPicker && (
							<div className="mt-5 w-[90%] h-[500px]">
								<GifPicker height="100%" width="auto" locale="fr-FR" country="FR" theme={theme ?? "light"} onGifClick={onGifClick} tenorApiKey="AIzaSyC-i3zYnHZu-0tpD4qcIOwsfBGcoNrfAzI" />
							</div>
						)}

						{showEmojis && (
							<div className="mt-5 w-[90%] h-[500px]">
								<EmojiPicker height="100%" width="auto" onEmojiClick={onEmojiClick} theme={theme ?? "light"} />
							</div>
						)}

						{showHashtagSuggestions && filteredHashtags.length > 0 && (
							<ul className="absolute left-0 top-11 w-full border border-gray-300 shadow-md rounded-md mt-1 max-h-40 overflow-auto z-50 bg-(--secondary)">
								{filteredHashtags.map((tag) => (
									<li
										key={tag.id}
										className="p-2 bg-(--secondary) cursor-pointer hover:bg-gray-200"
										onClick={() => handleSelectHashtag(tag.name)}
									>
										#{tag.name}
									</li>
								))}
							</ul>
						)}

						{showMentionSuggestions && mentionResults.length > 0 && (
							<ul className="absolute left-0 top-11 w-full border border-gray-300 shadow-md rounded-md mt-1 max-h-40 overflow-auto z-50 bg-(--secondary)">
								{mentionResults.map((u) => (
									<li
										key={u.id}
										className="flex items-center gap-2 p-2 bg-(--secondary) cursor-pointer hover:bg-gray-200"
										onClick={() => handleSelectMention(u)}
									>
										<img
											src={u.icon || "/img/default_user_icon.png"}
											alt="icon"
											className="w-6 h-6 rounded-full object-cover"
										/>
										<div className="flex flex-col">
											<p className="font-semibold text-[var(--text-primary)] leading-4">
												{u.firstname} {u.lastname}
											</p>
											<p className="text-xs opacity-70 leading-4">
												@{u.username}
											</p>
										</div>
									</li>
								))}
							</ul>
						)}

						{/* Preview des medias */}
						{medias.map((element, index) => {
							if (element.type === "image") {
								return (
									<div
										key={index}
										className="width-[72.5%] h-auto relative"
									>
										<div
											onClick={() => resetImageFile(index)}
											className="cursor-pointer absolute h-[35px] w-[35px] bg-[var(--light-grey-bg)] right-3 top-3 rounded-full flex items-center justify-center"
										>
											<span className="material-icons-outlined text-[var(--white)] text-xs">
												close
											</span>
										</div>
										<img
											className="mt-5 rounded-lg max-w-[72.5%]"
											src={element.url}
										/>
									</div>
								);
							} else if (element.type === "video") {
								return (
									<div
										key={index}
										className="width-[72.5%] h-auto relative"
									>
										<div
											onClick={() => resetImageFile(index)}
											className="cursor-pointer absolute h-[35px] w-[35px] bg-[var(--light-grey-bg)] right-3 top-3 rounded-full flex items-center justify-center"
										>
											<span className="material-icons-outlined text-[var(--white)] text-xs">
												close
											</span>
										</div>
										<video
											className="mt-5 rounded-lg max-w-[72.5%]"
											src={element.url}
											controls
										/>
									</div>
								);
							}
						})}

						<div className="w-[100%] mt-5 flex flex-col justify-center">
							<div className="flex flex-wrap items-center gap-2">
								<button
									onClick={handleFileUpload}
									className="col-span-2 text-sm cursor-pointer flex items-center justify-center gap-2 text-[var(--text-primary)] bg-transparent hover:opacity-50 font-semibold py-2 px-4 border-2 border-[var(--border-grey-light)] rounded-full"
								>
									<span className="material-icons-outlined text-[var(--blue)] text-xs">
										photo_library
									</span>
									{isMobile ? (
										null
									) : (
										<>Joinder des Médias</>
									)}
								</button>
								<button
									onClick={() => {
										setShowEmojis(false)
										setShowGifPicker(!showGifPicker)
									}}
									className="col-span-1 text-sm cursor-pointer flex items-center justify-center gap-2 text-[var(--text-primary)] bg-transparent hover:opacity-50 font-semibold py-2 px-4 border-2 border-[var(--border-grey-light)] rounded-full"
								>
									<span className="material-icons-outlined text-[var(--blue)] text-xs">
										gif_box
									</span>
									{isMobile ? (
										null
									) : (
										<>GIF</>
									)}
								</button>
								<button
									onClick={() => {
										setShowGifPicker(false)
										setShowEmojis(!showEmojis)
									}}
									className="col-span-1 text-sm cursor-pointer flex items-center justify-center gap-2 text-[var(--text-primary)] bg-transparent hover:opacity-50 font-semibold py-2 px-4 border-2 border-[var(--border-grey-light)] rounded-full"
								>
									<span className="material-icons-outlined text-[var(--blue)] text-xs">
										emoji_people
									</span>
									{isMobile ? (
										null
									) : (
										<>Emoji</>
									)}
								</button>

								<button
									onClick={handlePostTweet}
									type="button"
									className=" w-fit text-white cursor-pointer bg-[var(--blue)] hover:opacity-70 font-medium rounded-full text-sm text-center flex justify-center items-center gap-2 py-2 px-4"
								>
									<span className="material-icons-outlined text-center text-[var(--white)] text-xs">
										send
									</span>
									{isMobile ? (
										null
									) : (
										<>Poster</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="pb-5">
					<Tweets hashtag={null} page="home" refreshTweets={refreshTweets} />
				</div>
			</div>


			<OrbeDraggable userIcon={userData?.icon} />
		</>
	);
}

function OrbeDraggable({ userIcon }: { userIcon?: string }) {
	const router = useRouter();

	const orbeRef = useRef<HTMLDivElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [selectedUser, setSelectedUser] = useState<any>(null);

	useEffect(() => {
		if (orbeRef.current) {
			const savedPos = localStorage.getItem("orbPosition");
			if (savedPos) {
				const { x, y } = JSON.parse(savedPos);
				gsap.set(orbeRef.current, { x, y });
			}

			const drag = Draggable.create(orbeRef.current, {
				type: "x,y",
				inertia: false,
				bounds: window,
				dragClickables: false,
				ignore: "input, textarea, button, svg",
				onPress: function () {
					const rect = this.target.getBoundingClientRect();
					this.offsetX = this.pointerX - rect.left;
					this.offsetY = this.pointerY - rect.top;
				},
				onDrag: function () {
					this.x = this.pointerX - this.offsetX;
					this.y = this.pointerY - this.offsetY;
				},
				onRelease: function () {
					localStorage.setItem(
						"orbPosition",
						JSON.stringify({ x: this.x, y: this.y })
					);
				},
			});

			return () => {
				drag.forEach((d) => d.kill());
			};
		}
	}, []);

	const toggleMenu = () => {
		if (!menuOpen) {
			setSearchValue("");
			setSearchResults([]);
			setSelectedUser(null);
		}
		setMenuOpen(!menuOpen);
	};

	const handleSearchChange = async (val: string) => {
		setSearchValue(val);
		if (!val.trim()) {
			setSearchResults([]);
			setSelectedUser(null);
			return;
		}
		try {
			const res = await fetch(`/api/users?search=${encodeURIComponent(val)}`);
			const data = await res.json();
			if (Array.isArray(data)) {
				setSearchResults(data);
			} else {
				setSearchResults([]);
			}
		} catch (error) {
			console.log("Erreur recherche:", error);
			setSearchResults([]);
		}
	};

	const handleSelectUser = (user: any) => {
		setSelectedUser(user);
	};

	const voirProfil = () => {
		if (!selectedUser) return;
		router.push(`/profiles/${selectedUser.username}`);
	};

	const envoyerMessage = () => {
		if (!selectedUser) return;
		router.push(`/messages?toUser=${selectedUser.id}`);
	};

	return (
		<div
			ref={orbeRef}
			className="fixed z-[9999] cursor-pointer flex items-center justify-center"
			style={{
				right: "50px",
				bottom: "50px",
				width: "80px",
				height: "80px",
				borderRadius: "50%",
				background: userIcon
					? `url(${userIcon}) no-repeat center/cover`
					: "linear-gradient(135deg, #1DA1F2, #0a74da)",
				boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
			}}
		>
			<div
				onClick={toggleMenu}
				className="w-full h-full flex items-center justify-center pointer-events-auto"
			>
				{!userIcon && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="white"
						className="w-8 h-8"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
						/>
					</svg>
				)}
			</div>

			{menuOpen && (
				<div
					className="absolute bg-white text-black dark:bg-gray-800 dark:text-white rounded-md shadow-md p-2 pointer-events-auto"
					style={{
						left: "85px",
						top: "0px",
						width: "180px",
					}}
				>
					{!selectedUser && (
						<div>
							<input
								type="text"
								value={searchValue}
								onChange={(e) => handleSearchChange(e.target.value)}
								placeholder="Rechercher un user"
								className="w-full p-2 mb-2 bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded focus:outline-none"
							/>
							{searchResults.length > 0 ? (
								<div className="max-h-[120px] overflow-y-auto">
									{searchResults.map((u: any) => (
										<div
											key={u.id}
											onClick={() => handleSelectUser(u)}
											className="cursor-pointer px-3 py-2 mb-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center gap-2 object-cover"
										>
											<img
												src={u.icon || "/img/default_user_icon.png"}
												alt="icon"
												className="w-6 h-6 rounded-full"
											/>
											<div>
												<p className="font-semibold">
													{u.firstname} {u.lastname}
												</p>
												<p className="text-xs opacity-70">@{u.username}</p>
											</div>
										</div>
									))}
								</div>
							) : (
								searchValue && <p className="text-sm">Aucun résultat</p>
							)}
						</div>
					)}

					{selectedUser && (
						<div>
							<p className="text-sm mb-2">
								Sélection:{" "}
								<span className="font-semibold">@{selectedUser.username}</span>
							</p>
							<button
								onClick={voirProfil}
								className="block w-full text-left px-3 py-2 mb-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
							>
								Voir le profil
							</button>
							<button
								onClick={envoyerMessage}
								className="block w-full text-left px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
							>
								Envoyer un message
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}