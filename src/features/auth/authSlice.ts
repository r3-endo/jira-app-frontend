import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import axios from 'axios';
import {
  AUTH_STATE,
  CRED,
  LOGIN_USER,
  POST_PROFILE,
  PROFILE,
  JWT,
  USER,
} from "../types"

const initialState: AUTH_STATE = {
  isLoginView: true,
  loginUser: {
  id: 0,
  username: '',
  },
  profiles: [{ id: 0, user_profile: 0, img: null }],
};

// 認証のための非同期関数。バックエンドにjwtを作成してもらう
export const fetchAsyncLogin = createAsyncThunk(
  'auth/login',
  async (auth: CRED) => {
    const response = await axios.post<JWT>(
      `${process.env.REACT_APP_API_URL}/authen/jwt/create`,
      auth,
      {
        headers: {
          'content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
);

// 新規ユーザを作成するための非同期関数
export const fetchAsyncRegister = createAsyncThunk(
  'auth/register',
  async (auth: CRED) => {
    const response = await axios.post<USER>(
      `${process.env.REACT_APP_API_URL}/api/create/`,
      auth,
      {
        headers: {
          'content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
);

// ログインしているユーザのユーザ情報を取得するための非同期関数
export const fetchAsyncGetMyProf = createAsyncThunk(
  'auth/loginuser',
  async () => {
    const response = await axios.get<LOGIN_USER>(
      `${process.env.REACT_APP_API_URL}/api/loginuser/`,
      {
        headers: {
          // 認証にはローカルストレージに格納されているJWTを使用する
          Authorization: `JWT ${localStorage.localJWT}`
        }
      }
    );
    return response.data;
  }
);

// プロフィールを作成するための非同期関数
export const fetchAscyncCreateProf = createAsyncThunk(
  'auth/createProfile',
  async () => {
    const response = await axios.post<PROFILE>(
      `${process.env.REACT_APP_API_URL}/api/profile/`,
      { img: null },
      {
        headers: {
          'Content-type': 'application/json',
          // 認証にはローカルストレージに格納されているJWTを使用する
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return response.data;
  }
);

// プロフィールを取得するための非同期関数
export const fetchAsyncGetProfs = createAsyncThunk(
  'auth/getProfiles',
  async () => {
    const response = await axios.get<PROFILE[]>(
      `${process.env.REACT_APP_API_URL}/api/profile/`,
      {
        headers: {
          // 認証にはローカルストレージに格納されているJWTを使用する
          Authorization: `JWT ${localStorage.localJWT}`
        },
      }
    );
    return response.data;
  }
);

// プロフィールをアップデートするための非同期関数
export const fetchAsyncUpdateProf = createAsyncThunk(
  'auth/updateProfile',
  async (profile: POST_PROFILE) => {
    // 空のフォームデータを作成する。イメージがある場合はイメージの情報を追加する
    const uploadData = new FormData();
    profile.img && uploadData.append('img', profile.img, profile.img.name);
    const response = await axios.put<PROFILE>(
      `${process.env.REACT_APP_API_URL}/api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          'Content-Type': 'application/json',
          // 認証にはローカルストレージに格納されているJWTを使用する
          Authorization: `JWT ${localStorage.localJWT}`
        },
      }
    );
    return response.data;
  }
);

// actionとreducerを生成する
// action: Storeへ変更を伝える
// reducer: actionとstateを受け取り新たなstateを作る。Storeはreducerによって生成されたstateを保存する
export const authSlice = createSlice({
  // actionの名称
  name: 'auth',
  // reducerに渡す初期のstate
  initialState,
  // toggleModeという名称のactionを生成する
  reducers: {
    // loginとregisterを切り替えるためのモード。
    // loginが選択されたときはregisterモードをfalse。registerモードが選択されたときはloginモードがfalse。
    toggleMode(state) {
      state.isLoginView = !state.isLoginView;
    },
  },

  extraReducers: (builder) => {
    // loginが成功したときの後処理
    builder.addCase(
      fetchAsyncLogin.fulfilled,
      // fetchAsyncLoginの戻り値の型がJWTなのでPayloadの型も同様に指定する
      // payloadにはresponseのdataの値が入ってくるためJWTを型指定する
      (state, action: PayloadAction<JWT>) => {
        // ローカルストレージにアクセストークンを設定して、タスクの画面に遷移させる
        localStorage.setItem('localJWT', action.payload.access);
        action.payload.access && (window.location.href = '/tasks');
      }
    );
    // ログインユーザのプロフィール取得が成功した時の後処理
    builder.addCase(
      fetchAsyncGetMyProf.fulfilled,
      (state, action: PayloadAction<LOGIN_USER>) => {
        return {
          ...state,
          loginUser: action.payload,
        };
      }
    );
    // プロフィール取得が成功した時の後処理
    builder.addCase(
      fetchAsyncGetProfs.fulfilled,
      (state, action: PayloadAction<PROFILE[]>) => {
        return {
          ...state,
          profile: action.payload,
        };
      }
    );
    // プロフィール取得が成功した時の後処理
    builder.addCase(
      fetchAsyncUpdateProf.fulfilled,
      (state, action: PayloadAction<PROFILE>) => {
        return {
          ...state,
          // 更新後の内容に上書きして保存する
          profiles: state.profiles.map((prof) => 
            prof.id === action.payload.id ? action.payload : prof
          ),
        };
      }
    );
  }
});

export const { toggleMode } = authSlice.actions;

export const selectIsLoginView = (state: RootState) => state.auth.isLoginView;
export const selectLoginUser = (state: RootState) => state.auth.loginUser;
export const selectProfiles = (state: RootState) => state.auth.profiles;


export default authSlice.reducer;