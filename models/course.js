module.exports = function(sequelize, DataTypes) {
    var Course = sequelize.define('Course', {
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        section: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                Course.belongsToMany(models.User, {through: 'Registrations'});
                Course.belongsToMany(models.User, {through: 'Instructors'});
            }
        }
    });
    return Course;
};
