module.exports = function(sequelize, DataTypes) {
    var Response = sequelize.define('Response', {
        UserId: {
            type: DataTypes.INTEGER,
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
                Response.belongsTo(models.User);
                Response.belongsTo(models.Question);
            }
        }
    });
    return Response;
};
