var socket = require('socket.io-client')(':3000/instructor');

var Histogram = require('./histogram');

var InstructorPanel = React.createClass({
    propTypes: {
        courseId: React.PropTypes.number.isRequired,
        questions: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },

    getInitialState: function() {
        return {
            activeQuestionId: -1,
            counts: null
        };
    },

    componentWillMount: function() {
        socket.on('connect', function() {
            socket.emit('initialize', this.props.courseId);
        }.bind(this));

        socket.on('active question', function(questionId) {
            this.setState({
                activeQuestionId: parseInt(questionId)
            });
            if (questionId !== null) {
                socket.emit('get counts', questionId);
            }
        }.bind(this));

        socket.on('update counts', function(counts) {
            this.setState({
                counts: counts
            });
        }.bind(this));
    },

    setActiveQuestion: function(questionId) {
        socket.emit('set active question', questionId);
        this.setState({
            activeQuestionId: questionId
        });
        socket.emit('get counts', questionId);
    },

    disable: function() {
        socket.emit('disable', this.props.courseId);
        this.setState({
            activeQuestionId: -1,
            counts: null
        });
    },

    render: function() {
        var questions = this.props.questions.map(function(question) {
            var activeText = (this.state.activeQuestionId === question.id ?
                              ' (active)' : '');
            return <li
                key={question.id}
                onClick={this.setActiveQuestion.bind(null, question.id)}>
                {question.text + activeText}
            </li>
        }.bind(this));
        var histogram = null;
        if (this.state.counts) {
            histogram = <div>
                <h3>Responses</h3>
                <Histogram counts={this.state.counts} />
            </div>;
        }
        return <div>
            <ul>{questions}</ul>
            {histogram}
            <button onClick={this.disable}>
                Stop accepting responses
            </button>
        </div>;
    }
});

module.exports = InstructorPanel;
