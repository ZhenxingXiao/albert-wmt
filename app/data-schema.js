const NodeSchema = {
    name: "Node",
    properties: {
        id: "string",
        name: "string",
        type: "string?",
        isDefined: "bool?",
        astFile: "string?",
        isClass: "bool",
        x: "int?",
        y: "int?",
        color: "string?",
        children: "Node[]"
    }
}

const LinkSchema = {
    name: "Link",
    properties: {
        source: "string",
        target: "string"
    }
}

const LocSchema = {
    name: "Loc",
    properties: {
        line: "int",
        column: "int",
        index: "int"
    }
}

const SubLinkSchema = {
    name: "SubLink",
    properties: {
        sourceNode: "string",
        targetNode: "string",
        sourceMember: "string",
        targetMember: "string",
        loc: "Loc?"
    }
}

class Node {
    constructor(_id, _name, _type, _children, _isDefined, _astFile, _isClass, _x, _y, _color){
        this.id = _id;
        this.name = _name;
        this.type = _type;
        this.children = _children;
        this.isDefined = _isDefined;
        this.astFile = _astFile;
        this.isClass = _isClass;
        this.x = _x;
        this.y = _y;
        this.color = _color;
    }
}

class Link {
    constructor(_source, _target){
        this.source = _source;
        this.target = _target;
    }
}

class SubLink {
    constructor(_sourceNode, _targetNode, _sourceMember, _targetMember, _loc){
        this.sourceNode = _sourceNode;
        this.targetNode = _targetNode;
        this.sourceMember = _sourceMember;
        this.targetMember = _targetMember;
        this.loc = _loc;
    }
}

class Loc{
    constructor(_line, _column, _index){
        this.line = _line;
        this.column = _column;
        this.index = _index;
    }
}

module.exports = {
    NodeSchema,
    LinkSchema,
    SubLinkSchema,
    LocSchema,
    Node,
    Link,
    SubLink,
    Loc
}