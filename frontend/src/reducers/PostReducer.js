import { actions } from "../actions";

const initialState = {
    posts: [],
    loading: false,
    error: null,
};

const postReducer = (state, action) => {
    switch (action.type) {
        case actions.post.DATA_FETCHING: {
            return {
                ...state,
                loading: true,
            };
        }

        case actions.post.DATA_FETCHED: {
            return {
                ...state,
                // already latest from Laravel, but sort just in case
                posts: [...action.data].sort(
                    (a, b) => new Date(b.createAt) - new Date(a.createAt),
                ),
                loading: false,
            };
        }

        case actions.post.DATA_FETCH_ERROR: {
            return {
                ...state,
                loading: false,
                error: action.error,
            };
        }

        case actions.post.DATA_CREATED: {
            return {
                ...state,
                loading: false,
                // add new post to top
                posts: [action.data, ...state.posts],
            };
        }

        case actions.post.POST_DELETED: {
            return {
                ...state,
                loading: false,
                posts: state.posts.filter((item) => item.id !== action.data),
            };
        }

        case actions.post.DATA_EDITED: {
            return {
                ...state,
                loading: false,
                // replace edited post in list
                posts: state.posts.map((p) =>
                    p.id === action.data.id ? action.data : p,
                ),
            };
        }

        default: {
            return state;
        }
    }
};

export { initialState, postReducer };
