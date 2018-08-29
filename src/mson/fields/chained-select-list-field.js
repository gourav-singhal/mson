// TODO: Should be able to covert this to a JSON field, right?

import ListField from './list-field';
import ChainedSelectField from './chained-select-field';

export default class ChainedSelectListField extends ListField {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'options',
            component: 'Field'
          },
          {
            name: 'blankString',
            component: 'TextField'
          }
        ]
      }
    });
  }

  constructor(props) {
    super(props);
    this.set({ allowDelete: true });
  }

  _newField(name) {
    return new ChainedSelectField({
      name: name,
      label: name === 0 ? this.get('label') : undefined,
      required: name === 0 ? this.get('required') : false,
      blankString: this.get('blankString'),
      block: true,
      // fullWidth: this.get('fullWidth'),
      options: this.get('options')
    });
  }

  _setFieldOptions(name) {
    const field = this._getOrCreateField(name);
    field.set({ options: this.get('options') });
  }

  _onFieldCreated(field /* onDelete */) {
    field.on('value', value => {
      // Create last field if the last field is not blank and we are allowed to add more fields
      if (!this._isLastFieldBlank() && this.canAddMoreFields(value)) {
        this._createField();
      }

      this._calcValue();
    });
  }

  _setOptions(options) {
    // Set the options for the first field
    this._setFieldOptions(0);

    // Set options for all fields
    this.eachField(field => field.set({ options }));
  }

  set(props) {
    super.set(props);

    if (props.options !== undefined) {
      this._setOptions(props.options);
    }
  }

  clone() {
    const clonedField = super.clone();

    // Clear the fields as the listeners now have the wrong references to the fields, etc...
    clonedField._fields.clear();

    // Create the first field
    clonedField._setOptions(this.get('options'));

    // Copy any existing value
    clonedField.setValue(this.getValue());

    return clonedField;
  }
}
