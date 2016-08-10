/**
 * @file
 * @author zdying
 */

var colors = require('colors');
var stdout = process.stdout;

module.exports = {
    printTitle: function(title){
        // ✔ ✘  ✗  ➤
        // ◊
        this.print('◊ ' + title + ' ', 'grey')
    },
    print: function(str, color, newLineTerminal){
        stdout.write((str + (newLineTerminal === true ? '\n' : ''))[color]);
    },
    printSuccessIcon: function(){
        this.print('✓', 'green', true)
    },
    printErrorIcon: function(){
        this.print('✗', 'red', true)
    },
    hideCusror: function(){
        // Show terminal cursor
        stdout.write('\x1B[?25l');
    },
    showCursor: function(){
        // Show terminal cursor
        stdout.write('\x1B[?25h');
    },

    clearLine: function(){
        stdout.clearLine();
        stdout.cursorTo(0);
    },

    cursorTo: function(pos){
        stdout.cursorTo(pos);
    }
};