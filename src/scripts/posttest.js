/**
 * @file
 * @author zdying
 */

'use strict';

var path = require('path');
var fse = require('fs-extra');

fse.remove(path.join(process.cwd(), 'normal'));
fse.remove(path.join(process.cwd(), 'vue-todo'));