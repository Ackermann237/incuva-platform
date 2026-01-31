from flask_wtf import FlaskForm
from wtforms import StringField, DateField, FloatField, SelectField, TextAreaField
from wtforms.validators import DataRequired, Length, NumberRange


class ContractForm(FlaskForm):
    position = StringField('Poste', validators=[DataRequired(), Length(min=2, max=100)], render_kw={'readonly': True})
    start_date = DateField('Date de début', validators=[DataRequired()], format='%Y-%m-%d')
    salary = FloatField('Salaire annuel (€)', validators=[DataRequired(), NumberRange(min=0)])
    contract_type = SelectField('Type de contrat',
                                choices=[('CDI', 'CDI'), ('CDD', 'CDD'), ('Freelance', 'Freelance'),
                                         ('Stage', 'Stage')],
                                validators=[DataRequired()])
    description = TextAreaField('Description du contrat', validators=[DataRequired(), Length(max=300000)])
