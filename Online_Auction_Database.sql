CREATE DATABASE online_auction_db;

USE online_auction_db;
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (seller_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);
CREATE TABLE Auctions (
    auction_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    seller_id INT NOT NULL,
    starting_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')
        DEFAULT 'PENDING',

    FOREIGN KEY (product_id)
        REFERENCES Products(product_id),

    FOREIGN KEY (seller_id)
        REFERENCES Users(user_id)
);
CREATE TABLE Bids (
    bid_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    buyer_id INT NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (auction_id)
        REFERENCES Auctions(auction_id)
        ON DELETE CASCADE,

    FOREIGN KEY (buyer_id)
        REFERENCES Users(user_id)
);
CREATE TABLE Watchlist (
    watchlist_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    auction_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (buyer_id, auction_id),

    FOREIGN KEY (buyer_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (auction_id)
        REFERENCES Auctions(auction_id)
        ON DELETE CASCADE
);
CREATE TABLE Payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    buyer_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,

    payment_status ENUM(
        'PENDING',
        'COMPLETED',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'PENDING',

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (auction_id)
        REFERENCES Auctions(auction_id),

    FOREIGN KEY (buyer_id)
        REFERENCES Users(user_id)
);
CREATE TABLE Settlements (
    settlement_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    seller_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,

    settlement_status ENUM(
        'PENDING',
        'COMPLETED'
    ) DEFAULT 'PENDING',

    settlement_date TIMESTAMP NULL,

    FOREIGN KEY (payment_id)
        REFERENCES Payments(payment_id),

    FOREIGN KEY (seller_id)
        REFERENCES Users(user_id)
);
CREATE TABLE Disputes (
    dispute_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    reason TEXT NOT NULL,

    status ENUM(
        'OPEN',
        'UNDER_REVIEW',
        'RESOLVED'
    ) DEFAULT 'OPEN',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (auction_id)
        REFERENCES Auctions(auction_id),

    FOREIGN KEY (buyer_id)
        REFERENCES Users(user_id),

    FOREIGN KEY (seller_id)
        REFERENCES Users(user_id)
);
CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);