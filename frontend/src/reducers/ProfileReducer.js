/* ProfileReducer.js — Cirqle v2
 * Fix: DATA_FETCHING now preserves previous user data instead of
 * keeping it null. This prevents the username/profile flicker
 * when navigating between profile pages.
 * All other cases untouched.
 */

import { actions } from "../actions";

const initialState = {
    user: null,
    posts: [],
    loading: false,
    error: null,
};

const profileReducer = (state, action) => {
    switch (action.type) {
        case actions.profile.DATA_FETCHING: {
            return {
                ...state,
                loading: true,
                error: null,
                // ✅ FIX: keep stale user/posts visible while loading
                // so navigating profiles doesn't flash blank
            };
        }

        case actions.profile.DATA_FETCHED: {
            return {
                ...state,
                loading: false,
                error: null,
                user: action.data.user,
                posts: action.data.posts,
            };
        }

        case actions.profile.DATA_FETCH_ERROR: {
            return {
                ...state,
                loading: false,
                error: action.error,
            };
        }

        case actions.profile.USER_DATA_EDITED: {
            return {
                ...state,
                loading: false,
                user: action.data,
            };
        }

        case actions.profile.IMAGE_UPDATED: {
            return {
                ...state,
                loading: false,
                user: {
                    ...state.user,
                    avatar: action.data.avatar,
                },
            };
        }

        case actions.profile.COVER_UPDATED: {
            return {
                ...state,
                loading: false,
                user: {
                    ...state.user,
                    cover_photo: action.data.cover_photo,
                },
            };
        }

        case actions.profile.FOLLOW_TOGGLED: {
            return {
                ...state,
                user: {
                    ...state.user,
                    isFollowing: action.data.isFollowing,
                    followersCount: action.data.followersCount,
                    followingCount: action.data.followingCount,
                },
            };
        }

        default:
            return state;
    }
};

export { initialState, profileReducer };
