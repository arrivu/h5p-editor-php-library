var H5PEditor = H5PEditor || {};
var ns = H5PEditor;

/**
 * Create a number picker field for the form.
 * 
 * @param {mixed} parent
 * @param {Object} field
 * @param {mixed} params
 * @param {function} setValue
 * @returns {ns.Number}
 */
ns.Number = function (parent, field, params, setValue) {
  this.field = field;
  this.value = params;
  this.setValue = setValue;
};

/**
 * Append field to wrapper.
 * 
 * @param {jQuery} $wrapper
 * @returns {undefined}
 */
ns.Number.prototype.appendTo = function ($wrapper) {
  var that = this;
  
  this.$item = ns.$(this.createHtml()).appendTo($wrapper);
  this.$errors = this.$item.children('.errors');
  var $inputs = this.$item.children('label').children('input');
  if ($inputs.length === 1) {
    this.$input = $inputs;
  }
  else {
    this.$range = $inputs.filter(':first');
    this.$input = this.$range.next();
  }
  
  this.$input.change(function () {
    // Validate
    var value = that.validate();
    
    if (value) {
      // Set param
      that.setValue(that.field, value);
      that.$range.val(value);
    }
  });
  
  if (this.$range !== undefined) {
    if (this.$range.attr('type') === 'range') {
      this.$range.change(function () {
        that.$input.val(that.$range.val()).change();
      });
    
      if (ns.$.browser.msie) {
        this.$range.css('margin-top', 0);
        this.$input.css('margin-top', '7px');
      }
    }
    else {
      this.$range.remove();
    }
  }
};

/**
 * Create HTML for the field.
 */
ns.Number.prototype.createHtml = function () {
  var input = ns.createText(this.field.description, this.value, 15);
  if (this.field.min !== undefined && this.field.max !== undefined && this.field.step !== undefined) {
    input = '<input type="range" min="' + this.field.min + '" max="' + this.field.max + '" step="' + this.field.step + '"' + (this.value === undefined ? '' : ' value="' + this.value + '"') + '/>' + input;  
  }
  
  var label = ns.createLabel(this.field, input);
  
  return ns.createItem(this.field.type, label);
};

/**
 * Validate the current text field.
 */
ns.Number.prototype.validate = function () {
  var that = this;
  
  var value = ns.trim(this.$input.val());
  var decimals = this.field.decimals !== undefined && this.field.decimals;
    
  if ((that.field.optional === undefined || !that.field.optional) && !value.length) {
    this.$errors.append(ns.createError(ns.t('requiredProperty', {':property': 'number field'})));
  }
  else if (decimals && !value.match(new RegExp('^-?[0-9]+(.|,)[0-9]{1,}$'))) {
    this.$errors.append(ns.createError(ns.t('onlyNumbers', {':property': 'number field'})));
  }
  else if (!decimals && !value.match(new RegExp('^-?[0-9]+$'))) {
    this.$errors.append(ns.createError(ns.t('onlyNumbers', {':property': 'number field'})));
  }
  else {
    if (decimals) {
      value = parseFloat(value.replace(',', '.'));
    }
    else {
      value = parseInt(value);
    }
    
    if (this.field.max !== undefined && value > this.field.max) {
      this.$errors.append(ns.createError(ns.t('exceedsMax', {':property': 'number field', ':max': this.field.max})));
    }
    else if (this.field.min !== undefined && value < this.field.min) {
      this.$errors.append(ns.createError(ns.t('exceedsMin', {':property': 'number field', ':min': this.field.min})));
    }
    else if (this.field.step !== undefined && value % this.field.step)  {
      this.$errors.append(ns.createError(ns.t('outOfStep', {':property': 'number field', ':step': this.field.step})));
    }
  }

  return ns.checkErrors(this.$errors, this.$input, value);
};

/**
 * Remove this item.
 */
ns.Number.prototype.remove = function () {
  this.$item.remove();
};

// Tell the editor what widget we are.
ns.widgets.number = ns.Number;