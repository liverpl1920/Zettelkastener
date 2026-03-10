// ノート種別
export type NoteType = 'fleeting' | 'literature' | 'permanent' | 'index';

// ノートエンティティ
export interface Note {
  id: string;
  folgezettelId: string | null;
  type: NoteType;
  title: string;
  content: string;
  sourceTagIds: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  processedAt: string | null;
}

// リンクエンティティ
export interface Link {
  id: string;
  fromNoteId: string;
  toNoteId: string;
  createdAt: string;
}

// ノート作成入力
export interface CreateNoteInput {
  type: NoteType;
  content: string;
  title?: string;
  sourceTagIds?: string[];
  parentFolgezettelId?: string | null;
}

// バリデーション結果
export interface ValidationError {
  field: string;
  message: string;
  suggestion: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// IPC レスポンス共通型
export interface IPCResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
