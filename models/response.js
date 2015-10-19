module.exports = function(sequelize, DataTypes) {
    var Response = sequelize.define('Response', {
        UserUsername: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        QuestionId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        value: { // A-E or text input, depending on question type
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                Response.belongsTo(models.User, {onDelete: 'CASCADE'});
                Response.belongsTo(models.Question, {onDelete: 'CASCADE'});
            }
        }
    });
    return Response;
};
