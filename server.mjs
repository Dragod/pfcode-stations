import express from 'express'

import http from 'http'

import { Server } from 'socket.io'

import cors from 'cors'

import morgan from "morgan"

import { fileURLToPath } from 'url'

import { dirname } from 'path'

import sqlite3 from "sqlite3"

import rateLimit from "express-rate-limit"

import bcrypt from "bcrypt"

import {body, validationResult} from "express-validator"

import session from "express-session"

//import { v4 as uuidv4 } from 'uuid';

//import helmet from "helmet"

import favicon from "serve-favicon"

import * as dotenv from 'dotenv'

const app = express()

const server = http.createServer(app)

const io = new Server(server)

dotenv.config()

// open a database connection

let db = new sqlite3.Database('./pfcode-stations.db', (err) => {

    if (err) {

        console.error(err.message)

    }

    console.log('\nConnected to pfcode-stations database')

})


const PORT = process.env.PORT

const HOST = process.env.HOST

let url = ''

HOST.includes('localhost') ? url = `${HOST}:${PORT}` : url = HOST

const COOKIE_SECRET = process.env.COOKIE_SECRET

const REGISTER_ENDPOINT = process.env.REGISTER_ENDPOINT_ENABLED

console.log("\nCan register user:",REGISTER_ENDPOINT)

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const oneDay = 1000 * 60 * 60 * 24;


app.disable('x-powered-by')

const limiter = rateLimit({

    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 100000000, // 100 requests per window
})

// apply the limiter middleware to all requests

app.use(limiter)

// app.use(
//     helmet.contentSecurityPolicy({

//         directives: {

//             defaultSrc: ["'self'"],

//             scriptSrc: ["'self'", "https://unpkg.com","https://code.jquery.com/"]

//         }
//     })
// )

const corsOptions = {
    origin: url
}

app.use(cors(corsOptions))

app.use(morgan('dev'))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public'))

app.use(favicon('favicon.ico'))

// Middleware to check for valid session

app.use(session({

    secret: COOKIE_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: { maxAge: oneDay },

    name: 'pfcode-stations'

}))

const requireSession = (req, res, next) => {

    console.log("Checking for valid session")

    if (req.session && req.session.loggedIn) {

        // If session exists, continue to next middleware/route handler

        console.log("Session exists, continue to next middleware/route handler")

        next()

    }
    else {

        // If session doesn't exist, redirect to login page

        console.log("No session, redirect to login page")

        res.redirect('/login')

    }

}

// Define a middleware function to check if the register endpoint is enabled

function checkRegisterEndpoint(req, res, next) {

    if (REGISTER_ENDPOINT === 'true') {

      // If the endpoint is enabled, call the next middleware

        next()

    } else {

      // If the endpoint is disabled, return a 404 Not Found error

        res.sendFile(__dirname + '/public/errors/404.html')
    }

}

// Create a rate limiter for login attempts

const loginLimiter = rateLimit({

    windowMs: 60 * 60 * 1000, // 1 hour

    max: 5, // 5 attempts allowed per hour

    message: 'Too many login attempts, please try again later.'

})

app.get('/api/session-data', requireSession, function(req, res) {

    res.json({

        user: req.session,

        isAuthenticated: req.session.loggedIn

    })

})

app.get('/api/stations', requireSession, (req, res) => {

    let sql = `SELECT * FROM stations ORDER BY name asc`

    db.all(sql, [], (err, rows) => {

        if (err) {

        return res.status(500).json(err)

        }
        //console.log(rows)
        res.json(rows)

    })

})

app.get('/api/stations/fav', requireSession, (req, res) => {

    const sql = 'SELECT * FROM stations WHERE favorite = 1 ORDER BY name ASC';

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json(err)
        }

        console.log(rows)

        res.json(rows)

    })

})


app.get('/api/stations/:name', requireSession, (req, res) => {

    console.log(req.params.name)

    let sql = `SELECT id FROM stations where name = "${req.params.name}"`

    console.log(sql)

    db.get(sql, [], (err, row) => {

        if (err) {

            return res.status(500).json(err)

        }

        res.json(row)

    })

})

app.post('/api/stations', (req, res) => {

    let stationInsert = `INSERT INTO stations (name, url,favorite) VALUES ("${req.body.name}", "${req.body.url}", ${req.body.favorite})`

    console.log(stationInsert)

    db.run(stationInsert, [], (err,row) => {

        if (err) {

            return res.status(500).json(err)

        }

        res.send(row)

    })

})

app.put('/api/stations/:id',(req, res) => {

    console.log("this is req.body",req.body)

    let data = req.body

    console.log("this is id",data.id)

    let sql

    if(req.body.url === undefined || req.body.url === "" || req.body.url === null){

        sql = `
            UPDATE stations
            SET name = "${req.body.name}", favorite = ${req.body.favorite}
            WHERE id = "${req.body.id}"
        `

    }
    else if (req.body.name === undefined || req.body.name === "" || req.body.name === null){

        sql = `
            UPDATE stations
            SET url = "${req.body.url}", favorite = ${req.body.favorite}
            WHERE id = "${req.body.id}"
        `

    }
    else {

        sql = `
            UPDATE stations
            SET name = "${req.body.name}", url = "${req.body.url}", favorite = ${req.body.favorite}
            WHERE id = "${req.body.id}"
        `

    }

    console.log(sql)

    db.run(sql, [], (err, row) => {

        if (err) {

            console.log(err)

            res.status(500).send('Error updating station')

        }

        res.send(row)

    })

})

app.delete('/api/stations/:id', (req, res) => {

    let sql = `DELETE FROM stations WHERE id = "${req.params.id}"`

    db.run(sql, [], (err, row) => {

        if (err) {

            return res.status(500).json(err)

        }

        res.send(row)

    })

})

app.get('/api/users', requireSession, (req, res) => {

    db.all('SELECT * FROM users', (err, rows) => {

        if (err) {

        console.error(err.message)

        res.status(500).json({ message: 'Internal server error' });

        }
        else {

            res.json(rows)

        }

    })

})

app.get('/register', checkRegisterEndpoint, (req, res) => {
    res.sendFile(__dirname + '/public/register.html')
})

app.post('/api/users',[

    body('username').isLength({ min: 3 }).blacklist(' ').escape().withMessage('Username empty or min length < 3'),

    body('email').isEmail().normalizeEmail().escape().withMessage('Email empty or invalid'),

    body('password').isStrongPassword({minLength: 8}).withMessage(`
            Password empty or min length < 8`)

], async (req, res, next) => {

    res.set('Cache-Control', 'no-store')

    console.log(req.body)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() })

    }

    const { username, email, password } = req.body

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt)

    // insert a new user into the database

    db.run(

    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "user")',

    [username, email, hashedPassword],

    (err) => {

        if (err) {

            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed: users.email')) {

                res.status(400).json({ message: 'Email already exists, please choose a unique email' })

            }
            else {

                console.error(err.message)

                res.status(500).json({ message: 'Internal server error' })
            }

        }
        else {

            try {

                res.json({ message: 'User registered successfully' })
            }
            catch (err) {

                res.status(500).send('An error occurred while processing your request.')

            }

        }

    })

})

app.get('/login', (req, res) => {

    res.sendFile(__dirname + '/public/login.html')

})

app.get('/logout', (req, res) => {

    req.session.destroy()

    res.redirect('/login')

})



app.post('/login', loginLimiter, async (req, res) => {

    const { email, password } = req.body

    console.log('Login attempt:', email, password)

    db.get('SELECT * FROM users WHERE email = ?', email, async (err, row) => {

        if (err) {

            console.error('Database error:', err)

            return res.status(500).send('Internal server error')

        }

        if (!row) {

            console.log('Email not found:', email)

            return res.status(401).send('Invalid credentials')

        }

        console.log('Found user:', row);

        try {

            const isMatch = await bcrypt.compare(password, row.password)

            console.log('Password match:', isMatch)


            if (!isMatch) {

                console.log('Invalid password')

                return res.status(400).send('Invalid credentials')

            }

            req.session.loggedIn = true

            req.session.email = email

            req.session.username = row.name

            console.log("\n",req.session)

            console.log('\nLogin successful for:', email)

            res.redirect('/')

        }
        catch (err) {

            console.error('Bcrypt error:', err)

            res.status(500).send('Internal server error')

        }

    })

})

app.get('/', requireSession, async (req, res) => {

    res.sendFile(__dirname + '/public/home.html')

})

// Custom 401 Unauthorized middleware function

function custom401(req, res, next) {

    const error = new Error('Unauthorized')

    error.status = 401

    // TODO: Redirect to login page

    res.redirect('/login')

    //next(error)

}

// Custom 500 Internal Server Error middleware function

function custom500(err, req, res, next) {

    console.error(err.stack)

    res.status(500).send('Internal Server Error')

}

// Register the middleware functions

app.use(custom401)

app.use(custom500)

// Define a function to restart the server

// function restartServer() {

//     console.log('Restarting server...')

//     server.close(() => {

//         console.log('Server closed')

//         // Start the server again

//         server.listen(PORT, () => {

//             console.log(`\nPfcode-stations is running on: ${url}`)

//         })

//     })

// }

server.listen(PORT, () => {

    console.log(`\nPfcode-stations is running on: ${url}`)

})


io.on('connection', (socket) => {

    console.log('\nA user connected')

    socket.on('disconnect', () => {

        console.log('user disconnected')

    })
})


process.on('SIGINT', () => {

    db.close((err) => {

        if (err) {

            console.error(err.message)

        }

        console.log('\nClosed Pfcode-stations database connection.')

        process.exit(0)

    })

})