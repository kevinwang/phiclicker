var React = require('react');
var ReactDOM = require('react-dom');

var Remote = require('./remote.js')

ReactDOM.render(
    <Remote classId={1} />,
    document.getElementById('remote')
);
