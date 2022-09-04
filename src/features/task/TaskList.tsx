import React, { useState, useEffect } from "react";
import styles from "./TaskList.module.css";

import { makeStyles, Theme } from "@material-ui/core/styles";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import {
  Button,
  Avatar,
  Badge,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableSortLabel,
} from "@material-ui/core";

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncDeleteTask,
  selectTasks,
  editTask,
  selectTask,
} from "./taskSlice";
import { selectLoginUser, selectProfiles } from "../auth/authSlice";
import { AppDispatch } from "../../app/store";
import { initialState } from "./taskSlice";
import { SORT_STATE, READ_TASK } from "../types";

// デザインの設定
const useStyles = makeStyles((theme: Theme) => ({
  table: {
    tableLayout: 'fixed',
  },
  button: {
    margin: theme.spacing(3),
  },
  small: {
    margin: 'auto',
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

const TaskList: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const loginUser = useSelector(selectLoginUser);
  const profiles = useSelector(selectProfiles);
  // labelを配列にして格納する（テーブルの１行目）
  const columns = tasks[0] && Object.keys(tasks[0]);

  // sortに関わる処理。テーブルにはtasksを昇順で全て格納
  const [state, setState] = useState<SORT_STATE>({
    rows: tasks,
    order: 'desc',
    activekey: ''
  });
  // columnのソート順をハンドリングする関数
  // テーブルのソートボタンを押したときに呼び出される(列単位でカラムをソートできる)
  const handleClickSortColumn = (column: keyof READ_TASK) => {
    const isDesc = column === state.activekey && state.order === 'desc';
    const newOrder: ('asc' | 'desc') = isDesc ? 'asc' : 'desc';
    // 配列をコピーして、ソート順を上書きする
    const sortedRows = Array.from(state.rows).sort((a,b) => {
      if (b[column] < a[column]) {
        return newOrder === 'asc' ? 1 : -1;
      }
      if (a[column] < b[column]) {
        return newOrder === 'asc' ? -1 : 1;
      }
      return 0;
    });

    setState({
      rows: sortedRows,
      order: newOrder,
      activekey: column,
    });
  };

  // タスクのstateに変化があった場合は最新の状態にするために画面を再描画する
  useEffect(() => {
    setState((state) => ({
      ...state,
      rows: tasks,
    }));
  }, [tasks]);

  // taskのstatusに応じて、アイコンの色を変化させるための関数
  const renderSwitch = (statusName: string) => {
    switch (statusName) {
      case 'Not started':
        return (
          <Badge overlap="rectangular" variant='dot' color='error'>{ statusName }</Badge>
        );
      case 'On going':
        return (
          <Badge overlap="rectangular" variant='dot' color='primary'>{ statusName }</Badge>
        );
      case 'Done':
        return (
          <Badge overlap="rectangular" variant='dot' color='secondary'>{ statusName }</Badge>
        );
      default:
        return null;
    }
  };

  // ログインユーザと一致するアバターの画像を返却する
  const conditionalSrc = (user: number) => {
    const loginProfile = profiles.filter(
      (prof) => prof.user_profile === user
    )[0];
    return loginProfile?.img !== null ? loginProfile?.img : undefined;
  }

  return (
    <>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => {
          dispatch(
            editTask({
              id: 0,
              task: "",
              description: "",
              criteria: "",
              responsible: loginUser.id, // taskの担当者は自分にしておく
              status: "1",
              category: 1,
              estimate: 0,
            })
          );
          dispatch(selectTask(initialState.selectedTask));
        }}
      >Add new</Button>
      { tasks[0]?.task && ( //taskがある状態と時にテーブルを描画する
        <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            {columns.map( // 配列の要素を展開していく。表に表示したい内容だけ定義
              (column, colIndex) =>
                (column === "task" ||
                  column === "status" ||
                  column === "category" ||
                  column === "estimate" ||
                  column === "responsible" ||
                  column === "owner") && (
                  <TableCell align="center" key={ colIndex }>
                    <TableSortLabel // sort機能を有効にするため
                      active={ state.activekey === column }
                      direction={ state.order } // desc or asc
                      onClick={() => handleClickSortColumn(column)}
                    >
                      <strong>{column}</strong>
                    </TableSortLabel>
                  </TableCell>
                )
            )}
            <TableCell></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {state.rows.map((row, rowIndex) => (
            <TableRow hover key={rowIndex}>
              {Object.keys(row).map(
                (key, colIndex) =>
                  (key === "task" ||
                    key === "status_name" ||
                    key === "category_item" ||
                    key === "estimate") && (
                    <TableCell
                      align="center"
                      className={ styles.tasklist__hover }
                      key={ `${rowIndex} + ${colIndex}` } // 行と列の組み合わせで、どこにいるか一意に定まるため
                      onClick={() => {
                        dispatch(selectTask(row));
                        dispatch(editTask(initialState.editedTask)); // 編集中のタスクを初期化する
                      }}
                    >
                      {key === "status_name" ? (
                        renderSwitch(row[key]) // statusだけアイコンをつけたい
                      ) : (
                        <span>{row[key]}</span>
                      )}
                    </TableCell>
                  )
              )}
              <TableCell>
                <Avatar
                  className={classes.small}
                  alt="resp"
                  src={conditionalSrc(row["responsible"])}
                />
              </TableCell>
              <TableCell>
                <Avatar
                  className={classes.small}
                  alt="owner"
                  src={conditionalSrc(row["owner"])}
                />
              </TableCell>

              <TableCell align="center">
                <button
                  className={styles.tasklist__icon}
                  onClick={() => {
                    dispatch(fetchAsyncDeleteTask(row.id)); // ログインユーザがownerの時にボタンを有効化
                  }}
                  disabled={row["owner"] !== loginUser.id}
                >
                  <DeleteOutlineOutlinedIcon />
                </button>
                <button
                  className={styles.tasklist__icon}
                  onClick={() => dispatch(editTask(row))}
                  disabled={row["owner"] !== loginUser.id}
                >
                  <EditOutlinedIcon />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      )}
    </>
  )
}

export default TaskList