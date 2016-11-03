# digger-folder-ui-db


[folder-ui](https://github.com/binocarlos/folder-ui) AJAX database that connects to a [digger-folder-ui](https://github.com/binocarlos/digger-folder-ui) backend

## install

```bash
$ npm install digger-folder-ui-db --save
$ yarn add digger-folder-ui-db
```

## usage


```javascript
var diggerFolderDB = require('digger-folder-ui/lib/db')

import React, { Component, PropTypes } from 'react'
import { Route, IndexRoute } from 'react-router'
import boilerapp from 'boiler-frontend'
import Page from 'boiler-frontend/lib/components/Page'

import FolderReducer from 'folder-ui/lib/reducer'
import BasicTemplate from 'folder-ui/lib/templates/basic'

import DiggerDB from 'digger-folder-ui-db'

import {
  USER_DETAILS,
  TYPES,
  TABLE_FIELDS,
  LIBRARY
} from './schema'

import About from './containers/About'
import Dashboard from './containers/Dashboard'

const ItemRoutes = (auth) => {
  return BasicTemplate({
    types:TYPES,
    tableFields:TABLE_FIELDS,
    library:LIBRARY,
    name:'items',
    path:'items',
    onEnter:auth.user,
    db:DiggerDB({
      // the url of your backend digger-folder-ui server
      base:'/v1/api/db/apples/pears'
    })
  })
}

boilerapp({
  mountElement:document.getElementById('mount'),
  reducers:{
    items:FolderReducer('items')
  },
  dashboard:Dashboard,
  userDetailsSchema:USER_DETAILS,
  getRoutes:(auth) => {
    return (
      <Route>
        <Route component={Page}>
          <Route path="about" component={About} />
        </Route>
        {ItemRoutes(auth)}
      </Route>
    )
  }
})
```
