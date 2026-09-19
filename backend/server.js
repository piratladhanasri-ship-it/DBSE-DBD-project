const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");


// ======================================================
// APP + SOCKET.IO
// ======================================================

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = 5000;

const JWT_SECRET =
  process.env.JWT_SECRET || "lusso-auction-secret-change-me";


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());


// ======================================================
// IMAGE UPLOAD
// ======================================================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const filename =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000000) +
      ext;

    cb(null, filename);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  }
});

app.use("/uploads", express.static(uploadDir));


// ======================================================
// MYSQL DATABASE
// ======================================================

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "online_auction_db"
});

db.connect(function (err) {
  if (err) {
    console.error("❌ MySQL connection failed:");
    console.error(err.message);
  } else {
    console.log("✅ MySQL connected successfully!");
  }
});


// ======================================================
// DATABASE HELPER
// ======================================================

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve({
          rows,
          fields
        });
      }
    });
  });
}


// ======================================================
// TRANSACTION HELPERS
// ======================================================

function beginTransaction() {
  return new Promise((resolve, reject) => {
    db.beginTransaction(function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function commitTransaction() {
  return new Promise((resolve, reject) => {
    db.commit(function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function rollbackTransaction() {
  return new Promise((resolve) => {
    db.rollback(function () {
      resolve();
    });
  });
}


// ======================================================
// JWT
// ======================================================

function createToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}


function authenticate(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Login required."
    });
  }

  const token = header.substring(7);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired login."
    });
  }
}


function allowRoles(...allowedRoles) {
  return function (req, res, next) {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied."
      });
    }

    next();
  };
}


// ======================================================
// NOTIFICATIONS
// ======================================================

function notifyUser(userId, message) {
  db.query(
    "INSERT INTO Notifications(user_id, message) VALUES (?, ?)",
    [userId, message],
    function () {
      io.to("user-" + userId).emit("notification", {
        message
      });
    }
  );
}


// ======================================================
// HOME
// ======================================================

app.get("/", function (req, res) {
  res.send("LUSSO Online Auction Backend is running!");
});


// ======================================================
// AUTH - SIGNUP
// ======================================================

app.post("/signup", async function (req, res) {
  const {
    name,
    email,
    password,
    role,
    phone
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Please fill all required fields."
    });
  }

  if (!["BUYER", "SELLER"].includes(role)) {
    return res.status(400).json({
      message: "Role must be BUYER or SELLER."
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      `INSERT INTO Users
       (name, email, password, role, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        role,
        phone || null
      ],
      function (err, result) {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              message: "Email already exists."
            });
          }

          console.error(err);

          return res.status(500).json({
            message: "Could not create account."
          });
        }

        const user = {
          user_id: result.insertId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          phone: phone || null
        };

        const token = createToken(user);

        res.json({
          message: "Signup successful!",
          user,
          token
        });
      }
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Signup failed."
    });
  }
});


// ======================================================
// AUTH - LOGIN
// ======================================================

app.post("/login", function (req, res) {
  const {
    email,
    password
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    });
  }

  db.query(
    "SELECT * FROM Users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()],
    async function (err, rows) {

      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Database error."
        });
      }

      if (!rows.length) {
        return res.status(401).json({
          message: "Invalid email or password."
        });
      }

      const databaseUser = rows[0];

      const validPassword = await bcrypt.compare(
        password,
        databaseUser.password
      );

      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid email or password."
        });
      }

      const user = {
        user_id: databaseUser.user_id,
        name: databaseUser.name,
        email: databaseUser.email,
        role: databaseUser.role,
        phone: databaseUser.phone
      };

      const token = createToken(user);

      res.json({
        message: "Login successful!",
        user,
        token
      });
    }
  );
});


// ======================================================
// CURRENT USER
// ======================================================

app.get("/me", authenticate, function (req, res) {

  db.query(
    `SELECT
       user_id,
       name,
       email,
       role,
       phone,
       created_at
     FROM Users
     WHERE user_id = ?`,
    [req.user.user_id],
    function (err, rows) {

      if (err) {
        return res.status(500).json({
          message: "Database error."
        });
      }

      if (!rows.length) {
        return res.status(404).json({
          message: "User not found."
        });
      }

      res.json(rows[0]);
    }
  );
});


// ======================================================
// AUCTION SELECT
// ======================================================

const auctionSelect = `
SELECT
    a.*,
    p.name AS product_name,
    p.description,
    p.category,
    p.image_url,
    u.name AS seller_name,

    (
      SELECT COUNT(*)
      FROM Bids b2
      WHERE b2.auction_id = a.auction_id
    ) AS bid_count

FROM Auctions a

JOIN Products p
ON a.product_id = p.product_id

JOIN Users u
ON a.seller_id = u.user_id
`;


// ======================================================
// GET ALL AUCTIONS
// ======================================================

app.get("/auctions", async function (req, res) {

  try {

    const result = await query(
      `${auctionSelect}
       ORDER BY a.auction_id DESC`
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Database error.",
      error: err.message
    });
  }
});


// ======================================================
// GET ONE AUCTION
// ======================================================

app.get("/auctions/:id", async function (req, res) {

  try {

    const result = await query(
      `${auctionSelect}
       WHERE a.auction_id = ?`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        message: "Auction not found."
      });
    }

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({
      message: "Database error."
    });
  }
});


// ======================================================
// CREATE AUCTION
// ======================================================

app.post(
  "/seller/auction",
  authenticate,
  allowRoles("SELLER", "ADMIN"),
  upload.single("image"),
  async function (req, res) {

    const {
      name,
      description,
      category,
      starting_price,
      duration,
      duration_unit
    } = req.body;

    if (!name || !starting_price || !duration) {
      return res.status(400).json({
        message: "Please fill all required fields."
      });
    }

    const units = {
      MINUTES: "MINUTE",
      HOURS: "HOUR",
      DAYS: "DAY"
    };

    const selectedUnit =
      units[duration_unit || "DAYS"];

    if (!selectedUnit) {
      return res.status(400).json({
        message: "Invalid duration unit."
      });
    }

    const durationValue = Number(duration);

    if (
      !Number.isFinite(durationValue) ||
      durationValue <= 0
    ) {
      return res.status(400).json({
        message: "Duration must be greater than zero."
      });
    }

    try {

      await beginTransaction();

      const imagePath = req.file
        ? "/uploads/" + req.file.filename
        : null;


      // CREATE PRODUCT

      const productResult = await query(
        `INSERT INTO Products
         (seller_id, name, description, category, image_url)
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          name.trim(),
          description || null,
          category || null,
          imagePath
        ]
      );


      // CREATE AUCTION

      const auctionResult = await query(
        `INSERT INTO Auctions
         (
           product_id,
           seller_id,
           starting_price,
           current_price,
           start_time,
           end_time,
           status
         )
         VALUES
         (
           ?,
           ?,
           ?,
           ?,
           NOW(),
           DATE_ADD(
             NOW(),
             INTERVAL ? ${selectedUnit}
           ),
           'ACTIVE'
         )`,
        [
          productResult.rows.insertId,
          req.user.user_id,
          Number(starting_price),
          Number(starting_price),
          durationValue
        ]
      );


      await commitTransaction();


      io.emit("auctionCreated", {
        auction_id: auctionResult.rows.insertId
      });


      res.json({
        message: "Auction created successfully!",
        auction_id: auctionResult.rows.insertId
      });

    } catch (err) {

      await rollbackTransaction();

      console.error(err);

      res.status(500).json({
        message: "Could not create auction.",
        error: err.message
      });
    }
  }
);


// ======================================================
// GET BIDS FOR AUCTION
// ======================================================

app.get(
  "/auctions/:id/bids",
  authenticate,
  async function (req, res) {

    try {

      const result = await query(
        `SELECT
           b.bid_id,
           b.auction_id,
           b.buyer_id,
           b.bid_amount,
           b.bid_time,
           u.name AS buyer_name
         
         FROM Bids b

         JOIN Users u
         ON b.buyer_id = u.user_id

         WHERE b.auction_id = ?

         ORDER BY b.bid_time DESC`,
        [req.params.id]
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Could not load bids."
      });
    }
  }
);


// ======================================================
// BUYER'S BIDS
// ======================================================

app.get(
  "/my-bids",
  authenticate,
  allowRoles("BUYER"),
  async function (req, res) {

    try {

      const result = await query(
        `SELECT
           b.*,
           p.name AS product_name,
           a.current_price,
           a.status,
           a.end_time

         FROM Bids b

         JOIN Auctions a
         ON b.auction_id = a.auction_id

         JOIN Products p
         ON a.product_id = p.product_id

         WHERE b.buyer_id = ?

         ORDER BY b.bid_time DESC`,
        [req.user.user_id]
      );

      res.json(result.rows);

    } catch (err) {

      res.status(500).json({
        message: "Could not load bids."
      });
    }
  }
);


// ======================================================
// PLACE BID - REAL TIME
// ======================================================

app.post(
  "/bids",
  authenticate,
  allowRoles("BUYER"),
  async function (req, res) {

    const auctionId = Number(req.body.auction_id);
    const amount = Number(req.body.bid_amount);

    if (
      !auctionId ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "Enter a valid bid."
      });
    }


    try {

      // START TRANSACTION

      await beginTransaction();


      // LOCK AUCTION ROW

      const auctionResult = await query(
        `SELECT *
         FROM Auctions
         WHERE auction_id = ?
         FOR UPDATE`,
        [auctionId]
      );


      if (!auctionResult.rows.length) {

        await rollbackTransaction();

        return res.status(404).json({
          message: "Auction not found."
        });
      }


      const auction = auctionResult.rows[0];


      const currentPrice = Number(
        auction.current_price ||
        auction.starting_price
      );


      const endTime = new Date(
        auction.end_time
      );


      // CHECK STATUS

      if (auction.status !== "ACTIVE") {

        await rollbackTransaction();

        return res.status(400).json({
          message: "Auction is not active."
        });
      }


      // CHECK TIME

      if (endTime <= new Date()) {

        await rollbackTransaction();

        return res.status(400).json({
          message: "Auction has ended."
        });
      }


      // CHECK BID VALUE

      if (amount <= currentPrice) {

        await rollbackTransaction();

        return res.status(400).json({
          message:
            `Your bid must be higher than ₹${currentPrice.toLocaleString("en-IN")}.`
        });
      }


      // INSERT BID

      const bidResult = await query(
        `INSERT INTO Bids
         (auction_id, buyer_id, bid_amount)
         VALUES (?, ?, ?)`,
        [
          auctionId,
          req.user.user_id,
          amount
        ]
      );


      // ==================================================
      // ANTI-SNIPING
      // ==================================================

      const millisecondsRemaining =
        endTime.getTime() - Date.now();

      let newEndTime = null;

      if (
        millisecondsRemaining <=
        2 * 60 * 1000
      ) {

        await query(
          `UPDATE Auctions
           SET
             current_price = ?,
             end_time =
               DATE_ADD(
                 end_time,
                 INTERVAL 2 MINUTE
               )
           WHERE auction_id = ?`,
          [
            amount,
            auctionId
          ]
        );

        newEndTime = new Date(
          endTime.getTime() +
          2 * 60 * 1000
        );

      } else {

        await query(
          `UPDATE Auctions
           SET current_price = ?
           WHERE auction_id = ?`,
          [
            amount,
            auctionId
          ]
        );
      }


      // COMMIT

      await commitTransaction();


      // ==================================================
      // REAL-TIME SOCKET EVENT
      // ==================================================

      const payload = {

        auction_id: auctionId,

        bid_id:
          bidResult.rows.insertId,

        buyer_id:
          req.user.user_id,

        buyer_name:
          req.user.name,

        bid_amount:
          amount,

        new_price:
          amount,

        bid_time:
          new Date().toISOString(),

        extended:
          Boolean(newEndTime),

        new_end_time:
          newEndTime
            ? newEndTime.toISOString()
            : null
      };


      // SEND TO EVERYONE WATCHING AUCTION

      io
        .to("auction-" + auctionId)
        .emit(
          "bidUpdate",
          payload
        );


      // ALSO SEND GLOBALLY

      io.emit(
        "bidUpdate",
        payload
      );


      // NOTIFY SELLER

      notifyUser(
        auction.seller_id,

        `New bid of ₹${amount.toLocaleString("en-IN")} on auction #${auctionId}.`
      );


      res.json({
        message: newEndTime
          ? "Bid placed! Auction extended by 2 minutes."
          : "Bid placed successfully!",

        ...payload
      });


    } catch (err) {

      await rollbackTransaction();

      console.error(
        "Bid error:",
        err
      );

      res.status(500).json({
        message: "Could not place bid.",
        error: err.message
      });
    }
  }
);


// ======================================================
// WATCHLIST
// ======================================================

app.get(
  "/watchlist/:buyer_id",
  authenticate,
  allowRoles("BUYER"),
  async function (req, res) {

    if (
      Number(req.params.buyer_id) !==
      Number(req.user.user_id)
    ) {
      return res.status(403).json({
        message: "Access denied."
      });
    }

    try {

      const result = await query(
        `SELECT
           w.*,
           a.current_price,
           a.starting_price,
           a.status,
           a.end_time,
           p.name AS product_name,
           p.image_url,
           p.category,
           p.description

         FROM Watchlist w

         JOIN Auctions a
         ON w.auction_id = a.auction_id

         JOIN Products p
         ON a.product_id = p.product_id

         WHERE w.buyer_id = ?

         ORDER BY w.added_at DESC`,
        [req.user.user_id]
      );

      res.json(result.rows);

    } catch (err) {

      res.status(500).json({
        message: "Could not load watchlist."
      });
    }
  }
);


app.post(
  "/watchlist",
  authenticate,
  allowRoles("BUYER"),
  async function (req, res) {

    const auctionId =
      Number(req.body.auction_id);

    if (!auctionId) {
      return res.status(400).json({
        message: "Auction ID required."
      });
    }

    try {

      const existing = await query(
        `SELECT watchlist_id
         FROM Watchlist
         WHERE buyer_id = ?
         AND auction_id = ?`,
        [
          req.user.user_id,
          auctionId
        ]
      );


      if (existing.rows.length) {

        await query(
          `DELETE FROM Watchlist
           WHERE buyer_id = ?
           AND auction_id = ?`,
          [
            req.user.user_id,
            auctionId
          ]
        );

        return res.json({
          message:
            "Removed from watchlist.",
          added: false
        });
      }


      const result = await query(
        `INSERT INTO Watchlist
         (buyer_id, auction_id)
         VALUES (?, ?)`,
        [
          req.user.user_id,
          auctionId
        ]
      );


      res.json({
        message:
          "Added to watchlist.",

        added: true,

        watchlist_id:
          result.rows.insertId
      });

    } catch (err) {

      res.status(500).json({
        message:
          "Could not update watchlist."
      });
    }
  }
);


// ======================================================
// NOTIFICATIONS
// ======================================================

app.get(
  "/notifications",
  authenticate,
  async function (req, res) {

    try {

      const result = await query(
        `SELECT *
         FROM Notifications
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [
          req.user.user_id
        ]
      );

      res.json(result.rows);

    } catch (err) {

      res.status(500).json({
        message:
          "Could not load notifications."
      });
    }
  }
);


app.put(
  "/notifications/read-all",
  authenticate,
  async function (req, res) {

    try {

      await query(
        `UPDATE Notifications
         SET is_read = TRUE
         WHERE user_id = ?`,
        [
          req.user.user_id
        ]
      );

      res.json({
        message:
          "Notifications marked as read."
      });

    } catch (err) {

      res.status(500).json({
        message:
          "Could not update notifications."
      });
    }
  }
);


// ======================================================
// FINALIZE AUCTION
// ======================================================

async function finalizeAuction(
  auctionId,
  force = false
) {

  try {

    const result = await query(
      `SELECT
         auction_id,
         seller_id,
         status,
         current_price,
         end_time

       FROM Auctions

       WHERE auction_id = ?`,
      [
        auctionId
      ]
    );


    if (!result.rows.length) {

      return {
        ok: false,
        reason: "NOT_FOUND"
      };
    }


    const auction =
      result.rows[0];


    if (
      auction.status !==
      "ACTIVE"
    ) {

      return {
        ok: false,
        reason: "ALREADY_ENDED"
      };
    }


    if (
      !force &&
      new Date(
        auction.end_time
      ).getTime() > Date.now()
    ) {

      return {
        ok: false,
        reason: "NOT_DUE"
      };
    }


    // CHANGE STATUS

    const updateResult =
      await query(
        `UPDATE Auctions

         SET status = 'COMPLETED'

         WHERE auction_id = ?

         AND status = 'ACTIVE'

         ${force
           ? ""
           : "AND end_time <= NOW()"
         }`,
        [
          auctionId
        ]
      );


    if (
      !updateResult.rows.affectedRows
    ) {

      return {
        ok: false,
        reason:
          "ALREADY_ENDED"
      };
    }


    // ==================================================
    // FIND HIGHEST BIDDER
    // ==================================================

    const winnerResult =
      await query(
        `SELECT
           b.bid_id,
           b.auction_id,
           b.buyer_id,
           b.bid_amount,
           b.bid_time,
           u.name AS buyer_name

         FROM Bids b

         JOIN Users u
         ON b.buyer_id = u.user_id

         WHERE b.auction_id = ?

         ORDER BY
           b.bid_amount DESC,
           b.bid_time ASC

         LIMIT 1`,
        [
          auctionId
        ]
      );


    const winner =
      winnerResult.rows[0] ||
      null;


    const finalPrice =
      winner
        ? Number(winner.bid_amount)
        : Number(
            auction.current_price || 0
          );


    // ==================================================
    // NOTIFY WINNER
    // ==================================================

    if (winner) {

      notifyUser(
        winner.buyer_id,

        `You won auction #${auctionId} for ₹${finalPrice.toLocaleString("en-IN")}.`
      );
    }


    // ==================================================
    // SOCKET.IO AUCTION COMPLETED
    // ==================================================

    const completedPayload = {

      auction_id:
        Number(auctionId),

      winner_id:
        winner
          ? Number(winner.buyer_id)
          : null,

      winner_name:
        winner
          ? winner.buyer_name
          : null,

      final_price:
        finalPrice
    };


    io.emit(
      "auctionCompleted",
      completedPayload
    );


    io
      .to("auction-" + auctionId)
      .emit(
        "auctionCompleted",
        completedPayload
      );


    return {

      ok: true,

      winner,

      final_price:
        finalPrice
    };


  } catch (err) {

    console.error(
      "Could not finalize auction:",
      err.message
    );

    return {
      ok: false,
      reason: "ERROR"
    };
  }
}


// ======================================================
// AUTOMATIC AUCTION ENDING
// ======================================================

let expiryCheckRunning = false;


async function expireAuctions() {

  if (expiryCheckRunning) {
    return;
  }

  expiryCheckRunning = true;


  try {

    const result =
      await query(
        `SELECT auction_id

         FROM Auctions

         WHERE status = 'ACTIVE'

         AND end_time <= NOW()

         ORDER BY end_time ASC

         LIMIT 50`
      );


    for (
      const auction
      of result.rows
    ) {

      await finalizeAuction(
        auction.auction_id,
        false
      );
    }


  } catch (err) {

    console.error(
      "Automatic auction expiry error:",
      err.message
    );

  } finally {

    expiryCheckRunning = false;
  }
}


// CHECK EVERY 5 SECONDS

setInterval(
  expireAuctions,
  5000
);


// CHECK ON STARTUP

setTimeout(
  expireAuctions,
  1000
);


// ======================================================
// SELLER - END AUCTION MANUALLY
// ======================================================

app.post(
  "/auctions/:id/complete",
  authenticate,
  allowRoles("SELLER", "ADMIN"),
  async function (req, res) {

    try {

      const result =
        await query(
          `SELECT
             auction_id,
             seller_id,
             status

           FROM Auctions

           WHERE auction_id = ?`,
          [
            req.params.id
          ]
        );


      if (!result.rows.length) {

        return res.status(404).json({
          message:
            "Auction not found."
        });
      }


      const auction =
        result.rows[0];


      if (
        req.user.role !== "ADMIN" &&
        Number(auction.seller_id) !==
          Number(req.user.user_id)
      ) {

        return res.status(403).json({
          message:
            "You can only end your own auctions."
        });
      }


      if (
        auction.status !==
        "ACTIVE"
      ) {

        return res.status(400).json({
          message:
            "This auction has already ended."
        });
      }


      const finalResult =
        await finalizeAuction(
          req.params.id,
          true
        );


      if (!finalResult.ok) {

        return res.status(400).json({
          message:
            "Could not complete the auction."
        });
      }


      res.json({

        message:
          finalResult.winner

            ? `Auction ended. ${finalResult.winner.buyer_name} won for ₹${Number(finalResult.final_price).toLocaleString("en-IN")}.`

            : "Auction ended. There were no bids.",

        winner:
          finalResult.winner,

        final_price:
          finalResult.final_price
      });


    } catch (err) {

      console.error(
        "Manual completion error:",
        err
      );

      res.status(500).json({
        message:
          "Could not complete auction."
      });
    }
  }
);


// ======================================================
// WON AUCTIONS
// ======================================================

app.get(
  "/won-auctions",
  authenticate,
  allowRoles("BUYER"),
  async function (req, res) {

    try {

      const result =
        await query(
          `SELECT
             a.auction_id,
             a.current_price,
             a.status,
             a.end_time,
             p.name AS product_name,
             p.image_url

           FROM Auctions a

           JOIN Products p
           ON a.product_id = p.product_id

           WHERE a.status = 'COMPLETED'

           AND EXISTS (

             SELECT 1

             FROM Bids b

             WHERE b.auction_id =
                   a.auction_id

             AND b.buyer_id = ?

             AND b.bid_amount = (

               SELECT MAX(b2.bid_amount)

               FROM Bids b2

               WHERE b2.auction_id =
                     a.auction_id
             )
           )

           ORDER BY a.end_time DESC`,
          [
            req.user.user_id
          ]
        );


      res.json(result.rows);

    } catch (err) {

      res.status(500).json({
        message:
          "Could not load won auctions."
      });
    }
  }
);


// ======================================================
// PAYMENTS
// ======================================================

app.post(
  "/payments",
  authenticate,
  allowRoles("BUYER"),
  async function (req, res) {

    const auctionId =
      Number(req.body.auction_id);

    const amount =
      Number(req.body.amount);


    if (
      !auctionId ||
      !amount
    ) {

      return res.status(400).json({
        message:
          "Auction and amount are required."
      });
    }


    try {

      const result =
        await query(
          `INSERT INTO Payments
           (
             auction_id,
             buyer_id,
             amount,
             payment_status
           )

           VALUES
           (
             ?,
             ?,
             ?,
             'COMPLETED'
           )`,
          [
            auctionId,
            req.user.user_id,
            amount
          ]
        );


      res.json({

        message:
          "Payment recorded successfully.",

        payment_id:
          result.rows.insertId
      });


    } catch (err) {

      res.status(500).json({
        message:
          "Could not record payment."
      });
    }
  }
);


// ======================================================
// GET PAYMENTS
// ======================================================

app.get(
  "/payments",
  authenticate,
  async function (req, res) {

    try {

      let sql = `
        SELECT
          pay.*,
          p.name AS product_name

        FROM Payments pay

        JOIN Auctions a
        ON pay.auction_id =
           a.auction_id

        JOIN Products p
        ON a.product_id =
           p.product_id
      `;

      const params = [];


      if (
        req.user.role !==
        "ADMIN"
      ) {

        sql += `
          WHERE pay.buyer_id = ?
        `;

        params.push(
          req.user.user_id
        );
      }


      sql += `
        ORDER BY
        pay.payment_date DESC
      `;


      const result =
        await query(
          sql,
          params
        );


      res.json(
        result.rows
      );


    } catch (err) {

      res.status(500).json({
        message:
          "Could not load payments."
      });
    }
  }
);


// ======================================================
// DISPUTES - CREATE
// ======================================================

app.post(
  "/disputes",
  authenticate,
  allowRoles("BUYER"),
  async function (req, res) {

    const auctionId =
      Number(req.body.auction_id);

    const reason =
      String(
        req.body.reason || ""
      ).trim();


    if (
      !auctionId ||
      !reason
    ) {

      return res.status(400).json({
        message:
          "Auction and reason are required."
      });
    }


    try {

      const auction =
        await query(
          `SELECT seller_id

           FROM Auctions

           WHERE auction_id = ?`,
          [
            auctionId
          ]
        );


      if (!auction.rows.length) {

        return res.status(404).json({
          message:
            "Auction not found."
        });
      }


      const sellerId =
        auction.rows[0].seller_id;


      const result =
        await query(
          `INSERT INTO Disputes
           (
             auction_id,
             buyer_id,
             seller_id,
             reason
           )

           VALUES
           (?, ?, ?, ?)`,
          [
            auctionId,
            req.user.user_id,
            sellerId,
            reason
          ]
        );


      notifyUser(
        sellerId,

        `A dispute was opened for auction #${auctionId}.`
      );


      res.json({

        message:
          "Dispute created.",

        dispute_id:
          result.rows.insertId
      });


    } catch (err) {

      res.status(500).json({
        message:
          "Could not create dispute."
      });
    }
  }
);


// ======================================================
// GET DISPUTES
// ======================================================

app.get(
  "/disputes",
  authenticate,
  async function (req, res) {

    try {

      let sql = `
        SELECT
          d.*,
          p.name AS product_name,
          ub.name AS buyer_name,
          us.name AS seller_name

        FROM Disputes d

        JOIN Auctions a
        ON d.auction_id =
           a.auction_id

        JOIN Products p
        ON a.product_id =
           p.product_id

        JOIN Users ub
        ON d.buyer_id =
           ub.user_id

        JOIN Users us
        ON d.seller_id =
           us.user_id
      `;

      const params = [];


      if (
        req.user.role !==
        "ADMIN"
      ) {

        sql += `
          WHERE
            d.buyer_id = ?
            OR d.seller_id = ?
        `;

        params.push(
          req.user.user_id,
          req.user.user_id
        );
      }


      sql += `
        ORDER BY
        d.created_at DESC
      `;


      const result =
        await query(
          sql,
          params
        );


      res.json(
        result.rows
      );


    } catch (err) {

      res.status(500).json({
        message:
          "Could not load disputes."
      });
    }
  }
);


// ======================================================
// ADMIN STATS
// ======================================================

app.get(
  "/admin/stats",
  authenticate,
  allowRoles("ADMIN"),
  async function (req, res) {

    try {

      const result =
        await query(
          `SELECT

             (
               SELECT COUNT(*)
               FROM Users
             ) AS users,

             (
               SELECT COUNT(*)
               FROM Products
             ) AS products,

             (
               SELECT COUNT(*)
               FROM Auctions
             ) AS auctions,

             (
               SELECT COUNT(*)
               FROM Bids
             ) AS bids,

             (
               SELECT COUNT(*)
               FROM Payments
             ) AS payments,

             (
               SELECT COUNT(*)
               FROM Disputes
             ) AS disputes`
        );


      res.json(
        result.rows[0]
      );


    } catch (err) {

      res.status(500).json({
        message:
          "Could not load stats."
      });
    }
  }
);


// ======================================================
// ADMIN USERS
// ======================================================

app.get(
  "/admin/users",
  authenticate,
  allowRoles("ADMIN"),
  async function (req, res) {

    try {

      const result =
        await query(
          `SELECT
             user_id,
             name,
             email,
             role,
             phone,
             created_at

           FROM Users

           ORDER BY
           user_id DESC`
        );


      res.json(
        result.rows
      );


    } catch (err) {

      res.status(500).json({
        message:
          "Could not load users."
      });
    }
  }
);


// ======================================================
// ADMIN DISPUTES
// ======================================================

app.get(
  "/admin/disputes",
  authenticate,
  allowRoles("ADMIN"),
  async function (req, res) {

    try {

      const result =
        await query(
          `SELECT
             d.*,
             p.name AS product_name,
             ub.name AS buyer_name,
             us.name AS seller_name

           FROM Disputes d

           JOIN Auctions a
           ON d.auction_id =
              a.auction_id

           JOIN Products p
           ON a.product_id =
              p.product_id

           JOIN Users ub
           ON d.buyer_id =
              ub.user_id

           JOIN Users us
           ON d.seller_id =
              us.user_id

           ORDER BY
           d.created_at DESC`
        );


      res.json(
        result.rows
      );


    } catch (err) {

      res.status(500).json({
        message:
          "Could not load disputes."
      });
    }
  }
);


// ======================================================
// ADMIN UPDATE DISPUTE
// ======================================================

app.put(
  "/disputes/:id",
  authenticate,
  allowRoles("ADMIN"),
  async function (req, res) {

    const allowedStatuses = [
      "OPEN",
      "UNDER_REVIEW",
      "RESOLVED"
    ];


    if (
      !allowedStatuses.includes(
        req.body.status
      )
    ) {

      return res.status(400).json({
        message:
          "Invalid dispute status."
      });
    }


    try {

      await query(
        `UPDATE Disputes

         SET status = ?

         WHERE dispute_id = ?`,
        [
          req.body.status,
          req.params.id
        ]
      );


      res.json({
        message:
          "Dispute updated."
      });


    } catch (err) {

      res.status(500).json({
        message:
          "Could not update dispute."
      });
    }
  }
);


// ======================================================
// SOCKET.IO
// ======================================================

io.on(
  "connection",
  function (socket) {

    console.log(
      "🔌 Socket connected:",
      socket.id
    );


    // USER ROOM

    socket.on(
      "joinUser",
      function (userId) {

        socket.join(
          "user-" + userId
        );
      }
    );


    // AUCTION ROOM

    socket.on(
      "joinAuction",
      function (auctionId) {

        socket.join(
          "auction-" + auctionId
        );

        console.log(
          `Socket ${socket.id} joined auction ${auctionId}`
        );
      }
    );


    // LEAVE AUCTION

    socket.on(
      "leaveAuction",
      function (auctionId) {

        socket.leave(
          "auction-" + auctionId
        );
      }
    );


    // DISCONNECT

    socket.on(
      "disconnect",
      function () {

        console.log(
          "🔌 Socket disconnected:",
          socket.id
        );
      }
    );
  }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  function (
    err,
    req,
    res,
    next
  ) {

    console.error(
      "Server error:",
      err
    );

    res.status(400).json({
      message:
        err.message ||
        "Server error."
    });
  }
);


// ======================================================
// START SERVER
// ======================================================

server.listen(
  PORT,
  function () {

    console.log(
      `🚀 LUSSO backend running at http://localhost:${PORT}`
    );
  }
);