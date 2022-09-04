// コンポーネントで使用するデータ型をまとめて定義する
/*authSlice.ts*/
export type LOGIN_USER = {
  id: number;
  username: string
}

export interface FILE extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

export type PROFILE = {
  id: number;
  user_profile: number;
  img: string | null;
}

export type POST_PROFILE = {
  id: number;
  img: File | null;
}

export type CRED = {
  username: string;
  password: string;
}

export type JWT = {
  refresh: string;
  access: string;
}

export type USER = {
  id: number;
  username: string;
}

export type AUTH_STATE = {
  isLoginView: boolean;
  loginUser: LOGIN_USER;
  profiles: PROFILE[];
}

/*taskSlice.ts*/
// シリアライザーで定義したもの
export type READ_TASK = {
  id: number;
  task: string;
  description: string;
  criteria: string;
  status: string;
  status_name: string;
  category: number;
  category_item: string;
  estimate: number;
  responsible: number;
  responsible_username: string;
  owner: number;
  owner_username: string;
  created_at: string;
  updated_at: string;
}

export type POST_TASK  = {
  id: number;
  task: string;
  description: string;
  criteria: string;
  status: string;
  category: number;
  estimate: number;
  responsible: number;
}

export type CATEGORY = {
  id: number;
  item: string;
}

export type TASK_STATE = {
  tasks: READ_TASK[];
  editedTask: POST_TASK;
  selectedTask: READ_TASK;
  users: USER[];
  category: CATEGORY[];
}

/*TaskList.tsx */
// taskの表示順を制御するため
export type SORT_STATE = {
  rows: READ_TASK[];
  order: 'desc' | 'asc';
  activekey: string;
}