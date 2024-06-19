import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// DATABASE CONNECTION //
const db = new pg.Client({
    user:"postgres",
    host: "localhost",
    database: "books&friends",
    password: "12348765",
    port: 5432
});
db.connect();

app.get("/", (req, res) => {
    res.render("index.ejs", {});
})

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

let books = [];
app.get("/library", (req, res) => {
    var query = "SELECT * FROM booksdata"

    db.query(query, (errq, resq) => {
        if (errq)  {
            console.error("Error executing query", errq.stack);
        } else {
            books = resq.rows;

            console.log(books);

            res.render("library.ejs", {books:books});
        }
    })
    
});

app.get("/newBook", (req, res) => {
    res.render("newBook.ejs");
});

app.get("/generalInfo", (req, res) => {
    res.render("generalInfo.ejs");
});

app.get("/privacy", (req, res) => {
    res.render("privacy.ejs");
});

app.post("/register", async(req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password[0]

    try{
        const checkResult = await db.query("SELECT * FROM usersdata WHERE email = $1", [email]);

        if (checkResult.rows.length > 0) {
            res.send("Email already registered. Please log in instead.");
        } else {
            const result = await db.query("INSERT INTO usersdata (name, email, password) VALUES ($1, $2, $3)",
            [username, email, password]);
            console.log(result);
            res.render("library.ejs");
        }
    } catch (err) {
        console.log(err);
    }
    
});

app.post("/login", async(req, res) => {
    const email = req.body.email
    const password = req.body.password
    
    try {
        const checkEmail = await db.query("SELECT * FROM usersdata WHERE email = $1", [email]);
        
        if(checkEmail.rows.length > 0){
                        
            const user = checkEmail.rows[0];
            const userPassword = user.password;

            if (userPassword === password){
                res.redirect("/library")
            } else {
                res.send ("Incorrect password");
            }
        } else {
            res.send("Email is not registered. Please register first to log in.")
        }
    } catch (err) {
        console.log(err);
    }

});

app.post("/newBook", async(req, res) => {
    const bookTitle = req.body.bookTitle
    const bookAuthor = req.body.bookAuthor
    const bookImage = req.body.bookImage

    const result = await db.query("INSERT INTO booksdata (title, author, image) VALUES ($1, $2, $3)",
    [bookTitle, bookAuthor, bookImage]);
    console.log(result);
    res.render("library.ejs");

});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});