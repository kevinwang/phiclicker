var React = require('react');
var socket = require('socket.io-client')();

/**
 * Interface for students to submit responses.
 */
var Remote = React.createClass({
    propTypes: {
        classId: React.PropTypes.number.isRequired
    },

    componentWillMount: function() {
        socket.on('connect', function() {
            socket.emit('initialize', this.props.classId);
        }.bind(this));

        socket.on('update counts', function(counts) {
            console.log(counts);
        });
    },

    handleButtonPress: function(e) {
        socket.emit('answer', e.currentTarget.value);
    },

    render: function() {
        return <div>
            <button value="A" onClick={this.handleButtonPress}>A</button>
            <button value="B" onClick={this.handleButtonPress}>B</button>
            <button value="C" onClick={this.handleButtonPress}>C</button>
            <button value="D" onClick={this.handleButtonPress}>D</button>
            <button value="E" onClick={this.handleButtonPress}>E</button>
        </div>;
    }
});

module.exports = Remote;
