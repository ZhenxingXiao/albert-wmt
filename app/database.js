function InsertGraph(realm, graph){
    realm.write(() => {
        for (const n of graph.nodes) {
            realm.create('Node', n);
        }
        for (const e of graph.edges) {
            realm.create('Link', e);
        }
        for (const s of graph.subEdges) {
            realm.create('SubLink', s);
        }
    });
}

function DeleteAllObjects(realm){
    realm.write(() => {
        realm.deleteAll();
    });
}

module.exports = {
    DeleteAllObjects,
    InsertGraph,
}