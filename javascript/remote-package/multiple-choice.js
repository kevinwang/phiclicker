/**
 * Multiple choice input method.
 */
var MultipleChoice = React.createClass({
    propTypes: {
        choices: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        value: React.PropTypes.string,
        handleSubmit: React.PropTypes.func.isRequired
    },

    render: function() {
        var choices = this.props.choices.map(function(choice, index) {
            if (!choice) return null;
            var letter = String.fromCharCode(65 + index); // A, B, C, ...
            var choiceClass = 'choice' + (this.props.value === letter ? ' selected' : '');
            return <div
                className={choiceClass}
                key={letter}
                onClick={this.props.handleSubmit.bind(null, letter)}>
                <div className="box">
                    <p>{letter}</p>
                </div>
                <div className="textChoice">
                    <p>{choice}</p>
                </div>
            </div>;
        }.bind(this));
        return <div className="mc">
            {choices}
        </div>;
    }
});

module.exports = MultipleChoice;
