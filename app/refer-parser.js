const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');
const { REFER_ANALYSIS } = require('channels');
const { Node, Link, SubLink } = require('./data-schema');
const { NodeType, SubNodeType, NodeProperty } = require('./constants');

class NgReferAnalysisCallback {
    constructor(_winInstance){
        this.winInstance = _winInstance;
    }
    callback = (reply) => {
        if(this.winInstance){
            this.winInstance.webContents.send(REFER_ANALYSIS, reply);
        }
    }
}

class NgReferAnalysisParser {
    constructor(_cacheDir){
        this.cacheDir = _cacheDir;
    }

    #astSubffix = '.ast';
    #graph = {nodes: [], edges: [], subEdges: []};

    get graph(){
        const NodeCounter = {
            'controller': 1,
            'service': 1,
            'factory': 1,
            'directive': 1,
            'unknown': 1
        }
        for (const node of this.#graph.nodes) {
            if(node.type && NodeProperty[node.type]){
                node.color = NodeProperty[node.type].color;
                node.x = NodeProperty[node.type].pos;
                node.y = NodeCounter[node.type] * 100;
                NodeCounter[node.type] = NodeCounter[node.type] + 1;
            }
        }
        return this.#graph;
    }

    indexNode(nodes, node){
        if (nodes.length <= 0){
            return -1;
        }
        for (let index = 0; index < nodes.length; index++) {
            const element = nodes[index];
            if (element.name === node.name){
                return index;
            }
        }
        return -1;
    }

    indexEdge(edges, edge){
        if (edges.length <= 0){
            return -1;
        }
        for (let index = 0; index < edges.length; index++) {
            const element = edges[index];
            if (element.source === edge.source && element.target === edge.target){
                return index;
            }
        }
        return -1;
    }

    indexSubEdge(edges, edge){
        if (edges.length <= 0){
            return -1;
        }
        for (let index = 0; index < edges.length; index++) {
            const element = edges[index];
            if (element.targetNode === edge.targetNode
                && element.sourceNode === edge.sourceNode
                && element.targetMember === edge.targetMember
                && element.sourceMember === edge.sourceMember
                && element.loc?.line === edge.loc?.line){
                return index;
            }
        }
        return -1;
    }

    mergeGraph(_graph){
        if (_graph.nodes.length <= 0){
            return;
        }
        for (const item of _graph.nodes) {
            const index = this.indexNode(this.#graph.nodes, item);
            if (index < 0){
                this.#graph.nodes.push(item);
            }else{
                if (!this.#graph.nodes[index].isDefined){
                    this.#graph.nodes[index] = item;
                }
            }
        }
        for (const item of _graph.edges) {
            const index = this.indexEdge(this.#graph.edges, item);
            if (index < 0){
                this.#graph.edges.push(item);
            }
        }
        for (const item of _graph.subEdges) {
            const index = this.indexSubEdge(this.#graph.subEdges, item);
            if (index < 0){
                this.#graph.subEdges.push(item);
            }
        }
    }


    readFileAndParseAST(filePath){
        const ext = path.extname(filePath);
        const fileName = path.basename(filePath, ext);
        const code = fs.readFileSync(filePath).toString();
        const ast = babel.parse(code);
        const astFileName = fileName + this.#astSubffix;
        fs.writeFileSync(
            path.join(this.cacheDir, astFileName),
            JSON.stringify(ast),
            {
                flag: 'w+'
            }
        );
        return {
            ast: ast,
            astFile: astFileName
        };
    }

    exactNodeAndEdge(_ast, _astFilePath){
        const _graph = {nodes: [], edges: [], subEdges: []};
        const calleeNodeCache = [];
        babel.traverse(_ast, {
            enter(path) {
              if(path.isCallExpression() 
                && path.node.callee?.object?.name?.toLowerCase() === 'app'
                && path.node.arguments?.length > 0
              ){
                const _node = new Node(
                    path.node.arguments[0]?.value,
                    path.node.arguments[0]?.value,
                    path.node.callee?.property?.name ? path.node.callee?.property?.name?.toLowerCase() : NodeType.Unknown,
                    [],
                    true,
                    _astFilePath,
                    true
                );
                if (path.node.arguments?.length > 1){
                    const elements = path.node.arguments[1].elements;
                    if (elements && elements.length > 2){
                        for (let index = 0; index < elements.length - 1; index++) {
                            const element = elements[index];
                            if (element && element.value && element.value !== '$scope'){
                                const relatedNode = new Node(
                                    element.value,
                                    element.value,
                                    NodeType.Unknown,
                                    [],
                                    false,
                                    void 0,
                                    true
                                );
                                const edge = new Link(
                                    _node.id,
                                    relatedNode.id
                                );
                                calleeNodeCache.push(element.value);
                                _graph.nodes.push(relatedNode);
                                _graph.edges.push(edge);
                            }
                        }
                        const _functionElement = elements[elements.length - 1];
                        if (_functionElement
                            && _functionElement.type === 'FunctionExpression'
                            && _functionElement.body
                            && _functionElement.body.body
                            && _functionElement.body.body.length > 0){
                            const _members = _functionElement.body.body;
                            for (let index = 0; index < _members.length; index++) {
                                const _member = _members[index];
                                let childNodeName = void 0;
                                let childNodeType = void 0;
                                switch(_member.type){
                                    case 'VariableDeclaration':
                                        if(_member.declarations.length > 0){
                                            childNodeName = _member.declarations[0]?.id?.name;
                                            childNodeType = SubNodeType.InternalVariable;
                                        }
                                        break;
                                    case 'FunctionDeclaration':
                                        childNodeName = _member.id?.name;
                                        childNodeType = SubNodeType.InternalFunction;
                                        path.traverse({
                                            FunctionDeclaration(path1){
                                                if(path1.node?.id?.name === childNodeName){
                                                    path1.traverse({
                                                        CallExpression(path2){
                                                            const targetName = path2.node?.callee?.object?.name;
                                                            const targetMember = path2.node?.callee?.property?.name;
                                                            if(inNodeArray(targetName, calleeNodeCache) && targetMember){
                                                                const loc = path2.node?.callee?.loc?.start;
                                                                const subLink = new SubLink(
                                                                    _node.name,
                                                                    targetName,
                                                                    childNodeName,
                                                                    targetMember,
                                                                    loc
                                                                );
                                                                _graph.subEdges.push(subLink);
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                        break;
                                    case 'ExpressionStatement':
                                        if(_member.expression?.left?.property?.name && _member.expression?.right?.type){
                                            childNodeName = _member.expression?.left?.property?.name;
                                            if(_member.expression?.right?.type === 'FunctionExpression'){
                                                childNodeType = SubNodeType.MemberFunction;
                                                path.traverse({
                                                    ExpressionStatement(path1){
                                                        if(path1.node?.expression?.left?.property?.name === childNodeName){
                                                            path1.traverse({
                                                                CallExpression(path2){
                                                                    const targetName = path2.node?.callee?.object?.name;
                                                                    const targetMember = path2.node?.callee?.property?.name;
                                                                    if(inNodeArray(targetName, calleeNodeCache) && targetMember){
                                                                        const loc = path2.node?.callee?.loc?.start;
                                                                        const subLink = new SubLink(
                                                                            _node.name,
                                                                            targetName,
                                                                            childNodeName,
                                                                            targetMember,
                                                                            loc
                                                                        );
                                                                        _graph.subEdges.push(subLink);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            }else{
                                                childNodeType = SubNodeType.MemberVariable;
                                            }
                                        }
                                        break;
                                }
                                if(childNodeName && childNodeType){
                                    const childNode = new Node(
                                        childNodeName,
                                        childNodeName,
                                        childNodeType,
                                        void 0,
                                        true,
                                        void 0,
                                        false
                                    );
                                    _node.children.push(childNode);
                                }
                            }
                        }
                    }
                }
                _graph.nodes.push(_node);
              }
            },
        });
        return _graph;
    }

    parse(all, callback){
        if(all && all.length > 0){
            for (let index = 0; index < all.length; index++) {
                let res = null;
                let isSuccess = false;
                let message = '';
                let filePath = all[index].filePath;
                try {
                    res = this.readFileAndParseAST(filePath);
                    const fileGraph = this.exactNodeAndEdge(res.ast, res.astFile);
                    this.mergeGraph(fileGraph);
                    isSuccess = true;
                } catch (error) {
                    isSuccess = false;
                    message = error.message;
                }
                if(callback){
                    const reply = JSON.stringify({
                        uid: all[index].uid,
                        isSuccess: isSuccess,
                        data: res.ast,
                        message: message,
                        filePath: filePath,
                        progress: Math.floor( (index + 1) / all.length * 100)
                    });
                    callback(reply);
                }
            }
        }
    }
}

function inNodeArray(item, array){
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element === item){
            return true;
        }
    }
    return false;
}

module.exports = {
    NgReferAnalysisParser,
    NgReferAnalysisCallback
};