import Ember from "ember";
import { getLayout } from "dom-ruler";

var get = Ember.get;
var next = Ember.run.next;
var cancel = Ember.run.cancel;
var later = Ember.run.later;
var set = Ember.set;

var guidFor = Ember.guidFor;

var filterBy = Ember.computed.filterBy;
var reads = Ember.computed.reads;
var alias = Ember.computed.alias;

var RSVP = Ember.RSVP;
var $ = Ember.$;

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

  classNames: ['select-menu'],

  disabled: false,

  options: Ember.computed(function () {
    return [];
  }),

  activeOptions: filterBy('options', 'disabled', false),

  activeDescendants: filterBy('options', 'selected'),
  activeDescendant: reads('activeDescendants.firstObject'),

  searchString: null,
  isActive: alias('popup.isActive'),

  prompt: null,

  addTarget: Ember.on('didInsertElement', function () {
    next(this, function () {
      get(this, 'popup').addTarget(get(this, 'label'), {
        on: "click hold"
      });
    });
  }),

  /**
    The item of the content that is currently selected.

    If the {{select-menu}} has a prompt, then the value
    will by default be null. Otherwise, the value will
    be the first item in the content.

    @property value
    @type Object
    @default null
   */
  value: Ember.computed(function (key, value) {
    cancel(this._value$timer);

    if (value && value.then) {
      let menu = this;
      RSVP.Promise.cast(value).then(function (unwrappedValue) {
        if (menu.isDestroyed) { return; }
        set(menu, 'value', unwrappedValue);
      });
    } else if (value == null) {
      this._value$timer = next(this, function () {
        if (this.isDestroyed || get(this, 'prompt')) { return; }
        let firstOption = get(this, 'options.firstObject.value');
        if (firstOption && this._value$value == null) {
          set(this, 'value', firstOption);
        }
      });
    }

    this._value$value = value;
    return value;
  }),


  _shouldShowPrompt: Ember.on('init', Ember.observer('options.[]', 'prompt', function () {
    let hasPrompt = !!get(this, 'prompt');
    if (!hasPrompt && get(this, 'value') == null) {
      this.notifyPropertyChange('value');
    }
  })),

  /**
    Interpret keyboard events
   */
  keyDown(evt) {
    let code = (evt.keyCode ? evt.keyCode : evt.which);
    let search = get(this, 'searchString');
    let label = get(this, 'label');
    let popup = get(this, 'popup');
    let isActive = get(this, 'isActive');

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
      if (isActive) {
        this.selectPrevious();
      }
      popup.activate(label);

      break;
    case DOWN:
      if (isActive) {
        this.selectNext();
      }
      popup.activate(label);

      break;
    case ESC:
      popup.deactivate();

      break;

    // Allow tabs to pass through
    case TAB:
    case ENTER:
      popup.deactivate();
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
      if (search) {
        set(this, 'searchString', search.slice(0, -1));
      }

      break;
    default:
      let chr = String.fromCharCode(code);

      // Append
      if (search) {
        set(this, 'searchString', search + chr);
      } else {
        if (chr === ' ') {
          if (isActive) {
            popup.deactivate();
          } else {
            popup.activate(label);
          }
        } else {
          popup.activate(label);
          set(this, 'searchString', chr);
        }
      }
    }

    evt.preventDefault();
  },

  /**
    Selects the next item in the option list.
   */
  selectNext() {
    let options = get(this, 'activeOptions');
    let activeDescendant = get(this, 'activeDescendant');
    let index;

    if (options) {
      if (activeDescendant) {
        index = options.indexOf(activeDescendant);
      } else {
        index = -1;
      }

      let option = options.objectAt(Math.min(index + 1, get(options, 'length') - 1));
      if (option !== activeDescendant) {
        set(this, 'activeDescendant', option);
        set(this, 'value', get(option, 'value'));
      }
    }
  },

  /**
    Selects the previous item in the option list.
   */
  selectPrevious() {
    let options = get(this, 'activeOptions');
    let activeDescendant = get(this, 'activeDescendant');
    let index;

    if (options) {
      if (activeDescendant) {
        index = options.indexOf(activeDescendant);
      } else {
        index = get(options, 'length');
      }

      let option = options.objectAt(Math.max(index - 1, 0));
      if (option !== activeDescendant) {
        set(this, 'activeDescendant', option);
        set(this, 'value', get(option, 'value'));
      }
    }
  },

  /**
    Search by value of the object
   */
  "search-by": alias('searchBy'),
  searchBy: Ember.computed({
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
  searchStringDidChange: Ember.observer('searchString', function () {
    if (this.__timer) {
      cancel(this.__timer);
    }

    let options = get(this, 'activeOptions');
    let search = get(this, 'searchString');
    let searchBy = get(this, 'searchBy');

    if (options && search && searchBy) {
      let length = get(options, 'length'),
          match = null,
          start,
          matchIndex;

      search = search.toUpperCase();

      // Continue searching from the index of
      // the last search match
      if (this.__matchIndex) {
        start = Math.min(this.__matchIndex, length - 1);
      } else {
        start = 0;
      }

      let hasMatch = function (option) {
        for (let i = 0; i < searchBy.length; i++) {
          if (String(get(option, searchBy[i]) || '').toUpperCase().indexOf(search) === 0) {
            return true;
          }
        }
        return false;
      };

      // Search from the current value
      // for the next match
      for (let i = start; i < length; i++) {
        let option = options.objectAt(i);
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
        set(this, 'activeDescendant', match);
        set(this, 'value', get(match, 'value'));
        this.__matchIndex = matchIndex;
      }
    }

    if (search) {
      this.__timer = later(this, this.resetSearch, 750);
    }
  }),

  /**
    Reset the `searchString`.
   */
  resetSearch() {
    this.__timer = null;
    this.__matchIndex = null;
    set(this, 'searchString', null);
  },

  scrollActiveDescendantIntoView: Ember.on('init', Ember.observer('activeDescendant', function () {
    let activeDescendant = get(this, 'activeDescendant');

    if (activeDescendant && get(this, 'isActive') && get(this, 'list')) {
      let list = get(this, 'list');
      let listBox = getLayout(get(this, 'list.element'));
      let height = getLayout(get(this, 'popup.element')).padding.height;
      let option = get(activeDescendant, 'element');
      let scrollTop = list.$().scrollTop();
      let scrollBottom = scrollTop + listBox.padding.height;

      let optionTop = scrollTop + $(option).position().top;
      let optionBottom = optionTop + getLayout(option).margins.height;

      if (optionTop < scrollTop) {
        list.$().scrollTop(optionTop - listBox.padding.top);
      } else if (optionBottom > scrollBottom) {
        list.$().scrollTop(optionBottom - height + listBox.padding.bottom);
      }
    }
  })),

  actions: {
    select(option) {
      get(this, 'onchange')(get(option, 'value'));
    }
  }

});
