import Ember from 'ember';
import RSVP from 'rsvp';
import layout from './template';
import { getLayout } from "dom-ruler";

const { get, set, run, computed, computed: { reads } } = Ember;

// Key code mappings
const ESC              = 27,
      UP               = 38,
      DOWN             = 40,
      BACKSPACE        = 8,
      TAB              = 9,
      ENTER            = 13,
      SHIFT            = 16,
      CTRL             = 17,
      ALT              = 18,
      CAPS_LOCK        = 20,
      PAGE_DOWN        = 33,
      PAGE_UP          = 34,
      END              = 35,
      INSERT           = 36,
      DELETE           = 46,
      LEFT_WINDOW_KEY  = 91,
      RIGHT_WINDOW_KEY = 92,
      SELECT_KEY       = 93,
      NUM_LOCK         = 144,
      SCROLL_LOCK      = 145;

export default Ember.Component.extend({

  layout,

  classNames: ['single-select'],

  disabled: false,

  options: null,

  query: null,

  isExpanded: reads('popover.isActive'),

  displayOptions: computed('options.[]', 'disabledOptions.[]', {
    get() {
      let displayOptions = [];
      let options = get(this, 'options');
      let disabledOptions = get(this, 'disabledOptions') || [];

      for (let i = 0, len = options.length; i < len; i++) {
        displayOptions.push({
          disabled: disabledOptions.indexOf(options[i]) !== -1,
          value: options[i]
        });
      }
      return displayOptions;
    }
  }),

  enabledOptions: computed('displayOptions', {
    get() {
      let options = get(this, 'displayOptions');
      let enabledOptions = [];
      for (let i = 0, len = options.length; i < len; i++) {
        if (!options[i].disabled) {
          enabledOptions.push(options[i].value);
        }
      }
      return enabledOptions;
    }
  }),

  /**
    The item of the content that is currently selected.

    If the {{single-select}} has a prompt, then the value
    will by default be null. Otherwise, the value will
    be the first item in the content.

    @property value
    @type Object
    @default null
   */
  value: null,

  /**
    Interpret keyboard events
   */
  keyDown(evt) {
    let code = evt.keyCode ? evt.keyCode : evt.which;
    let chr = String.fromCharCode(code);
    let query = get(this, 'query');
    let popover = get(this, 'popover');
    let isExpanded = get(this, 'isExpanded');

    // If the meta key was held, don't do anything.
    if (evt.metaKey) {
      if (String.fromCharCode(code).toLowerCase() === 'a') {
        code = SELECT_KEY;
      } else {
        return;
      }
    }

    // Ignore all events if the select is disabled
    if (get(this, 'disabled')) { return; }

    switch (code) {
    case UP:
      if (isExpanded) {
        this.selectPrevious();
      }
      popover.show();

      break;
    case DOWN:
      if (isExpanded) {
        this.selectNext();
      }
      popover.show();

      break;
    case ESC:
      popover.hide();

      break;

    // Allow tabs to pass through
    case TAB:
    case ENTER:
      popover.hide();
      return;

    // A whitelist of characters to let the browser handle
    case SHIFT:
    case CTRL:
    case ALT:
    case CAPS_LOCK:
    case PAGE_DOWN:
    case PAGE_UP:
    case END:
    case INSERT:
    case DELETE:
    case LEFT_WINDOW_KEY:
    case RIGHT_WINDOW_KEY:
    case NUM_LOCK:
    case SCROLL_LOCK:
      return;

    case SELECT_KEY:
      break;

    case BACKSPACE:
      if (query) {
        this.search(query.slice(0, -1));
      }

      break;
    default:
      // Append
      if (query) {
        this.search(query + chr);
      } else {
        if (chr === ' ') {
          if (isExpanded) {
            popover.hide();
          } else {
            popover.show();
          }
        } else {
          popover.show();
          this.search(chr);
        }
      }
    }

    evt.preventDefault();
  },

  /**
    Selects the next item in the option list.
   */
  selectNext() {
    let options = get(this, 'enabledOptions');
    let value = get(this, 'value');
    let index;

    if (options) {
      if (value) {
        index = options.indexOf(value);
      } else {
        index = -1;
      }

      let option = Ember.A(options).objectAt(Math.min(index + 1, get(options, 'length') - 1));
      get(this, 'onchange')(option);
    }
  },

  /**
    Selects the previous item in the option list.
   */
  selectPrevious() {
    let options = get(this, 'enabledOptions');
    let value = get(this, 'value');
    let index;

    if (options) {
      if (value) {
        index = options.indexOf(value);
      } else {
        index = get(options, 'length');
      }

      let option = Ember.A(options).objectAt(Math.max(index - 1, 0));
      get(this, 'onchange')(option);
    }
  },

  /**
    Search by value of the object
   */
  'search-by': Ember.computed({
    get() {
      return [];
    },
    set(_, value) {
      if (value) {
        return value.split(' ');
      } else {
        return [];
      }
    }
  }),

  /**
    Locally iterate through options and find the
    best match. After 750 milliseconds of inactivity,
    the search is reset, allowing users to search again.
   */
  search(query) {
    set(this, 'query', query);

    if (this.__timer) {
      clearTimeout(this.__timer);
      this.__timer = null;
    }

    let options = get(this, 'enabledOptions');
    let searchBy = get(this, 'search-by');
    let searchIndex = get(this, 'searchIndex') || Ember.A();

    if (options && query && searchBy) {
      let length = get(options, 'length'),
          match = null,
          start,
          matchIndex;

      query = query.toUpperCase();

      // Continue searching from the index of
      // the last search match
      if (this.__matchIndex) {
        start = Math.min(this.__matchIndex, length - 1);
      } else {
        start = 0;
      }

      let hasMatch = function (option, text) {
        if (text.indexOf(query) === 0) {
          return true;
        }
        for (let i = 0; i < searchBy.length; i++) {
          if (String(get(option, searchBy[i]) || '').toUpperCase().indexOf(query) === 0) {
            return true;
          }
        }
        return false;
      };

      // Search from the current value
      // for the next match
      for (let i = start; i < length; i++) {
        let option = Ember.A(options).objectAt(i);
        let text = searchIndex.objectAt(i) || '';
        match = hasMatch(option, text);

        // Break on the first match,
        // if a user would like to match
        // a more specific entry, they should
        // continue typing
        if (match) {
          match = option;
          matchIndex = i;
          break;
        }
      }

      // Stash the last matched search item
      // so we can continue searching from that
      // index on consective searches
      if (match != null) {
        get(this, 'onchange')(match);
        this.__matchIndex = matchIndex;
      }
    }

    if (query) {
      this.__timer = setTimeout(() => {
        if (!this.isDestroyed) {
          run(this, 'resetSearch');
        }
      }, 750);
    }
  },

  /**
    Reset the `searchString`.
   */
  resetSearch() {
    this.__timer = null;
    this.__matchIndex = null;
    set(this, 'query', null);
  },

  willDestroyElement() {
    this._super(...arguments);
    if (this.__timer) {
      clearTimeout(this.__timer);
    }
  },

  didReceiveAttrs() {
    if (get(this, 'value')) {
      RSVP.hash({
        options: get(this, 'options'),
        value: get(this, 'value')
      }).then(({ options, value }) => {
        let index = options.indexOf(value);
        set(this, 'unwrappedValue', value);
        set(this, 'activeDescendantId', `single-select_option_${get(this, 'elementId')}_${index}`);
      });
    } else {
      set(this, 'activeDescendantId', null);
    }
  },

  didRender() {
    // Scroll to the active descendant
    if (get(this, 'isExpanded') && get(this, 'activeDescendantId')) {
      let $list = this.$(`#single-select_list_${get(this, 'elementId')}`);
      let listBox = getLayout($list[0]);
      let $option = this.$(`#${get(this, 'activeDescendantId')}`);
      let scrollTop = $list.scrollTop();
      let scrollBottom = scrollTop + listBox.padding.height;

      let optionTop = scrollTop + $option.position().top;
      let optionBottom = optionTop + getLayout($option[0]).margins.height;

      if (get(this, 'value') === get(this, 'options.0')) {
        $list.scrollTop(0);
      } else if (optionTop < scrollTop) {
        $list.scrollTop(optionTop - listBox.padding.top);
      } else if (optionBottom > scrollBottom) {
        $list.scrollTop(optionBottom - listBox.padding.height + listBox.padding.bottom);
      }
    }

    if (get(this, 'isExpanded') && get(this, 'searchIndex') == null) {
      let $options = this.$('ul li');
      set(this, 'searchIndex', Ember.A($options.map(function () {
        return this.innerHTML.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').toUpperCase();
      }).toArray()));
    }
  },

  actions: {
    select(value) {
      get(this, 'onchange')(value);
      get(this, 'popover').hide();
    },
    updatePrompt(hasPrompt) {
      set(this, 'hasPrompt', hasPrompt);
      if (!hasPrompt) {
        RSVP.hash({
          options: get(this, 'options'),
          value: get(this, 'value')
        }).then(({ value, options }) => {
          let firstOption = get(Ember.A(options || []), 'firstObject');
          if (this.isDestroyed && value != null) { return; }
          get(this, 'onchange')(firstOption);
        });
      }
    },
    show() {
      get(this, 'popover').show();
    }
  }

});
