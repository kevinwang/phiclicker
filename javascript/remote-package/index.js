var React = require('react');
var ReactDOM = require('react-dom');

var Remote = React.createClass({
    render: function() {
        return <div>
            <button>A</button>
            <button>B</button>
            <button>C</button>
            <button>D</button>
        </div>;
    }
});

ReactDOM.render(
    <Remote />,
    document.getElementById('remote')
);
