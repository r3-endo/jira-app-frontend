import styles from "./App.module.css";
import { Grid, Avatar } from "@material-ui/core";
import {
  makeStyles,
  createTheme,
  MuiThemeProvider,
  Theme,
} from "@material-ui/core/styles";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PolymerIcon from "@material-ui/icons/Polymer";

import { useSelector, useDispatch } from "react-redux";
import {
  selectLoginUser,
  selectProfiles,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncUpdateProf,
} from "./features/auth/authSlice";
import {
  fetchAsyncGetTasks,
  fetchAsyncGetUsers,
  fetchAsyncGetCategory,
  selectEditedTask,
} from "./features/task/taskSlice";

import TaskList from "./features/task/TaskList";
import TaskForm from "./features/task/TaskForm";
import TaskDisplay from "./features/task/TaskDisplay";

import { AppDispatch } from "./app/store";
import { useEffect } from "react";

// 緑色のテーマを設定する
const theme = createTheme({
  palette: {
    secondary: {
      main: '#3cb371'
    }
  }
})

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    marginTop: theme.spacing(3),
    cursor: 'none',
  },
  avatar: {
    marginLeft: theme.spacing(1),
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  // storeからstateを取得する。取得したい対象のstateを変数として定義。
  const editedTask = useSelector(selectEditedTask);
  const loginUser = useSelector(selectLoginUser);
  const profieles = useSelector(selectProfiles);

  // ログインユーザに対応するプロフィールを取得する。オブジェクトの形で保持したい
  const loginProfile = profieles.filter(
    (prof) => prof.user_profile === loginUser.id
  )[0];

  // logoutした時はJWTトークンをローカルストレージから削除して、トップ画面に戻る
  const logout = () => {
    localStorage.removeItem("localJWT");
    window.location.href = '/';
  }

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    // undefinedの可能性もあるため、値があるときのみアクセス
    fileInput?.click();
  }

  // 画面のレンダリングが完了したら呼出されるライフサイクルメソッド
  // 最新の状態を保つため、別コンポーネントで変化等検知したら実行される
  useEffect(() => {
    const fetchBootLoader = async () => {
      // 非同期処理。APIレスポンスの結果をdispatchする
      await dispatch(fetchAsyncGetTasks());
      await dispatch(fetchAsyncGetMyProf());
      await dispatch(fetchAsyncGetUsers());
      await dispatch(fetchAsyncGetCategory());
      await dispatch(fetchAsyncGetProfs());
    };
    fetchBootLoader();
  }, [dispatch]);


  return (

    <MuiThemeProvider theme={ theme }>

    <div className={ styles.app_root}>
      <Grid container>
        <Grid item xs={ 4 }>
          <PolymerIcon className={classes.icon} />
        </Grid>
        <Grid item xs={ 4 }>
          <h1>Scrum Task Board</h1>
        </Grid>
        <Grid item xs={ 4 }>
          <div className={ styles.app__logout }>
            <button className={ styles.app__iconLogout } onClick={ logout }>
              <ExitToAppIcon fontSize="large" />
            </button>
            <input
                type="file"
                id="imageInput"
                hidden={true}
                onChange={(e) => {
                  dispatch(
                    fetchAsyncUpdateProf({
                      id: loginProfile.id,
                      img: e.target.files !== null ? e.target.files[0] : null,
                    })
                  );
                }}
            />
            <button className={ styles.app__btn } onClick={ handlerEditPicture }>
                <Avatar
                  className={ classes.avatar }
                  alt="avatar"
                  src={
                    loginProfile?.img !== null ? loginProfile?.img : undefined
                  }
                />
            </button>
          </div>
        </Grid>

        <Grid item xs={6}>
          <TaskList />
        </Grid>
        <Grid item xs={6}>
          <Grid
            container
            direction="column"
            alignItems="center"
            style={{ minHeight: "80vh" }}
          >
            <Grid item>
                { editedTask.status ? <TaskForm /> : <TaskDisplay /> }
              </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
    </MuiThemeProvider>
  );
}

export default App;
