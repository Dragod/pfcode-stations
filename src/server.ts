import express from 'express'

import morgan from "morgan"

import { fileURLToPath } from 'url'

import { dirname } from 'path'

//import path from 'path'

import sqlite3 from 'sqlite3'

import rateLimit from "express-rate-limit"

import bcrypt from "bcrypt"

import {body, validationResult} from "express-validator"

import session from "express-session"

import { v4 as uuidv4 } from 'uuid'

import helmet from "helmet"

import favicon from "serve-favicon"

import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const path = __dirname.replace("\\src", "")

declare module 'express-session' {
    interface SessionData {
        loggedIn: boolean
        email: string

    }

}

// open a database connection

let db = new sqlite3.Database('./pfcode-stations.db', (err: any) => {

    if (err) {

        console.error(err.message)

    }

    console.log('\nConnected to pfcode-stations database.')

})

const PORT = process.env.PORT || 3000

const HOST = process.env.HOST || "http://localhost"

const COOKIE_SECRET = process.env.COOKIE_SECRET

const REGISTER_ENDPOINT = process.env.REGISTER_ENDPOINT_ENABLED

console.log(REGISTER_ENDPOINT)

const oneDay = 1000 * 60 * 60 * 24;

let app = express()

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

app.use(morgan('dev'))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(express.static(path + '/public'))

app.use(favicon('favicon.ico'))

// Middleware to check for valid session

app.use(session({

    secret: `${COOKIE_SECRET}`,

    resave: false,

    saveUninitialized: false,

    cookie: { "maxAge": oneDay },

    name: 'pfcode-stations'

}))

const requireSession = (req: any, res: any, next: any) => {

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

function checkRegisterEndpoint(req: any, res: any, next: any) {

    if (REGISTER_ENDPOINT === 'true') {

      // If the endpoint is enabled, call the next middleware

        next()

    } else {

      // If the endpoint is disabled, return a 404 Not Found error

        res.sendFile(path + '/public/errors/404.html')

    }

}

// Create a rate limiter for login attempts

const loginLimiter = rateLimit({

    windowMs: 60 * 60 * 1000, // 1 hour

    max: 5, // 5 attempts allowed per hour

    message: 'Too many login attempts, please try again later.'

})

app.get('/api/session-data', requireSession, function(req: any, res: any) {

    res.json({

        user: req.session,

        isAuthenticated: req.session.loggedIn
    })

})

app.get('/api/stations', requireSession, (req: any, res: any) => {

    let sql = `SELECT * FROM stations ORDER BY name asc`

    db.all(sql, [], (err:any, rows: any) => {

        if (err) {

            return res.status(500).json(err)

        }

        //console.log(rows)

        res.json(rows)

    })

})

app.get('/api/stations/fav', requireSession, (req:any, res: any) => {

    const sql = 'SELECT * FROM stations WHERE favorite = 1 ORDER BY name ASC';

    db.all(sql, [], (err:any, rows: any) => {

        if (err) {

            return res.status(500).json(err)

        }

        console.log(rows)

        res.json(rows)

    })

})

app.get('/api/stations/:name', requireSession, (req: any, res: any) => {

    console.log(req.params.name)

    let sql = `SELECT id FROM stations where name = "${req.params.name}"`

    console.log(sql)

    db.get(sql, [], (err: any, row: any) => {

        if (err) {

            return res.status(500).json(err)

        }

        res.json(row)

    })

})

app.post('/api/stations', (req: any, res: any) => {

    let stationInsert = `INSERT INTO stations (name, url,favorite) VALUES ("${req.body.name}", "${req.body.url}", ${req.body.favorite})`

    console.log(stationInsert)

    db.run(stationInsert, [], (err: any, row: any) => {

        if (err) {

            return res.status(500).json(err)

        }

        res.send(row)

    })

})

app.put('/api/stations/:id',(req: any, res: any) => {

    let data = req.body

    let sql: string

    if (req.body.url === undefined || req.body.url === "" || req.body.url === null){

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

    db.run(sql, [], (err: any, row: any) => {

        if (err) {

            console.log(err)

            res.status(500).send('Error updating station')

        }

        res.send(row)

    })

})

app.delete('/api/stations/:id', (req: any, res: any) => {

    let sql = `DELETE FROM stations WHERE id = "${req.params.id}"`

    db.run(sql, [], (err: any, row: any) => {

        if (err) {

            return res.status(500).json(err)

        }

        res.send(row)

    })

})

app.get('/api/users',
    requireSession,
    (req: any, res: any) => {

        db.all('SELECT * FROM users', (err: any, rows: any) => {

            if (err) {

                console.error(err.message)

                res.status(500).json({message: 'Internal server error'});

            } else {

                res.json(rows)

            }

        })

    })

app.get('/register', checkRegisterEndpoint, (req: any, res: any) => {

    res.sendFile(path + '/public/register.html')

})

app.post('/api/users',[

    body('username').isLength({ min: 3 }).blacklist(' ').escape().withMessage('Username empty or min length < 3'),

    body('email').isEmail().normalizeEmail().escape().withMessage('Email empty or invalid'),

    body('password').isStrongPassword({minLength: 8}).withMessage(`
            Password empty or min length < 8`)

], async (req: any, res: any, next: any) => {

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

    (err: any) => {

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

app.get('/login',
    (req: any, res: any) => {

        res.sendFile(path + '/public/login.html')

    })

app.post('/login', loginLimiter, async (req: any, res: any) => {

    const { email, password } = req.body

    console.log('Login attempt:', email, password)

    db.get('SELECT * FROM users WHERE email = ?', email, async (err: any, row: any) => {

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

            console.log("Session:",req.session)

            console.log('Login successful for:', email)

            res.redirect('/')

        }
        catch (err) {

            console.error('Bcrypt error:', err)

            res.status(500).send('Internal server error')

        }

    })

})

app.get('/', requireSession, async (req: any, res: any) => {

    res.sendFile(path + '/public/home.html')

})

// Custom 401 Unauthorized middleware function

function custom401(req: any, res: any, next: any) {

    const error = new Error('Unauthorized')

    //error.status = 401

    // TODO: Redirect to login page

    res.redirect('/login')

    //next(error)

}

// Custom 500 Internal Server Error middleware function

function custom500(err: string, req: any, res: any, next: any) {

    console.error(err)

    res.status(500).send('Internal Server Error')

}

// Register the middleware functions

app.use(custom401)

app.use(custom500)


app.listen(PORT, () => {

    console.log(`\nPfcode-stations is running on: ${HOST}:${PORT}`)

})

process.on('SIGINT', () => {

    db.close((err: any) => {

        if (err) {

            console.error(err.message)

        }

        console.log('\nClosed Pfcode-stations database connection.')

        process.exit(0)

    })

})