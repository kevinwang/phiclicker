module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            validate: {isAlphanumeric: true}
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                User.belongsToMany(models.Course, {through: 'Registrations'});
            }
        }
    });
    return User;
};
