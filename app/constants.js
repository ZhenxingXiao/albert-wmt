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
    QUITE_QPP: 'Failed to quit application.',
    INIT_NG_REFER_PARSER: 'Failed to init ng refer parser.',
    FAILED_OPEN_REALM: 'Failed to open realm',
};
const APP_DATA_DIR_KEY = 'appData';
const DATA_CACHE_DIR = 'app_data_cache';

const NodeType = {
    Controller: 'controller',
    Service: 'service',
    Unknown: 'unknown',
    Factory: 'factory',
    Directive: 'directive'
}

const SubNodeType = {
    InternalVariable: 'internal_variable',
    InternalFunction: 'internal_function',
    MemberVariable: 'member_variable',
    MemberFunction: 'member_function'
}

const NodeProperty = {
    'controller': {
        pos: 0,
        color: '#ffc6ff'
    },
    'service': {
        pos: 2000,
        color: '#bdb2ff'
    },
    'factory': {
        pos: 4000,
        color: '#a0c4ff'
    },
    'directive': {
        pos: 6000,
        color: '#9bf6ff'
    },
    'unknown': {
        pos: 8000,
        color: '#caffbf'
    }
}

const APP_ID = 'albertwmt20221122151007'

module.exports = { 
    DEV_URL, 
    PUB_URL, 
    APP_KEY,
    APP_ID, 
    ERR_INFO,
    APP_DATA_DIR_KEY,
    DATA_CACHE_DIR,

    NodeType,
    NodeProperty,
    SubNodeType
};