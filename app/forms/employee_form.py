from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length


class EmployeeForm(FlaskForm):
    first_name = StringField('Prénom', validators=[DataRequired()])
    name = StringField('Nom', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    position = StringField('Poste', validators=[DataRequired()])
    password = PasswordField('Mot de passe', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirmez le mot de passe', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Créer le compte')
