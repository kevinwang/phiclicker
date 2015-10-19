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
                Course.belongsToMany(models.User, {as: 'Student', through: 'Registrations', onDelete: 'CASCADE'});
                Course.belongsToMany(models.User, {as: 'Instructor', through: 'Instructors', onDelete: 'CASCADE'});
            }
        }
    });
    return Course;
};
