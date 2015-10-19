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
                User.belongsToMany(models.Course, {as: 'RegisteredCourse', through: 'Registrations', onDelete: 'CASCADE'});
                User.belongsToMany(models.Course, {as: 'InstructedCourse', through: 'Instructors', onDelete: 'CASCADE'});
            }
        }
    });
    return User;
};
