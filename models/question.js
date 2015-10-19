module.exports = function(sequelize, DataTypes) {
    var Question = sequelize.define('Question', {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('mc'),
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                Question.belongsTo(models.Course, {onDelete: 'CASCADE'});
                Question.hasOne(models.MultipleChoice, {onDelete: 'CASCADE'});
            }
        }
    });
    return Question;
};
