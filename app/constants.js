const DEV_URL = 'http://localhost:3000';
const PUB_URL = 'file://${__dirname}/../build/index.html';
const HOST_KEY = 'host';
const PORT_KEY = 'port';
const USER_KEY = 'user';
const PWD_KEY = 'password';
const APP_KEY = '31415926535897932384626433832795028841971693993751058209749445923';
const ERR_INFO = {
    GET_ALL_WIN: 'Failed to get all the window.',
    CREATE_MAIN_WIN: 'Failed to create main window.',
    QUITE_QPP: 'Failed to quit application.'
};

module.exports = { DEV_URL, PUB_URL, APP_KEY, ERR_INFO};