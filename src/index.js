/*

  a folder-ui AJAX database implementation that maps data
  from the REST api (index.js)
  
*/

import AjaxDB from 'folder-ui/lib/db/ajax'
import urls from 'folder-ui/lib/db/urls'

export default function diggerdb(opts = {}){

  const db = AjaxDB(Object.assign({}, opts, {
    urls:urls.digger
  }))

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

  const cutProcessor = (data) => {
    delete(data._digger.path)
    data._children = (data._children || []).map(cutProcessor)
    return data
  }

  const copyProcessor = (data) => {
    delete(data._digger.inode)
    delete(data._digger.path)
    delete(data._digger.diggerid)
    delete(data._digger.created)
    data._children = (data._children || []).map(copyProcessor)
    return data
  }

  // turn a backend digger tree result (which is a flat list)
  // into a frontend folder-ui tree
  const processTreeData = (data) => {
    
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

  return {
    loadTree:(context, done) => {
      db.loadTree(context, (err, data) => {
        if(err) return done(err)
        done(null, processTreeData(data))
      })
    },
    loadChildren:(context, id, done) => {
      db.loadChildren(context, id, (err, data) => {
        if(err) return done(err)
        done(null, data.map(encode))
      })
    },
    loadDeepChildren:(context, id, done) => {
      db.loadDeepChildren(context, id, (err, data) => {
        if(err) return done(err)
        done(null, processTreeData(data))
      })
    },
    loadItem:(context, id, done) => {
      db.loadItem(context, id, (err, data) => {
        if(err) return done(err)
        done(null, encode(data))
      })
    },
    addItem:(context, parent, item, done) => {
      db.addItem(context, parent, decode(Object.assign({}, item)), done)
    },
    saveItem:(context, id, data, done) => {
      db.saveItem(context, id, decode(Object.assign({}, data)), done)
    },
    deleteItem:(context, id, done) => {
      db.deleteItem(context, id, done)
    },
    filterPaste:(mode, item) => {
      return mode == 'cut' ? 
        cutProcessor(item) :
        copyProcessor(item)
    }
  }

}