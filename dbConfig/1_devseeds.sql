INSERT INTO users (username, email, password_digest)
VALUES
('ewhite', 'ewhite@gmai.com', 'noplease'),
('rhi', 'rhi@gmail.com', 'yesplease');

INSERT INTO habits (name, frequency_id, complete, streak, user_id)
VALUES
('Drink water', 1, 0, 5, 3),
('Eat veg', 2, 0, 5, 3),
('Work out', 3, 0, 3, 3),
('Work out', 3, 0, 3, 3),
('Work out', 3, 0, 3, 3);


INSERT INTO frequency (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
VALUES
(FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE),
(TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),
(TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE);


INSERT INTO subhabits (name, complete, habit_id)
VALUES
('9am', 1645542341803, 1),
('10am', 1645715158000, 1),
('9am', 0, 2);
