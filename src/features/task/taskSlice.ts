import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import axios from 'axios';
import { READ_TASK, POST_TASK, TASK_STATE, USER, CATEGORY } from '../types';

// タスクを取得するための非同期関数
export const fetchAsyncGetTasks = createAsyncThunk(
  'task/getTask',
  async () => {
  const res = await axios.get<READ_TASK[]>(
    `${process.env.REACT_APP_API_URL}/api/tasks/`,
    {
      headers: {
        Authorization: `JWT ${ localStorage.localJWT }`,
      }
    }
  );
  return res.data;
  }
);

// タスクを作成するための非同期関数
export const fetchAsyncCreateTask = createAsyncThunk(
  'task/createTask',
  async (task: POST_TASK) => {
    const res = await axios.post<READ_TASK>(
      `${process.env.REACT_APP_API_URL}/api/tasks/`,
      task,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${ localStorage.localJWT }`,
        },
      }
    );
    return res.data;
  }
);

// タスクを更新するための非同期関数
export const fetchAsyncUpdateTask = createAsyncThunk(
  'task/updateTask',
  async (task: POST_TASK) => {
    const res = await axios.put<READ_TASK>(
      `${process.env.REACT_APP_API_URL}/api/tasks/${task.id}/`,
      task,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${ localStorage.localJWT }`,
        },
      }
    );
    return res.data;
  }
);

// タスクを削除するための非同期関数
export const fetchAsyncDeleteTask = createAsyncThunk(
  "task/deleteTask",
  async (id: number) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/${id}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    // 後続処理を行うためidを戻り値で返しておく
    return id;
  }
);

// ユーザを取得するための非同期関数
export const fetchAsyncGetUsers = createAsyncThunk(
  'task/getUsers',
  async () => {
    const res = await axios.get<USER[]>(
      `${process.env.REACT_APP_API_URL}/api/users/`,
      {
        headers: {
          Authorization: `JWT ${ localStorage.localJWT }`,
        },
      }
    );
    return res.data;
  }
);

// カテゴリーを取得するための非同期関数
export const fetchAsyncGetCategory = createAsyncThunk(
  'task/getCategory',
  async () => {
    const res = await axios.get<CATEGORY[]>(
      `${process.env.REACT_APP_API_URL}/api/category/`,
      {
        headers: {
          Authorization: `JWT ${ localStorage.localJWT }`,
        },
      }
    );
    return res.data;
  }
);

// カテゴリーを作成するための非同期関数
export const fetchAsyncCreateCategory = createAsyncThunk(
  'task/createCategory',
  async (item: string) => {
    const res = await axios.post<CATEGORY>(
      `${process.env.REACT_APP_API_URL}/api/category/`,
      { item: item },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${ localStorage.localJWT }`,
        },
      }
    );
    return res.data;
  }
);


export const initialState: TASK_STATE = {
  tasks: [
    {
      id: 0,
      task: '',
      description: '',
      criteria: '',
      owner: 0,
      owner_username: '',
      responsible: 0,
      responsible_username: '',
      estimate: 0,
      category: 0,
      category_item: '',
      status: '',
      status_name: '',
      created_at: '',
      updated_at: '',
    },
  ],
  editedTask: {
    id: 0,
    task: '',
    description: '',
    criteria: '',
    responsible: 0,
    estimate: 0,
    category: 0,
    status: ''
  },
  selectedTask: {
    id: 0,
    task: '',
    description: '',
    criteria: '',
    owner: 0,
    owner_username: '',
    responsible: 0,
    responsible_username: '',
    estimate: 0,
    category: 0,
    category_item: '',
    status: '',
    status_name: '',
    created_at: '',
    updated_at: '',
  },
  users: [
    {
      id: 0,
      username: '',
    },
  ],
  category: [
    {
      id: 0,
      item: ''
    },
  ],
};

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    // 編集対象のタスクの状態を変更するためのアクション
    editTask(state, action: PayloadAction<POST_TASK>) {
      state.editedTask = action.payload;
    },
    // 選択されたタスクの状態を監視するためのアクション
    selectTask(state, action: PayloadAction<READ_TASK>) {
      state.selectedTask = action.payload;
    }
  },
  // APIの処理が終わった後に実行される処理
  extraReducers: (builder) => {
    builder.addCase(
      fetchAsyncGetTasks.fulfilled,
      (state, action: PayloadAction<READ_TASK[]>) => {
        return {
          ...state,
          // fetchAsyncGetTasksのres.dataが格納されている
          tasks: action.payload,
        };
      }
    );
    // JWTトークンの期限切れの際などは再度ログインに促す
    builder.addCase(fetchAsyncGetTasks.rejected, () => {
      window.location.href = '/';
    });
    builder.addCase(
      fetchAsyncCreateTask.fulfilled,
      (state, action: PayloadAction<READ_TASK>) => {
        return {
          ...state,
          // 追加したデータが先頭に格納されるようにする
          tasks: [action.payload, ...state.tasks],
          editedTask: initialState.editedTask,
        };
      }
    );
    builder.addCase(fetchAsyncCreateTask.rejected, () => {
      window.location.href = "/";
    });
    builder.addCase(
      fetchAsyncUpdateTask.fulfilled,
      (state, action: PayloadAction<READ_TASK>) => {
        return {
          ...state,
          // 更新されたデータで配列を作り直す
          tasks: state.tasks.map((t) =>
            t.id === action.payload.id ? action.payload : t
          ),
          editedTask: initialState.editedTask,
          selectedTask: initialState.selectedTask,
        };
      }
    );
    builder.addCase(fetchAsyncUpdateTask.rejected, () => {
      window.location.href = "/";
    });
    builder.addCase(
      fetchAsyncDeleteTask.fulfilled,
      (state, action: PayloadAction<number>) => {
        return {
          ...state,
          // 削除したタスク以外で配列を作り直す。
          tasks: state.tasks.filter((t) => t.id !== action.payload),
          // 編集対象と選択対象を初期化しておく
          editedTask: initialState.editedTask,
          selectedTask: initialState.selectedTask,
        };
      }
    );
    builder.addCase(fetchAsyncDeleteTask.rejected, () => {
      window.location.href = "/";
    });
    builder.addCase(
      fetchAsyncGetUsers.fulfilled,
      (state, action: PayloadAction<USER[]>) => {
        return {
          ...state,
          users: action.payload
        }
      }
    );
    builder.addCase(
      fetchAsyncGetCategory.fulfilled,
      (state, action: PayloadAction<CATEGORY[]>) => {
        return {
          ...state,
          category: action.payload,
        };
      }
    );
    builder.addCase(
      fetchAsyncCreateCategory.fulfilled,
      (state, action: PayloadAction<CATEGORY>) => {
        return {
          ...state,
          // カテゴリー追加に成功したら末尾にデータを追加する
          category: [...state.category, action.payload],
        };
      }
    );
    builder.addCase(fetchAsyncCreateCategory.rejected, () => {
      window.location.href = "/";
    });
  }
});

export const { editTask, selectTask } = taskSlice.actions;
export const selectSelectedTask = (state: RootState) => state.task.selectedTask;
export const selectEditedTask = (state: RootState) => state.task.editedTask;
export const selectTasks = (state: RootState) => state.task.tasks;
export const selectUsers = (state: RootState) => state.task.users;
export const selectCategory = (state: RootState) => state.task.category;
export default taskSlice.reducer;
