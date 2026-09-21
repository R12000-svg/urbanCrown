const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = new Set([
	config.frontendUrl,
	'http://localhost:5173',
	'http://127.0.0.1:5173',
]);

app.use(helmet());
app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.has(origin)) return callback(null, true);
		return callback(new Error('Origen no permitido por CORS'));
	},
	credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })); // protección básica

app.get('/', (req, res) => res.json({ status: 'ok', service: 'Urban Crown API' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;