var Histogram = React.createClass({
    propTypes: {
        counts: React.PropTypes.object.isRequired
    },

    render: function() {
        return <div>
            <div>A: {'*'.repeat(this.props.counts.A)}</div>
            <div>B: {'*'.repeat(this.props.counts.B)}</div>
            <div>C: {'*'.repeat(this.props.counts.C)}</div>
            <div>D: {'*'.repeat(this.props.counts.D)}</div>
            <div>E: {'*'.repeat(this.props.counts.E)}</div>
        </div>;
    }
});

module.exports = Histogram;
