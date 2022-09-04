import React, { useState } from 'react';
import styles from './Auth.module.css';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { TextField, Button } from '@material-ui/core';

import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import {
  toggleMode,
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchAscyncCreateProf,
  selectIsLoginView
} from './authSlice';

// material-uiの設定
const useStyles = makeStyles((theme: Theme) => ({
  // buttonのマージンをつける
  button: {
    margin: theme.spacing(3), // 24pxのマージン
  },
}));

const Auth: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const isLoginView: boolean = useSelector(selectIsLoginView);
  // このコンポーネント内で管理するState
  const [credential, setCredential] = useState({ username: '', password: ''});

  // ユーザがログイン画面で入力を行うときに常に呼び出される
  const handleInputChange =(event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const name = event.target.name; // 属性名
    setCredential({ ...credential, [name]: value });
  };

  // ログインボタン押下時に呼び出される
  const login = async () => {
    if (isLoginView) {
      await dispatch(fetchAsyncLogin(credential));
    } else {
      const result = await dispatch(fetchAsyncRegister(credential));
      // 正常終了した場合に後続処理のログインとプロフィール作成を行う
      if (fetchAsyncRegister.fulfilled.match(result)) {
        await dispatch(fetchAsyncLogin(credential));
        await dispatch(fetchAscyncCreateProf());
      }
    }
  };

  return (
    <div className={styles.auth__root}>
      <h1>{isLoginView ? 'Login': 'Register'}</h1>
      <br />
      <TextField
        InputLabelProps={{
         shrink: true, // 左上に表示するため
        }}
        label='UserName'
        type='text'
        name='username'
        value={ credential.username }
        onChange={ handleInputChange }
      />
      <br />
      <TextField
        InputLabelProps={{
         shrink: true, // 左上に表示するため
        }}
        label='Password'
        type='password'
        name='password'
        value={ credential.password }
        onChange={ handleInputChange }
      />
      <Button
        variant='contained' // 塗りつぶし
        color='primary'
        size='small'
        className={ classes.button } // ボタンの周りにマージン
        onClick={ login }
      >
        { isLoginView ? 'Login' : 'Register' }
      </Button>
      <span onClick={() => dispatch(toggleMode())}>
        { isLoginView ? 'Create new account ?' : 'Back to Login' }
      </span>
    </div>
  );
}

export default Auth