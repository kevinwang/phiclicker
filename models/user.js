module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {isAlphanumeric: true}
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return User;
};
