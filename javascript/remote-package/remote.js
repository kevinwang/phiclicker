var socket = require('socket.io-client')(':3000/remote');

var MultipleChoice = require('./multiple-choice');
var convertMath = require('./convert-math');

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

    componentDidUpdate: function(prevProps, prevState) {
        if (this.state.questionText !== prevState.questionText) {
            convertMath(this.refs.questionText);
        }
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
        return <div className="stack">
            <div className="bound">
                <div id="question">
                    <h2 ref="questionText">{questionText}</h2>
                </div>
                {this.getAnswerInputMethod()}
            </div>
        </div>;
    }
});

module.exports = Remote;
