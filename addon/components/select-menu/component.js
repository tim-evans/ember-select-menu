import Ember from 'ember';
import RSVP from 'rsvp';
import layout from './template';
import { getLayout } from "dom-ruler";

var get = Ember.get;
var cancel = Ember.run.cancel;
var later = Ember.run.later;
var set = Ember.set;

var alias = Ember.computed.alias;

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

  classNames: ['select-menu'],

  disabled: false,

  options: null,

  query: null,
  isExpanded: alias('popover.isActive'),

  /**
    The item of the content that is currently selected.

    If the {{select-menu}} has a prompt, then the value
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
      let chr = String.fromCharCode(code);

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
    let options = get(this, 'options');
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
    let options = get(this, 'options');
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
      return ['label'];
    },
    set(_, value) {
      return value.split(' ');
    }
  }),

  /**
    Locally iterate through options and find the
    best match. After 750 milliseconds of inactivity,
    the search is reset, allowing users to search again.
   */
  search(query) {
    if (this.__timer) {
      cancel(this.__timer);
    }

    let options = get(this, 'options');
    let searchBy = get(this, 'searchBy');
    set(this, 'query', query);

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

      let hasMatch = function (option) {
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
        match = hasMatch(option);

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
      this.__timer = later(this, this.resetSearch, 750);
    }
  },

  /**
    Reset the `searchString`.
   */
  resetSearch() {
    this.__timer = null;
    this.__matchIndex = null;
  },

  didReceiveAttrs() {
    if (get(this, 'value')) {
      let index = get(this, 'options').indexOf(get(this, 'value'));
      set(this, 'activeDescendantId', `select-menu_option_${get(this, 'elementId')}_${index}`);
    } else {
      set(this, 'activeDescendantId', null);
    }
  },

  didRender() {
    // Scroll to the active descendant
    if (get(this, 'isExpanded') && get(this, 'activeDescendantId')) {
      let $list = this.$(`#select-menu_list_${get(this, 'elementId')}`);
      let listBox = getLayout($list[0]);
      let $option = this.$(`#${get(this, 'activeDescendantId')}`);
      let scrollTop = $list.scrollTop();
      let scrollBottom = scrollTop + listBox.padding.height;

      let optionTop = scrollTop + $option.position().top;
      let optionBottom = optionTop + getLayout($option[0]).margins.height;

      if (optionTop < scrollTop) {
        $list.scrollTop(optionTop - listBox.padding.top);
      } else if (optionBottom > scrollBottom) {
        $list.scrollTop(optionBottom - listBox.padding.height + listBox.padding.bottom);
      }
    }
  },

  actions: {
    updatePrompt(hasPrompt) {
      set(this, 'hasPrompt', hasPrompt);
      if (!hasPrompt) {
        RSVP.resolve(get(this, 'options')).then((options) => {
          return RSVP.resolve(get(Ember.A(options || []), 'firstObject'));
        }).then((option) => {
          if (this.isDestroyed && get(this, 'value') != null) { return; }
          get(this, 'onchange')(option);
        });
      }
    }
  }

});
