import Store from 'beedle';
import { get, post } from './requests';

let _data = [];
let _saveUrl;
let _onPost;
let _onLoad;

const store = new Store({
  actions: {
    setData(context, data) {
      _data = data;
      context.commit('setData', _data);
    },

    load(context, { loadUrl, saveUrl, data }) {
      _saveUrl = saveUrl;
      if (_onLoad) {
        _onLoad().then(x => this.setData(context, x));
      } else if (loadUrl) {
        get(loadUrl).then(x => {
          if (data && data.length > 0 && x.length === 0) {
            data.forEach(y => {
              x.push(y);
            });
          }
          this.setData(context, x);
        });
      } else {
        this.setData(context, data);
      }
    },

    create(context, element) {
      _data.push(element);
      context.commit('setData', _data);
      this.save();
    },

    delete(context, element) {
      const index = _data.indexOf(element);
      _data.splice(index, 1);
      context.commit('setData', _data);
      this.save();
    },

    updateOrder(context, elements) {
      _data = elements;
      context.commit('setData', _data);
      this.save();
    },

    save() {
      if (_onPost) {
        _onPost({ task_data: _data });
      } else if (_saveUrl) {
        post(_saveUrl, { task_data: _data });
      }
    },
  },

  mutations: {
    setData(state, payload) {
      // eslint-disable-next-line no-param-reassign
      state.data = payload;
      return state;
    },
  },

  initialState: {
    data: [],
  },
});

store.setExternalHandler = (onLoad, onPost) => {
  _onLoad = onLoad;
  _onPost = onPost;
};

export default store;
