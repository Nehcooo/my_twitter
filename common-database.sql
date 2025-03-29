--
-- Database: `twitter_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `following_user_id` int(11) NOT NULL,
  `followed_user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `follows`
--

INSERT INTO `follows` (`following_user_id`, `followed_user_id`, `created_at`) VALUES
(5, 9, '2025-02-24 10:33:43'),
(8, 5, '2025-02-24 10:33:29'),
(8, 6, '2025-02-24 10:33:51');

-- --------------------------------------------------------

--
-- Table structure for table `hastag_list`
--

CREATE TABLE `hastag_list` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hastag_list`
--

INSERT INTO `hastag_list` (`id`, `name`, `created_at`) VALUES
(1, 'bonjour', '2025-02-24 10:32:18'),
(2, 'salut', '2025-02-24 10:32:28'),
(3, 'js', '2025-02-24 10:32:28');

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` int(11) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `from_user_id` int(11) DEFAULT NULL,
  `to_user_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `unread` tinyint(1) DEFAULT 1,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`id`, `type`, `from_user_id`, `to_user_id`, `message`, `unread`, `is_deleted`, `created_at`) VALUES
(1, 'sender', 8, 5, 'bonjour', 1, 0, '2025-02-24 10:34:50'),
(2, 'receiver', 5, 8, 'bonjour', 1, 0, '2025-02-24 10:34:50'),
(3, 'sender', 8, 5, 'ca va toi', 1, 0, '2025-02-24 10:35:44'),
(4, 'receiver', 5, 8, 'ca va toi', 1, 0, '2025-02-24 10:35:44');

-- --------------------------------------------------------

--
-- Table structure for table `tweets`
--

CREATE TABLE `tweets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `type` enum('original','retweet','reply') DEFAULT NULL,
  `tweet` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `mention` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tweets`
--

INSERT INTO `tweets` (`id`, `user_id`, `parent_id`, `type`, `tweet`, `image`, `mention`, `is_deleted`, `created_at`) VALUES
(1, 8, NULL, 'original', 'lorem ipsum dolor ', 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fletsenhance.io%2Ffr&psig=AOvVaw26IotafvvRAtFvnIONrtqJ&ust=1740479266854000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMjS0dWM3IsDFQAAAAAdAAAAABAE', NULL, 0, '2025-02-24 10:27:59'),
(2, 5, 1, 'retweet', 'je retweet l\'id 1', 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fgratisography.com%2F&psig=AOvVaw26IotafvvRAtFvnIONrtqJ&ust=1740479266854000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMjS0dWM3IsDFQAAAAAdAAAAABAI', 'murat710', 0, '2025-02-24 10:29:47'),
(3, 9, 1, 'reply', 'je commente le tweet de l\'id 1', 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.shutterstock.com%2Ffr%2Fdiscover%2Ffree-nature-images&psig=AOvVaw26IotafvvRAtFvnIONrtqJ&ust=1740479266854000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMjS0dWM3IsDFQAAAAAdAAAAABAQ', 'murat710', 0, '2025-02-24 10:31:04');

-- --------------------------------------------------------

--
-- Table structure for table `tweets_hastag`
--

CREATE TABLE `tweets_hastag` (
  `id` int(11) NOT NULL,
  `tweets_id` int(11) DEFAULT NULL,
  `hastag_list_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tweets_hastag`
--

INSERT INTO `tweets_hastag` (`id`, `tweets_id`, `hastag_list_id`, `created_at`) VALUES
(1, 1, 3, '2025-02-24 10:32:42'),
(2, 2, 2, '2025-02-24 10:32:54');

-- --------------------------------------------------------

--
-- Table structure for table `tweets_like`
--

CREATE TABLE `tweets_like` (
  `id` int(11) NOT NULL,
  `tweets_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tweets_like`
--

INSERT INTO `tweets_like` (`id`, `tweets_id`, `user_id`, `created_at`) VALUES
(1, 3, 5, '2025-02-24 10:33:06'),
(2, 1, 6, '2025-02-24 10:33:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `icon` text DEFAULT NULL,
  `banner` text DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_token` text DEFAULT NULL,
  `reset_password_expires` timestamp(3) NULL DEFAULT NULL,
  `reset_password_token` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `update_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `lastname`, `firstname`, `email`, `password`, `birthdate`, `icon`, `banner`, `github`, `linkedin`, `bio`, `is_deleted`, `email_verified`, `verification_token`, `reset_password_expires`, `reset_password_token`, `created_at`, `update_at`) VALUES
(5, 'johndoe6', 'doe', 'john', 'johndoe6@email.com', '$2b$10$okDfE4O0/hok9qWCShUvn.2To6KB1ABHLToEU.g9yGOk6wOBYu4eO', '2003-08-08', NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, '2025-02-24 10:07:31', '2025-02-24 10:07:31'),
(6, 'murat710', 'aydin', 'murathan', 'Murathan0308@gmail.com', '$2b$10$oFlpzYu5WD0JOywCkZrVMePOEQVUFGIuAqd8axcvIrFU1MFcY0F7a', '2003-08-08', NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, '2025-02-24 10:17:57', '2025-02-24 10:17:57'),
(8, 'jhbkr', 'BAKARI', 'Jihad', 'jihad269200@gmail.com', '$2b$10$ChQRMROLrJIq9.99m2TUB.uisWGhJzjl0HY.8o5ziYAJW.V7erAKe', '2003-07-14', NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, '2025-02-24 10:21:14', '2025-02-24 10:21:14'),
(9, 'mehdi', 'mehdi', 'mehdi', 'mehdi@gmail.com', '$2b$10$0sffWegJSpdce6iHkGUnTuXTnWJcZRO2WQHSwmCsa8zQV7rHBuv0.', '2000-10-10', NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, '2025-02-24 10:21:23', '2025-02-24 10:21:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`following_user_id`,`followed_user_id`),
  ADD KEY `followed_user_id` (`followed_user_id`);

--
-- Indexes for table `hastag_list`
--
ALTER TABLE `hastag_list`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `to_user_id` (`to_user_id`);

--
-- Indexes for table `tweets`
--
ALTER TABLE `tweets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `tweets_hastag`
--
ALTER TABLE `tweets_hastag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tweets_id` (`tweets_id`),
  ADD KEY `hastag_list_id` (`hastag_list_id`);

--
-- Indexes for table `tweets_like`
--
ALTER TABLE `tweets_like`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tweets_id` (`tweets_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `hastag_list`
--
ALTER TABLE `hastag_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tweets`
--
ALTER TABLE `tweets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tweets_hastag`
--
ALTER TABLE `tweets_hastag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tweets_like`
--
ALTER TABLE `tweets_like`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`following_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`followed_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `message_ibfk_1` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `message_ibfk_2` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `tweets`
--
ALTER TABLE `tweets`
  ADD CONSTRAINT `tweets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `tweets_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `tweets` (`id`);

--
-- Constraints for table `tweets_hastag`
--
ALTER TABLE `tweets_hastag`
  ADD CONSTRAINT `tweets_hastag_ibfk_1` FOREIGN KEY (`tweets_id`) REFERENCES `tweets` (`id`),
  ADD CONSTRAINT `tweets_hastag_ibfk_2` FOREIGN KEY (`hastag_list_id`) REFERENCES `hastag_list` (`id`);

--
-- Constraints for table `tweets_like`
--
ALTER TABLE `tweets_like`
  ADD CONSTRAINT `tweets_like_ibfk_1` FOREIGN KEY (`tweets_id`) REFERENCES `tweets` (`id`),
  ADD CONSTRAINT `tweets_like_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
