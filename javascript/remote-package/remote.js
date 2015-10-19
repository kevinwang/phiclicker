var socket=require('socket.io-client')();

var MultipleChoice = require('./multiple-choice');

/**
 * Interface for students to submit responses.
 */
var Remote = React.createClass({
    propTypes: {
        courseId: React.PropTypes.number.isRequired,
        username: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
        return {
            questionText: '',
            questionType: 'disabled',
            mc: [],
            value: ''
        };
    },

    componentWillMount: function() {
        socket.on('connect', function() {
            socket.emit('request question', {
                username: this.props.username,
                courseId: this.props.courseId
            });
        }.bind(this));

        socket.on('set question', function(question) {
            this.setState({
                questionText: question.text,
                questionType: question.type,
                mc: question.mc,
                value: question.value
            });
        }.bind(this));

        socket.on('update value', function(value) {
            this.setState({
                value: value
            });
        }.bind(this));

        socket.on('question change', function() {
            socket.emit('request question', {
                username: this.props.username,
                courseId: this.props.courseId
            });
        }.bind(this));

        socket.on('disable', function() {
            this.setState({
                questionType: 'disabled'
            });
        }.bind(this));
    },

    getAnswerInputMethod: function() {
        switch (this.state.questionType) {
            case 'mc':
                return <MultipleChoice
                    choices={this.state.mc}
                    value={this.state.value}
                    handleSubmit={this.handleSubmit} />;
            case 'disabled':
            default:
                return null;
        }
    },

    handleSubmit: function(value) {
        socket.emit('response', {
            username: this.props.username,
            value: value
        });
    },

    render: function() {
        var questionText = (this.state.questionType === 'disabled' ?
                        'No active question' : this.state.questionText);
        return <div classNameName="stack">
            <div className="bound">
                <div id="question">
                    <h2>{questionText}</h2>
                </div>
                {this.getAnswerInputMethod()}
            </div>
        </div>;
    }
});

module.exports = Remote;
