var socket=require('socket.io-client')();

var MultipleChoice = require('./multiple-choice');

/**
 * Interface for students to submit responses.
 */
var Remote = React.createClass({
    propTypes: {
        classId: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            question: 'How many chucks can a wood chuck chuck?',
            questionType: 'mc',
            questionData: [
                'Aravind is a fuckboi',
                'Nexus of cheating',
                'Sunbathing with my doggie',
                'Lorem Ipsum'
            ]
        };
    },

    componentWillMount: function() {
        socket.on('connect', function() {
            socket.emit('initialize', this.props.classId);
        }.bind(this));

        socket.on('update counts', function(counts) {
            console.log(counts);
        });
    },

    getAnswerInputMethod: function() {
        switch (this.state.questionType) {
            case 'mc':
                return <MultipleChoice
                    choices={this.state.questionData}
                    handleSubmit={this.handleSubmit} />;
        }
    },

    handleSubmit: function(value) {
        switch (this.state.questionType) {
            case 'mc':
                console.log(value);
                socket.emit('answer', value);
                break;
        }
    },

    render: function() {
        return <div classNameName="stack">
            <div className="bound">
                <div id="question">
                    <h2>{this.state.question}</h2>
                </div>
                {this.getAnswerInputMethod()}
            </div>
        </div>;
    }
});

module.exports = Remote;
