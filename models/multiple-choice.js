module.exports = function(sequelize, DataTypes) {
    var MultipleChoice = sequelize.define('MultipleChoice', {
        aText: DataTypes.STRING,
        bText: DataTypes.STRING,
        cText: DataTypes.STRING,
        dText: DataTypes.STRING,
        eText: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                MultipleChoice.belongsTo(models.Question, {onDelete: 'CASCADE'});
            }
        }
    });
    return MultipleChoice;
};
