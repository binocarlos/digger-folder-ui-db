/*

  a folder-ui AJAX database implementation that maps data
  from the REST api (index.js)
  
*/

import AjaxDB from 'folder-ui/lib/db/ajax'

export default function diggerdb(opts = {}){

  // database -> reducer
  const encode = (data) => {
    data.id = data._digger.diggerid
    return data
  }

  // reducer -> database
  const decode = (data) => {
    delete(data.id)
    return data
  }

  const loadTree = (data) => {
    
    // make a map of _digger.path and _digger.inode
    var pathMap = {}
    var rootNodes = []

    data = data.map(function(item){
      // give each node a proper id (based on _digger.diggerid)
      item = encode(item)
      pathMap[item._digger.path + '/' + item._digger.inode] = item
      return item
    })

    Object.keys(pathMap || {}).forEach(function(path){

      var item = pathMap[path]
      var parts = path.split('/')
      var inode = parts.pop()
      var parentPath = parts.join('/')
      var parent = pathMap[parentPath]

      // it's a root node
      if(!parent){
        rootNodes.push(item)
      }
      // we have a parent
      else{
        var children = parent.children || []
        children.push(item)
        parent.children = children
      }

    })

    return rootNodes
  }

  const loadChildren = (data) => {
    return data.map(encode)
  }

  const loadItem = (data) => {
    return encode(data)
  }

  const addItem = (data) => {
    return data
  }

  // remove the top-level id (this is a folder-ui thing)
  // remove the path based _digger properties
  const saveItem = (data) => {
    return decode(Object.assign({}, data))
  }

  // we don't need a delete it's just the id
  const pasteItems = (data = []) => {
    return data.map(d => decode(Object.assign({}, d)))
  }

  opts.filters = Object.assign({}, opts.mapFns, {
    loadTree,
    loadChildren,
    loadItem,
    saveItem,
    addItem,
    pasteItems
  })

  return AjaxDB(opts)

}