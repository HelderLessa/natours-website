const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); // this is how to navigate a static folder

// Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));
// app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // registra detalhes sobre as solicitações HTTP recebidas pelo servidor
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests for the same IP
  windowMs: 60 * 60 * 1000, // === in 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // to use the limiter with our API

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // express.json() permite que o aplicativo receba solicitações com dados no formato JSON e os interprete automaticamente, transformando-os em objetos JavaScript.
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // parser data from cookies

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // filters out the $ in req.body, query strings, etc to avoid hacking

// Data sanitization against XSS
app.use(xss()); // protects the user from malicious hacking code

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 2) ROUTE HANDLERS

// GET
// app.get('/api/v1/tours', getAllTours);
// POST
// app.post('/api/v1/tours', createTour);
// GET with :id
// app.get('/api/v1/tours/:id', getTour);
// PATCH
// app.patch('/api/v1/tours/:id', updateTour);
// DELETE
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES
// Middleware for the specific route '/api/v1/tours'
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// to handle "invalid" routes:
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // if there is something as argument, express understands as an error handling
});

app.use(globalErrorHandler);

// 4) START SERVER
module.exports = app;
