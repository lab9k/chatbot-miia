const { format, createLogger, transports } = require('winston');

const {
  combine, timestamp, label, printf,
} = format;

const myFormat = printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);

module.exports = name => createLogger({
  format: combine(label({ label: name }), timestamp(), myFormat),
  transports: [new transports.Console()],
});
