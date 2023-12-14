require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const { isActiveRoute } = require('./server/helpers/routeHelpers');
const connectDB = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the database
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      ttl: 7 * 24 * 60 * 60, // Session TTL (optional, adjust as needed)
    }),
  })
);

app.use(express.static('public'));

// Templating engine
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
