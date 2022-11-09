const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const fs = require('fs');

const parse = (filePath) => {
    const code = fs.readFileSync(filePath).toString();
    const ast = parser.parse(code);
    return ast;
}

const parseAll = (all, callback) => {
    if(all && all.length > 0){
        for (let index = 0; index < all.length; index++) {
            let data = null;
            let isSuccess = false;
            let message = '';
            let filePath = all[index].filePath;
            try {
                data = parse(filePath);
                traverse.default(data, {
                    enter(path) {
                      if(path.isMemberExpression){
                        console.log(path.scope)
                      }
                    },
                });
                isSuccess = true;
            } catch (error) {
                isSuccess = false;
                message = error.message;
            }
            if(callback){
                const reply = JSON.stringify({
                    uid: all[index].uid,
                    isSuccess: isSuccess,
                    data: data,
                    message: message,
                    filePath: filePath,
                    progress: Math.floor( (index + 1) / all.length * 100)
                });
                callback(reply);
            }
        }
    }
}

module.exports = {
    parse,
    parseAll
};